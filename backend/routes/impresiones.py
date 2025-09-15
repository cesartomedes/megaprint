from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta
from database import get_db
from models import Impresion, Volante, Vendedora, Deuda
from routes.config_helper import get_limits
from schemas import ImpresionCreate
import win32api
import threading
import os

router = APIRouter()

# ── Función para crear o actualizar deuda
# ── Función para crear o actualizar deuda
import os
import threading
import win32api
import win32print
from datetime import date, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import Impresion, Volante, Vendedora, Deuda
from routes.config_helper import get_limits
from schemas import ImpresionCreate

router = APIRouter()

# ── Función para crear o actualizar deuda
def crear_o_actualizar_deuda(
    usuario_id: int,
    monto_extra: float,
    fecha: date,
    tipo: str,
    db: Session,
    volante_id: int = None,
    impresion_id: int = None,
    cantidad_excedida: int = 0
):
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
        deuda.referencia = f"{cantidad_excedida} excedió el límite"
        deuda.fecha = fecha
    else:
        deuda = Deuda(
            vendedora_id=usuario_id,
            volante_id=volante_id,
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

# ── Worker de impresión
def _print_worker(file_path: str, printer_name: str = "HPI21F282"):
    try:
        if not os.path.exists(file_path):
            print(f"❌ El archivo {file_path} no existe")
            return
        win32api.ShellExecute(0, "print", file_path, f'/d:"{printer_name}"', ".", 0)
        print(f"✅ Archivo {file_path} enviado a {printer_name}")
    except Exception as e:
        print(f"❌ Error al imprimir {file_path}: {e}")

# ── Endpoint crear impresión
@router.post("/impresiones/")
def crear_impresion(impresion: ImpresionCreate, db: Session = Depends(get_db)):
    hoy = impresion.fecha
    inicio_semana = hoy - timedelta(days=hoy.weekday())

    total_hoy = (
        db.query(func.sum(Impresion.cantidad_impresa))
        .filter(Impresion.usuario_id == impresion.usuario_id, Impresion.fecha == hoy)
        .scalar() or 0
    )
    total_semana = (
        db.query(func.sum(Impresion.cantidad_impresa))
        .filter(Impresion.usuario_id == impresion.usuario_id, Impresion.fecha >= inicio_semana)
        .scalar() or 0
    )

    nuevo_total_hoy = total_hoy + impresion.cantidad_impresa
    nuevo_total_semana = total_semana + impresion.cantidad_impresa

    limites = get_limits(db)
    LIMITE_DIARIO = limites.get("diario", 30)
    LIMITE_SEMANAL = limites.get("semanal", 150)
    COSTO_EXTRA = limites.get("costoExcedente", 0.5)

    exceso_diario = max(nuevo_total_hoy - LIMITE_DIARIO, 0)
    exceso_semanal = max(nuevo_total_semana - LIMITE_SEMANAL, 0)
    exceso_total = max(exceso_diario, exceso_semanal)
    costo_extra = exceso_total * COSTO_EXTRA if exceso_total > 0 else 0

    nueva_impresion = Impresion(
        usuario_id=impresion.usuario_id,
        volante_id=impresion.volante_id,
        fecha=hoy,
        cantidad_impresa=impresion.cantidad_impresa,
        exceso=exceso_total,
        costo_extra=costo_extra
    )
    db.add(nueva_impresion)
    db.commit()
    db.refresh(nueva_impresion)

    # ── Enviar a imprimir
    volante = db.query(Volante).filter(Volante.id == impresion.volante_id).first()
    if volante and volante.archivo:
        BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # ruta a backend/
        file_path = os.path.join(BASE_DIR, "uploads", "catalogos", "pdf", volante.archivo)
        threading.Thread(target=_print_worker, args=(file_path,), daemon=True).start()

    # ── Crear o actualizar deuda
    if exceso_diario > 0:
        crear_o_actualizar_deuda(
            usuario_id=impresion.usuario_id,
            monto_extra=exceso_diario * COSTO_EXTRA,
            fecha=hoy,
            tipo="diaria",
            db=db,
            volante_id=impresion.volante_id,
            impresion_id=nueva_impresion.id,
            cantidad_excedida=exceso_diario
        )
    if exceso_semanal > 0:
        crear_o_actualizar_deuda(
            usuario_id=impresion.usuario_id,
            monto_extra=exceso_semanal * COSTO_EXTRA,
            fecha=hoy,
            tipo="semanal",
            db=db,
            volante_id=impresion.volante_id,
            impresion_id=nueva_impresion.id,
            cantidad_excedida=exceso_semanal
        )

    return {
        "mensaje": "Impresión registrada con exceso" if exceso_total > 0 else "Impresión registrada",
        "limite_diario": LIMITE_DIARIO,
        "limite_semanal": LIMITE_SEMANAL,
        "total_hoy": nuevo_total_hoy,
        "total_semana": nuevo_total_semana,
        "exceso_diario": exceso_diario,
        "exceso_semanal": exceso_semanal,
        "costo_extra": float(costo_extra),
        "excedido": nuevo_total_hoy > LIMITE_DIARIO,
        "impresiones_gratis_restantes": max(LIMITE_DIARIO - total_hoy, 0),
        "impresiones_extras": exceso_diario,
        "impresion": {
            "id": nueva_impresion.id,
            "usuario_id": nueva_impresion.usuario_id,
            "volante_id": nueva_impresion.volante_id,
            "fecha": nueva_impresion.fecha,
            "cantidad_impresa": nueva_impresion.cantidad_impresa,
        }
    }

# ── Obtener todas las impresiones
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

        ids_volantes = set([imp.volante_id for imp in impresiones_hoy] +
                           [imp.volante_id for imp in impresiones_semana])
        volantes = db.query(Volante).filter(Volante.id.in_(ids_volantes)).all()
        volantes_info = {vol.id: {"id": vol.id, "nombre": vol.nombre, "archivo": vol.archivo} for vol in volantes}

        resultado.append({
            "usuario": {"id": v.id, "nombre": v.nombre},
            "conteosDiarios": [
                {
                    "volante": volantes_info.get(imp.volante_id, {"id": imp.volante_id, "nombre": "Desconocido"}),
                    "total": imp.cantidad_impresa,
                    "fecha_hora": imp.creado_en
                }
                for imp in impresiones_hoy
            ],
            "conteosSemanales": [
                {
                    "volante": volantes_info.get(imp.volante_id, {"id": imp.volante_id, "nombre": "Desconocido"}),
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
        db.query(Impresion.volante_id, func.sum(Impresion.cantidad_impresa))
        .filter(Impresion.usuario_id == usuario_id, Impresion.fecha == hoy)
        .group_by(Impresion.volante_id)
        .all()
    )

    impresiones_semana = (
        db.query(Impresion.volante_id, func.sum(Impresion.cantidad_impresa))
        .filter(Impresion.usuario_id == usuario_id, Impresion.fecha >= inicio_semana)
        .group_by(Impresion.volante_id)
        .all()
    )

    ids_volantes = set([v_id for v_id, _ in impresiones_hoy] + [v_id for v_id, _ in impresiones_semana])
    volantes = db.query(Volante).filter(Volante.id.in_(ids_volantes)).all()
    volantes_info = {v.id: {"id": v.id, "nombre": v.nombre, "archivo": v.archivo} for v in volantes}

    conteos_diarios = [{"volante": volantes_info.get(volante_id, {"id": volante_id, "nombre": "Desconocido"}), "total": total} for volante_id, total in impresiones_hoy]
    conteos_semanales = [{"volante": volantes_info.get(volante_id, {"id": volante_id, "nombre": "Desconocido"}), "total": total} for volante_id, total in impresiones_semana]

    return {
        "conteosDiarios": conteos_diarios,
        "conteosSemanales": conteos_semanales
    }
