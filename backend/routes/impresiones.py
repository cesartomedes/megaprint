from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from datetime import date, timedelta
from database import get_db 
from models import Impresion, Volante, Vendedora
from schemas import ImpresionCreate
from collections import defaultdict


router = APIRouter()

# Límite diario y semanal definidos globalmente
LIMITE_DIARIO = 30
LIMITE_SEMANAL = 150
COSTO_EXTRA = 0.5


@router.post("/impresiones/")
def crear_impresion(impresion: ImpresionCreate, db: Session = Depends(get_db)):
    hoy = impresion.fecha
    inicio_semana = hoy - timedelta(days=hoy.weekday())  # lunes actual

    # Total impreso hoy
    total_hoy = (
        db.query(func.sum(Impresion.cantidad_impresa))
        .filter(
            Impresion.usuario_id == impresion.usuario_id,
            Impresion.volante_id == impresion.volante_id,
            Impresion.fecha == hoy,
        )
        .scalar() or 0
    )

    # Total impreso en la semana
    total_semana = (
        db.query(func.sum(Impresion.cantidad_impresa))
        .filter(
            Impresion.usuario_id == impresion.usuario_id,
            Impresion.volante_id == impresion.volante_id,
            Impresion.fecha >= inicio_semana,
        )
        .scalar() or 0
    )

    nuevo_total_hoy = total_hoy + impresion.cantidad_impresa
    nuevo_total_semana = total_semana + impresion.cantidad_impresa

    # Exceso diario
    exceso_diario = max(nuevo_total_hoy - LIMITE_DIARIO, 0)

    # Exceso semanal
    exceso_semanal = max(nuevo_total_semana - LIMITE_SEMANAL, 0)

    # Tomamos el mayor exceso para el cálculo de costo
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

    return {
        "mensaje": (
            "Impresión registrada con exceso"
            if exceso_total > 0 else "Impresión registrada"
        ),
        "limite_diario": LIMITE_DIARIO,
        "limite_semanal": LIMITE_SEMANAL,
        "total_hoy": nuevo_total_hoy,
        "total_semana": nuevo_total_semana,
        "exceso_diario": exceso_diario,
        "exceso_semanal": exceso_semanal,
        "costo_extra": float(costo_extra),
        "impresion": {
            "id": nueva_impresion.id,
            "usuario_id": nueva_impresion.usuario_id,
            "volante_id": nueva_impresion.volante_id,
            "fecha": nueva_impresion.fecha,
            "cantidad_impresa": nueva_impresion.cantidad_impresa,
        }
    }
@router.get("/impresiones/")
def obtener_todas_impresiones(db: Session = Depends(get_db)):
    vendedoras = db.query(Vendedora).all()
    resultado = []

    for v in vendedoras:
        hoy = date.today()
        inicio_semana = hoy - timedelta(days=hoy.weekday())

        # Impresiones diarias de la vendedora ordenadas por fecha/hora descendente
        impresiones_hoy = (
            db.query(Impresion)
            .filter(
                Impresion.usuario_id == v.id,
                func.date(Impresion.creado_en) == hoy
            )
            .order_by(Impresion.creado_en.desc())
            .all()
        )

        # Impresiones semanales de la vendedora ordenadas por fecha/hora descendente
        impresiones_semana = (
            db.query(Impresion)
            .filter(
                Impresion.usuario_id == v.id,
                func.date(Impresion.creado_en) >= inicio_semana
            )
            .order_by(Impresion.creado_en.desc())
            .all()
        )

        # IDs de volantes involucrados
        ids_volantes = set([imp.volante_id for imp in impresiones_hoy] +
                           [imp.volante_id for imp in impresiones_semana])
        volantes = db.query(Volante).filter(Volante.id.in_(ids_volantes)).all()
        volantes_info = {vol.id: {"id": vol.id, "nombre": vol.nombre, "archivo": vol.archivo} for vol in volantes}

        # Construir respuesta
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



@router.get("/impresiones/{usuario_id}")
def obtener_conteos(usuario_id: int, db: Session = Depends(get_db)):
    hoy = date.today()
    inicio_semana = hoy - timedelta(days=hoy.weekday())  # lunes actual

    # --- Conteo diario con join a Volante ---
    impresiones_hoy = (
        db.query(Impresion.volante_id, func.sum(Impresion.cantidad_impresa))
        .filter(Impresion.usuario_id == usuario_id, Impresion.fecha == hoy)
        .group_by(Impresion.volante_id)
        .all()
    )

    # --- Conteo semanal con join a Volante ---
    impresiones_semana = (
        db.query(Impresion.volante_id, func.sum(Impresion.cantidad_impresa))
        .filter(Impresion.usuario_id == usuario_id, Impresion.fecha >= inicio_semana)
        .group_by(Impresion.volante_id)
        .all()
    )

    # --- Obtener info de volantes ---
    ids_volantes = set([v_id for v_id, _ in impresiones_hoy] + [v_id for v_id, _ in impresiones_semana])
    volantes = (
        db.query(Volante)
        .filter(Volante.id.in_(ids_volantes))
        .all()
    )
    volantes_info = {v.id: {"id": v.id, "nombre": v.nombre, "archivo": v.archivo} for v in volantes}

    # --- Armar respuesta ---
    conteos_diarios = []
    for volante_id, total in impresiones_hoy:
        conteos_diarios.append({
            "volante": volantes_info.get(volante_id, {"id": volante_id, "nombre": "Desconocido"}),
            "total": total
        })

    conteos_semanales = []
    for volante_id, total in impresiones_semana:
        conteos_semanales.append({
            "volante": volantes_info.get(volante_id, {"id": volante_id, "nombre": "Desconocido"}),
            "total": total
        })

    return {
        "conteosDiarios": conteos_diarios,
        "conteosSemanales": conteos_semanales
    }


