from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime, date

router = APIRouter()

class Pago(BaseModel):
    user: str
    monto: float
    fecha: str = date.today().isoformat()
    metodo: str = "transferencia"
    referencia: str = ""
    notas: str = ""
    status: str = "completed"  # completed o pendiente

# DB simulada
pagos_db = [
    {"id": 1, "user": "Raúl León", "monto": 63.0, "fecha": "2025-08-25T19:13:33", "status": "pendiente", "metodo":"transferencia", "referencia":"", "notas":""},
    {"id": 2, "user": "Ana Pérez", "monto": 100.0, "fecha": "2025-08-26T10:37:43", "status": "completed", "metodo":"transferencia", "referencia":"3333", "notas":"33"},
]

ultimo_id = len(pagos_db)

@router.get("/")
async def get_pagos():
    return pagos_db

@router.post("/")
async def create_pago(pago: Pago):
    global ultimo_id
    ultimo_id += 1
    nuevo_pago = {"id": ultimo_id, **pago.dict()}
    pagos_db.append(nuevo_pago)
    return {"msg": "Pago registrado", "pago": nuevo_pago}

@router.get("/stats")
async def get_estadisticas():
    total_deuda = sum(p["monto"] for p in pagos_db if p["status"] == "pendiente")
    vendedoras_con_deuda = [p["user"] for p in pagos_db if p["status"] == "pendiente"]
    promedio = total_deuda / len(vendedoras_con_deuda) if vendedoras_con_deuda else 0
    return {
        "total_deuda": total_deuda,
        "vendedoras_con_deuda": len(set(vendedoras_con_deuda)),
        "promedio": promedio,
        "vendedoras": list({p["user"]: p["monto"] for p in pagos_db if p["status"]=="pendiente"}.items())
    }

@router.get("/detalle/{user}")
async def get_detalle(user: str):
    historial = [p for p in pagos_db if p["user"] == user]
    deuda_actual = sum(p["monto"] for p in historial if p["status"]=="pendiente")
    ultima_actualizacion = max([p["fecha"] for p in historial], default=None)
    return {
        "user": user,
        "historial": historial,
        "deuda_actual": deuda_actual,
        "ultima_actualizacion": ultima_actualizacion
    }
