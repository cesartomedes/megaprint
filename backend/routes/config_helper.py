# routes/config_helper.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Configuracion

router = APIRouter(prefix="/config_helper", tags=["ConfigHelper"])

# Endpoint GET de límites
@router.get("/limits")
def get_limits(db: Session = Depends(get_db)):
    """Devuelve los límites guardados en la BD"""
    # Mapeo: clave frontend -> clave en base de datos
    clave_map = {
        "diario": "diario",
        "semanal": "semanal",
        "mensual": "mensual",
        "costoExcedente": "costo_excedente",
        "applyToAll": "applyToAll",
    }

    configs = {}
    for front_clave, db_clave in clave_map.items():
        config = (
            db.query(Configuracion)
            .filter(Configuracion.clave == db_clave)
            .order_by(Configuracion.id.desc())
            .first()
        )
        if config:
            if front_clave == "applyToAll":
                configs[front_clave] = bool(int(config.valor))
            else:
                configs[front_clave] = float(config.valor)
        else:
            configs[front_clave] = 0 if front_clave != "applyToAll" else False
    return configs


# Endpoint PUT para actualizar límites
@router.put("/limits")
def update_limits(new_limits: dict, db: Session = Depends(get_db)):
    clave_map = {
        "diario": "diario",
        "semanal": "semanal",
        "mensual": "mensual",
        "costoExcedente": "costo_excedente",
        "applyToAll": "applyToAll",
    }

    for front_clave, valor in new_limits.items():
        db_clave = clave_map.get(front_clave, front_clave)
        config = db.query(Configuracion).filter(Configuracion.clave == db_clave).first()
        if config:
            config.valor = valor
        else:
            db.add(Configuracion(clave=db_clave, valor=valor, tipo="limit"))
    db.commit()
    return {"message": "Configuración guardada correctamente"}
