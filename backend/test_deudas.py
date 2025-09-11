from sqlalchemy.orm import Session
from sqlalchemy import func
from models import Deuda
from database import get_db

# Crear sesión
db: Session = next(get_db())  # usamos next() porque get_db() es un generador

# Obtener vendedoras con deudas pendientes
vendedoras = db.query(
    Deuda.vendedora_id,
    func.count(Deuda.id).label("cantidad_deudas"),
    func.sum(Deuda.monto).label("total_deuda")
).filter(
    Deuda.estado == 'pendiente'
).group_by(
    Deuda.vendedora_id
).all()

# Preparar datos para frontend
resultado = []

for v in vendedoras:
    deudas_detalle = db.query(Deuda).filter(
        Deuda.vendedora_id == v.vendedora_id,
        Deuda.estado == 'pendiente'
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
            "fecha": str(d.fecha),  # convertir datetime a string
            "tipo": d.tipo,
            "volante_id": d.volante_id,
            "impresion_id": d.impresion_id
        })

    resultado.append({
        "vendedora_id": v.vendedora_id,
        "cantidad_deudas": v.cantidad_deudas,
        "total_deuda": float(v.total_deuda),
        "deudas": deudas_list
    })

# Mostrar en consola
import json
print(json.dumps(resultado, indent=4))
