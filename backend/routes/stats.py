from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Vendedora, PrintJob, Pago

router = APIRouter()

@router.get("/dashboard")
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_vendedoras = db.query(Vendedora).count()
    ordenes_activas = db.query(PrintJob).filter(PrintJob.estado == "activo").count()
    pagos_pendientes = db.query(Pago).filter(Pago.estado == "pendiente").count()
    ingresos_mes = db.query(Pago).filter(Pago.estado == "completado").all()

    ingresos_mes_total = sum([p.monto for p in ingresos_mes])

    return {
        "vendedoras": total_vendedoras,
        "ordenes_activas": ordenes_activas,
        "pagos_pendientes": pagos_pendientes,
        "ingresos_mes": ingresos_mes_total,
    }

