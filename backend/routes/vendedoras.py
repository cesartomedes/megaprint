from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Vendedora

router = APIRouter(prefix="/vendedoras", tags=["Vendedoras"])

@router.get("/")
def listar_vendedoras_aprobadas(db: Session = Depends(get_db)):
    """
    Devuelve solo las vendedoras que han sido aprobadas.
    """
    return db.query(Vendedora).filter(Vendedora.estado == "aprobada").all()
