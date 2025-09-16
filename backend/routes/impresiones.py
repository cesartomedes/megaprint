from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta
from database import get_db
from models import Impresion, Vendedora, Deuda, Catalogo
from routes.config_helper import get_limits
from schemas import ImpresionCreate, ImpresionResponse
import win32print
import win32ui
import win32con
from PIL import Image
import threading
import traceback
import os
from .print_utils import print_file 

router = APIRouter()


# ── Función para crear o actualizar deuda

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "uploads", "catalogos", "pdf")

# ── Worker de impresión ──────────────────────────────────────
def _print_worker(file_path: str, cantidad: int = 1):
    from .print_utils import print_file
    for _ in range(cantidad):
        print_file(file_path)
    
# ── Crear o actualizar deuda ──────────────────────────────────
def crear_o_actualizar_deuda(usuario_id: int, monto_extra: float, fecha: date, tipo: str,
                              db: Session, catalogo_id: int = None, impresion_id: int = None,
                              cantidad_excedida: int = 0):
    if monto_extra <= 0:
        return None

    if tipo == "diaria":
        deuda = db.query(Deuda).filter(
            Deuda.vendedora_id == usuario_id,
            func.date(Deuda.fecha) == fecha,
            Deuda.tipo == "diaria",
            Deuda.estado == "pendiente"
        ).first()
    else:  # semanal
        inicio_semana = fecha - timedelta(days=fecha.weekday())
        deuda = db.query(Deuda).filter(
            Deuda.vendedora_id == usuario_id, 
            Deuda.fecha >= inicio_semana,
            Deuda.tipo == "semanal",
            Deuda.estado == "pendiente"
        ).first()

    if deuda:
        deuda.monto = monto_extra
        deuda.cantidad_excedida = cantidad_excedida
        deuda.impresion_id = impresion_id
        deuda.catalogo_id = catalogo_id
        deuda.referencia = f"{cantidad_excedida} excedió el límite"
        deuda.fecha = fecha
    else:
        deuda = Deuda(
            vendedora_id=usuario_id,
            catalogo_id=catalogo_id,
            impresion_id=impresion_id,
            monto=monto_extra,
            cantidad_excedida=cantidad_excedida,
            referencia=f"{cantidad_excedida} excedió el límite",
            estado="pendiente",
            fecha=fecha,
            tipo=tipo
        )
        db.add(deuda)

    db.commit()
    db.refresh(deuda)
    return deuda

# ── Endpoint crear impresión ─────────────────────────────────
@router.post("/", response_model=ImpresionResponse)
def crear_impresion(impresion: ImpresionCreate, db: Session = Depends(get_db)):
    print("Columnas reconocidas por SQLAlchemy:", Impresion.__table__.columns.keys())

    try:
        # Validaciones iniciales
        usuario_existente = db.query(Impresion).filter(Impresion.usuario_id == impresion.usuario_id).first()
        if not usuario_existente:
            print(f"⚠️ Usuario ID {impresion.usuario_id} no tiene impresiones previas, revisa existencia")
        catalogo = db.query(Catalogo).filter(Catalogo.id == impresion.catalogo_id).first()
        if not catalogo:
            raise HTTPException(status_code=404, detail=f"Catálogo ID {impresion.catalogo_id} no encontrado")

        hoy = impresion.fecha
        inicio_semana = hoy - timedelta(days=hoy.weekday())

        # Totales actuales
        total_hoy = db.query(func.sum(Impresion.cantidad_impresa)).filter(
            Impresion.usuario_id == impresion.usuario_id,
            Impresion.fecha == hoy
        ).scalar() or 0

        total_semana = db.query(func.sum(Impresion.cantidad_impresa)).filter(
            Impresion.usuario_id == impresion.usuario_id,
            Impresion.fecha >= inicio_semana
        ).scalar() or 0

        nuevo_total_hoy = total_hoy + impresion.cantidad_impresa
        nuevo_total_semana = total_semana + impresion.cantidad_impresa

        # Límites
        limites = get_limits(db)
        LIMITE_DIARIO = limites.get("diario", 30)
        LIMITE_SEMANAL = limites.get("semanal", 150)
        COSTO_EXTRA = limites.get("costoExcedente", 0.5)

        exceso_diario = max(nuevo_total_hoy - LIMITE_DIARIO, 0)
        exceso_semanal = max(nuevo_total_semana - LIMITE_SEMANAL, 0)
        exceso_total = max(exceso_diario, exceso_semanal)
        costo_extra = exceso_total * COSTO_EXTRA if exceso_total > 0 else 0

        # Crear impresión
        nueva_impresion = Impresion(
            usuario_id=impresion.usuario_id,
            catalogo_id=impresion.catalogo_id,
            fecha=hoy,
            cantidad_impresa=impresion.cantidad_impresa,
            exceso=exceso_total,
            costo_extra=costo_extra
        )

        db.add(nueva_impresion)
        db.commit()
        db.refresh(nueva_impresion)
        print(f"✅ Impresión registrada: ID {nueva_impresion.id}, usuario {impresion.usuario_id}")

        # ── Imprimir archivo en segundo plano ──────────────────────
        file_name = catalogo.archivo or os.path.basename(catalogo.url or "")
        file_path = os.path.join(UPLOAD_DIR, file_name)

        print(f"Intentando imprimir: {file_path}") 

        if os.path.exists(file_path):
            threading.Thread(target=_print_worker, args=(file_path,impresion.cantidad_impresa), daemon=True).start()
        else:
            print(f"⚠️ Archivo de catálogo no encontrado: {file_path}")

        # ── Crear deudas si hay exceso ────────────────────────────
        from .impresiones_utils import crear_o_actualizar_deuda
        if exceso_diario > 0:
            deuda_diaria = crear_o_actualizar_deuda(
                usuario_id=impresion.usuario_id,
                monto_extra=exceso_diario * COSTO_EXTRA,
                fecha=hoy,
                tipo="diaria",
                db=db,
                catalogo_id=impresion.catalogo_id,
                impresion_id=nueva_impresion.id,
                cantidad_excedida=exceso_diario
            )
            print(f"⚠️ Deuda diaria creada/actualizada: {deuda_diaria.id if deuda_diaria else 'N/A'}")
        if exceso_semanal > 0:
            deuda_semanal = crear_o_actualizar_deuda(
                usuario_id=impresion.usuario_id,
                monto_extra=exceso_semanal * COSTO_EXTRA,
                fecha=hoy,
                tipo="semanal",
                db=db,
                catalogo_id=impresion.catalogo_id,
                impresion_id=nueva_impresion.id,
                cantidad_excedida=exceso_semanal
            )
            print(f"⚠️ Deuda semanal creada/actualizada: {deuda_semanal.id if deuda_semanal else 'N/A'}")

        return nueva_impresion

    except Exception as e:
        print("❌ Error en crear_impresion:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")
