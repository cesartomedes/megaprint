from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import extract, func
from datetime import datetime

from database import get_db
from models import Vendedora, Pago, Impresion, Deuda

router = APIRouter()
@router.get("/dashboard")
def get_dashboard_stats(db: Session = Depends(get_db)):
    now = datetime.now()

    # Vendedoras
    aprobadas = db.query(func.count(Vendedora.id)).filter(Vendedora.estado == "aprobada").scalar() or 0
    pendientes = db.query(func.count(Vendedora.id)).filter(Vendedora.estado == "pendiente").scalar() or 0
    rechazadas = db.query(func.count(Vendedora.id)).filter(Vendedora.estado == "rechazada").scalar() or 0

    # Órdenes activas (mes actual)
    ordenes_activas = (
        db.query(func.count(Impresion.id))
        .filter(Impresion.fecha.isnot(None))
        .filter(extract("month", Impresion.fecha) == now.month)
        .filter(extract("year", Impresion.fecha) == now.year)
        .scalar() or 0
    )

    # Pagos pendientes (deudas en estado pendiente)
    pagos_pendientes = db.query(func.count(Deuda.id)).filter(Deuda.estado == "pendiente").scalar() or 0

    # Ingresos del mes actual
    ingresos_mes_total = (
        db.query(func.coalesce(func.sum(Pago.monto), 0))
        .filter(Pago.estado == "completado")
        .filter(Pago.fecha.isnot(None))
        .filter(extract("month", Pago.fecha) == now.month)
        .filter(extract("year", Pago.fecha) == now.year)
        .scalar() or 0
    )

    return {
        "vendedoras": {
            "aprobadas": aprobadas,
            "pendientes": pendientes,
            "rechazadas": rechazadas
        },
        "ordenes_activas": ordenes_activas,
        "pagos_pendientes": pagos_pendientes,  # 👈 ahora sí
        "ingresos_mes": float(ingresos_mes_total)
    }