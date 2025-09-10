from database import SessionLocal
from models import Volante

db = SessionLocal()
nuevo_volante = Volante(
    nombre="volante1.pdf",
    archivo="volante1.pdf",
    vendedora_id=2,  
    estado="pendiente"
)
db.add(nuevo_volante)
db.commit()
db.close()