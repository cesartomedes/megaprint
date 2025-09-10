# routes/pagos.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Pago
from schemas import PagoCreate
from typing import List
from datetime import datetime

router = APIRouter(prefix="/pagos", tags=["Pagos"])

# ── Registrar pago nuevo
@router.post("/", response_model=PagoCreate)
def create_pago(pago: PagoCreate, db: Session = Depends(get_db)):
    nuevo_pago = Pago(**pago.dict())
    if not nuevo_pago.fecha:
        nuevo_pago.fecha = datetime.utcnow()
    db.add(nuevo_pago)
    db.commit()
    db.refresh(nuevo_pago)
    return nuevo_pago

# ── Listar todos los pagos
@router.get("/", response_model=List[PagoCreate])
def get_all_pagos(db: Session = Depends(get_db)):
    return db.query(Pago).order_by(Pago.fecha.desc()).all()

# ── Listar pagos de una vendedora
@router.get("/vendedora/{vendedora_id}", response_model=List[PagoCreate])
def get_pagos_vendedora(vendedora_id: int, db: Session = Depends(get_db)):
    return db.query(Pago).filter(Pago.vendedora_id == vendedora_id).order_by(Pago.fecha.desc()).all()

# ── Actualizar estado de pago
@router.post("/pagar/{pago_id}")
def pagar_pago(pago_id: int, db: Session = Depends(get_db)):
    pago = db.query(Pago).filter(Pago.id == pago_id).first()
    if not pago:
        raise HTTPException(status_code=404, detail="Pago no encontrado")
    
    pago.estado = "Pagado"
    db.commit()
    db.refresh(pago)
    return pago
