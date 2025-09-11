# routes/deudas.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import Deuda, Vendedora

router = APIRouter()

@router.get("/deudas")
def obtener_deudas(db: Session = Depends(get_db)):
    # Traer vendedoras con deudas pendientes, sumando monto
    vendedoras = db.query(
        Deuda.vendedora_id,
        Vendedora.nombre,
        func.count(Deuda.id).label("cantidad_deudas"),
        func.sum(Deuda.monto).label("total_deuda")
    ).join(Vendedora, Vendedora.id == Deuda.vendedora_id) \
     .filter(Deuda.estado == "pendiente") \
     .group_by(Deuda.vendedora_id, Vendedora.nombre) \
     .all()

    resultado = []

    for v in vendedoras:
        # Detalle de deudas
        deudas_detalle = db.query(Deuda).filter(
            Deuda.vendedora_id == v.vendedora_id,
            Deuda.estado == "pendiente"
        ).all()

        deudas_list = []
        for d in deudas_detalle:
            deudas_list.append({
                "id": d.id,
                "monto": d.monto,
                "cantidad_excedida": d.cantidad_excedida,
                "metodo": d.metodo,
                "referencia": d.referencia,
                "capture_url": d.capture_url,
                "estado": d.estado,
                "fecha": str(d.fecha),
                "tipo": d.tipo,
                "volante_id": d.volante_id,
                "impresion_id": d.impresion_id
            })

        resultado.append({
            "vendedora_id": v.vendedora_id,
            "nombre": v.nombre,  # <-- aquí agregamos el nombre
            "cantidad_deudas": v.cantidad_deudas,
            "total_deuda": float(v.total_deuda),
            "deudas": deudas_list
        })

    return resultado
