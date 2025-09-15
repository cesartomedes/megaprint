# routes/notificaciones.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Notificacion, Vendedora
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class NotificacionCreate(BaseModel):
    vendedora_id: int
    mensaje: str

@router.post("/", summary="Crear notificación (opcional, puede crear el backend en acciones)")
def crear_notificacion(payload: NotificacionCreate, db: Session = Depends(get_db)):
    v = db.query(Vendedora).filter(Vendedora.id == payload.vendedora_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vendedora no encontrada")
    n = Notificacion(vendedora_id=payload.vendedora_id, mensaje=payload.mensaje, fecha=datetime.utcnow())
    db.add(n)
    db.commit()
    db.refresh(n)
    return {"message": "Notificación creada", "notificacion": {
        "id": n.id, "vendedora_id": n.vendedora_id, "mensaje": n.mensaje, "leido": n.leido, "fecha": n.fecha
    }}

@router.get("/{vendedora_id}", summary="Obtener notificaciones de la vendedora")
def obtener_notificaciones(vendedora_id: int, db: Session = Depends(get_db)):
    notifs = db.query(Notificacion).filter(Notificacion.vendedora_id == vendedora_id).order_by(Notificacion.fecha.desc()).all()
    resultado = []
    for n in notifs:
        resultado.append({
            "id": n.id,
            "vendedora_id": n.vendedora_id,
            "mensaje": n.mensaje,
            "leido": n.leido,
            "fecha": n.fecha.strftime("%Y-%m-%d %H:%M:%S")
        })
    return resultado

@router.patch("/{notificacion_id}/leer", summary="Marcar una notificación como leída")
def marcar_leida(notificacion_id: int, db: Session = Depends(get_db)):
    n = db.query(Notificacion).filter(Notificacion.id == notificacion_id).first()
    if not n:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")
    n.leido = True
    db.commit()
    db.refresh(n)
    return {"message": "Notificación marcada como leída", "id": n.id}
