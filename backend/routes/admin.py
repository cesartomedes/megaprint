from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Vendedora
from schemas import VendedoraResponse
# admin.py
router = APIRouter(tags=["admin"])


# -----------------------------
# Listar vendedoras
# -----------------------------
@router.get("/vendedoras", response_model=list[VendedoraResponse])
def listar_vendedoras(estado: str | None = None, db: Session = Depends(get_db)):
    """
    Listar vendedoras.
    - estado opcional: "pendiente", "aprobada", "rechazada"
    """
    query = db.query(Vendedora)
    if estado:
        if estado not in ["pendiente", "aprobada", "rechazada"]:
            raise HTTPException(status_code=400, detail="Estado inválido")
        query = query.filter(Vendedora.estado == estado)
    return query.all()


# -----------------------------
# Aprobar vendedora
# -----------------------------
@router.post("/vendedoras/{vendedora_id}/aprobar", response_model=VendedoraResponse)
def aprobar_vendedora(vendedora_id: int, db: Session = Depends(get_db)):
    vendedora = db.query(Vendedora).filter(Vendedora.id == vendedora_id).first()
    if not vendedora:
        raise HTTPException(status_code=404, detail="Vendedora no encontrada")
    
    vendedora.estado = "aprobada"
    db.commit()
    db.refresh(vendedora)
    return vendedora


# -----------------------------
# Rechazar vendedora
# -----------------------------
@router.post("/vendedoras/{vendedora_id}/rechazar", response_model=VendedoraResponse)
def rechazar_vendedora(vendedora_id: int, db: Session = Depends(get_db)):
    vendedora = db.query(Vendedora).filter(Vendedora.id == vendedora_id).first()
    if not vendedora:
        raise HTTPException(status_code=404, detail="Vendedora no encontrada")
    
    vendedora.estado = "rechazada"
    db.commit()
    db.refresh(vendedora)
    return vendedora