@router.get("/impresiones/")
def obtener_todas_impresiones(db: Session = Depends(get_db)):
    vendedoras = db.query(Vendedora).all()
    resultado = []

    for v in vendedoras:
        hoy = date.today()
        inicio_semana = hoy - timedelta(days=hoy.weekday())

        impresiones_hoy = (
            db.query(Impresion)
            .filter(
                Impresion.usuario_id == v.id,
                func.date(Impresion.creado_en) == hoy
            )
            .order_by(Impresion.creado_en.desc())
            .all()
        )

        impresiones_semana = (
            db.query(Impresion)
            .filter(
                Impresion.usuario_id == v.id,
                func.date(Impresion.creado_en) >= inicio_semana
            )
            .order_by(Impresion.creado_en.desc())
            .all()
        )

        # IDs de catálogos
        ids_catalogos = set([imp.catalogo_id for imp in impresiones_hoy] +
                            [imp.catalogo_id for imp in impresiones_semana])
        catalogos = db.query(Catalogo).filter(Catalogo.id.in_(ids_catalogos)).all()
        catalogos_info = {cat.id: {"id": cat.id, "nombre": cat.nombre, "archivo": cat.archivo} for cat in catalogos}

        resultado.append({
            "usuario": {"id": v.id, "nombre": v.nombre},
            "conteosDiarios": [
                {
                    "catalogo": catalogos_info.get(imp.catalogo_id, {"id": imp.catalogo_id, "nombre": "Desconocido"}),
                    "total": imp.cantidad_impresa,
                    "fecha_hora": imp.creado_en
                }
                for imp in impresiones_hoy
            ],
            "conteosSemanales": [
                {
                    "catalogo": catalogos_info.get(imp.catalogo_id, {"id": imp.catalogo_id, "nombre": "Desconocido"}),
                    "total": imp.cantidad_impresa,
                    "fecha_hora": imp.creado_en
                }
                for imp in impresiones_semana
            ],
        })

    return resultado

# ── Obtener conteos por usuario
@router.get("/impresiones/{usuario_id}")
def obtener_conteos(usuario_id: int, db: Session = Depends(get_db)):
    hoy = date.today()
    inicio_semana = hoy - timedelta(days=hoy.weekday())

    impresiones_hoy = (
        db.query(Impresion.catalogo_id, func.sum(Impresion.cantidad_impresa))
        .filter(Impresion.usuario_id == usuario_id, Impresion.fecha == hoy)
        .group_by(Impresion.catalogo_id)
        .all()
    )

    impresiones_semana = (
        db.query(Impresion.catalogo_id, func.sum(Impresion.cantidad_impresa))
        .filter(Impresion.usuario_id == usuario_id, Impresion.fecha >= inicio_semana)
        .group_by(Impresion.catalogo_id)
        .all()
    )

    ids_catalogos = set([c_id for c_id, _ in impresiones_hoy] + [c_id for c_id, _ in impresiones_semana])
    catalogos = db.query(Catalogo).filter(Catalogo.id.in_(ids_catalogos)).all()
    catalogos_info = {c.id: {"id": c.id, "nombre": c.nombre, "archivo": c.archivo} for c in catalogos}

    conteos_diarios = [{"catalogo": catalogos_info.get(catalogo_id, {"id": catalogo_id, "nombre": "Desconocido"}), "total": total} for catalogo_id, total in impresiones_hoy]
    conteos_semanales = [{"catalogo": catalogos_info.get(catalogo_id, {"id": catalogo_id, "nombre": "Desconocido"}), "total": total} for catalogo_id, total in impresiones_semana]

    return {
        "conteosDiarios": conteos_diarios,
        "conteosSemanales": conteos_semanales
    }