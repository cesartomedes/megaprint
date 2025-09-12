# routes/config_helper.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Configuracion

router = APIRouter(prefix="/config_helper", tags=["ConfigHelper"])

# Función para obtener un valor de configuración
def get_config(db: Session, clave: str, tipo: type = str):
    config = db.query(Configuracion).filter(Configuracion.clave == clave).first()
    if not config:
        return None
    # Convertir valor al tipo que indicas
    try:
        return tipo(config.valor)
    except:
        return config.valor

# Endpoint GET de límites
@router.get("/limits")
def get_limits(db: Session = Depends(get_db)):
    """Devuelve los límites guardados en la BD"""
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


# Endpoint PUT para actualizar límites
@router.put("/limits")
def update_limits(new_limits: dict, db: Session = Depends(get_db)):
    for clave, valor in new_limits.items():
        db_clave = clave
        if clave == "costoExcedente":
            db_clave = "costo_excedente"
        config = db.query(Configuracion).filter(Configuracion.clave == db_clave).first()
        if config:
            config.valor = valor
        else:
            db.add(Configuracion(clave=db_clave, valor=valor, tipo="limit"))
    db.commit()
    return {"message": "Configuración guardada correctamente"}
