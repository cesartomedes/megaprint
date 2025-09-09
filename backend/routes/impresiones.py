from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta
from database import get_db 
from models import Impresion
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
@router.get("/impresiones/{usuario_id}")
def obtener_conteos(usuario_id: int, db: Session = Depends(get_db)):
    impresiones = db.query(Impresion).filter(Impresion.usuario_id == usuario_id).all()

    if not impresiones:
        return {"conteosDiarios": {}, "conteosSemanales": {}}

    conteos_diarios = defaultdict(int)
    conteos_semanales = defaultdict(int)

    for imp in impresiones:
        conteos_diarios[imp.volante_id] += imp.cantidad_impresa
        conteos_semanales[imp.volante_id] += imp.cantidad_impresa

    return {
        "conteosDiarios": conteos_diarios,
        "conteosSemanales": conteos_semanales
    }