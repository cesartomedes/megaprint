from database import SessionLocal
from models import Vendedora

db = SessionLocal()
print("Total vendedoras:", db.query(Vendedora).count())
print("Aprobadas:", db.query(Vendedora).filter(Vendedora.estado=="aprobada").count())