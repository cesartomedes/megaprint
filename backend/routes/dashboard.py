from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import extract
from database import get_db
from models import Vendedora, Volante, Pago
from datetime import datetime

router = APIRouter()

@router.get("/", tags=["Dashboard"])
def get_dashboard(db: Session = Depends(get_db)):
    # Vendedoras aprobadas, pendientes, rechazadas
    aprobadas = db.query(Vendedora).filter(Vendedora.estado == "aprobada").count()
    pendientes = db.query(Vendedora).filter(Vendedora.estado == "pendiente").count()
    rechazadas = db.query(Vendedora).filter(Vendedora.estado == "rechazada").count()

    # Órdenes activas
    ordenes_activas = db.query(Volante).filter(Volante.estado == "activa").count()

    # Pagos pendientes
    pagos_pendientes = db.query(Pago).filter(Pago.estado == "pendiente").count()

    # Ingresos del mes (sumatoria de pagos completados en el mes actual)
    hoy = datetime.now()
    ingresos_mes = (
        db.query(Pago)
        .filter(
            Pago.estado == "completado",
            extract("year", Pago.fecha) == hoy.year,
            extract("month", Pago.fecha) == hoy.month,
        )
        .all()
    )
    total_ingresos = sum(p.monto for p in ingresos_mes)

    return {
        "vendedoras": {
            "aprobadas": aprobadas,
            "pendientes": pendientes,
            "rechazadas": rechazadas,
        },
        "ordenes_activas": ordenes_activas,
        "pagos_pendientes": pagos_pendientes,
        "ingresos_mes": total_ingresos,
    }
