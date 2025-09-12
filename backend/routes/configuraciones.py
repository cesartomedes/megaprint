from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Configuracion
from pydantic import BaseModel

router = APIRouter(prefix="/config_helper", tags=["Configuraciones"])

# Esquema para actualización de límites
class LimitsUpdate(BaseModel):
    diario: float | None = None
    semanal: float | None = None
    mensual: float | None = None
    costoExcedente: float | None = None
    applyToAll: bool | None = False

    model_config = {
        "from_attributes": True  # Pydantic v2
    }

@router.get("/limits")
def get_limits(db: Session = Depends(get_db)):
    """Devuelve los últimos límites guardados en la BD"""
    claves = ["diario", "semanal", "mensual", "costoExcedente", "applyToAll"]
    configs = {}
    for clave in claves:
        config = db.query(Configuracion).filter(Configuracion.clave == clave).order_by(Configuracion.id.desc()).first()
        if config:
            if clave == "applyToAll":
                configs[clave] = bool(int(config.valor))
            else:
                configs[clave] = float(config.valor)
        else:
            configs[clave] = 0 if clave != "applyToAll" else False
    return configs

@router.post("/limits")
def update_limits(limits: LimitsUpdate, db: Session = Depends(get_db)):
    """Guarda los límites en la BD"""
    data = limits.dict()
    for clave in ["diario", "semanal", "mensual", "costoExcedente", "applyToAll"]:
        if clave in data and data[clave] is not None:
            # Se guarda siempre un nuevo registro
            nuevo = Configuracion(
                clave=clave,
                valor=str(int(data[clave]) if clave != "costoExcedente" else data[clave]),
                tipo="limit" if clave != "costoExcedente" else "float"
            )
            db.add(nuevo)
    db.commit()
    return {"message": "Límites actualizados correctamente"}
