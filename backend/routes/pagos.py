# routes/pagos.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Pago, Deuda, Vendedora
from schemas import PagoCreate, PagoResponse
from typing import List
from datetime import datetime

router = APIRouter(prefix="/pagos", tags=["Pagos"])


# ── Registrar pago nuevo y aplicarlo a deudas
@router.post("/", response_model=PagoResponse)
def create_pago(pago: PagoCreate, db: Session = Depends(get_db)):
    # Verificar que exista la vendedora
    vendedora = db.query(Vendedora).filter(Vendedora.id == pago.vendedora_id).first()
    if not vendedora:
        raise HTTPException(status_code=404, detail="Vendedora no encontrada")

    # Crear pago
    nuevo_pago = Pago(
        vendedora_id=pago.vendedora_id,
        monto=pago.monto,
        metodo=pago.metodo,
        referencia=pago.referencia,
        capture_url=pago.capture_url,
        estado=pago.estado or "pendiente",
        fecha=pago.fecha or datetime.utcnow()
    )
    db.add(nuevo_pago)
    db.commit()
    db.refresh(nuevo_pago)

    # Aplicar pago a deudas pendientes
    deudas = (
        db.query(Deuda)
        .filter(Deuda.vendedora_id == pago.vendedora_id, Deuda.estado == "pendiente")
        .order_by(Deuda.fecha.asc())
        .all()
    )

    monto_restante = nuevo_pago.monto
    for deuda in deudas:
        if monto_restante <= 0:
            break
        if monto_restante >= deuda.monto:
            monto_restante -= deuda.monto
            deuda.estado = "pagada"
        else:
            deuda.monto -= monto_restante
            monto_restante = 0
        db.add(deuda)

    db.commit()
    return nuevo_pago


# ── Listar todos los pagos
@router.get("/", response_model=List[PagoResponse])
def get_all_pagos(db: Session = Depends(get_db)):
    return db.query(Pago).order_by(Pago.fecha.desc()).all()


# ── Listar pagos de una vendedora
@router.get("/vendedora/{vendedora_id}", response_model=List[PagoResponse])
def get_pagos_vendedora(vendedora_id: int, db: Session = Depends(get_db)):
    return db.query(Pago).filter(Pago.vendedora_id == vendedora_id).order_by(Pago.fecha.desc()).all()


# ── Aprobar manualmente un pago (Admin)
@router.post("/pagar/{pago_id}", response_model=PagoResponse)
def pagar_pago(pago_id: int, db: Session = Depends(get_db)):
    pago = db.query(Pago).filter(Pago.id == pago_id).first()
    if not pago:
        raise HTTPException(status_code=404, detail="Pago no encontrado")

    # ✅ Cambiar a "completado" para que el dashboard lo tome
    pago.estado = "completado"
    db.add(pago)

    # Aplicar a deudas pendientes
    deudas = (
        db.query(Deuda)
        .filter(Deuda.vendedora_id == pago.vendedora_id, Deuda.estado == "pendiente")
        .order_by(Deuda.fecha.asc())
        .all()
    )

    monto_restante = pago.monto
    for deuda in deudas:
        if monto_restante <= 0:
            break
        if monto_restante >= deuda.monto:
            monto_restante -= deuda.monto
            deuda.estado = "pagada"
        else:
            deuda.monto -= monto_restante
            monto_restante = 0
        db.add(deuda)

    # Crear notificación
    from models import Notificacion
    notificacion = Notificacion(
        vendedora_id=pago.vendedora_id,
        mensaje=f"Tu pago de ${pago.monto} ha sido aprobado.",
        leido=False
    )
    db.add(notificacion)

    db.commit()
    db.refresh(pago)
    return pago
