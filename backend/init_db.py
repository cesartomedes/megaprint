# init_db.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, Vendedora  # <- importar Vendedora

SQLALCHEMY_DATABASE_URL = "sqlite:///./megaprint.db"

# Crear engine con SQLite
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

# Crear sesión
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    print("Creando la base de datos...")
    Base.metadata.create_all(bind=engine)
    print("Base de datos inicializada correctamente.")

def crear_admin():
    db = SessionLocal()
    admin_existente = db.query(Vendedora).filter(Vendedora.email == "admin@correo.com").first()
    if not admin_existente:
        admin = Vendedora(
            nombre="Administrador",
            email="admin@correo.com",
            password="1234",  # ⚠️ luego cifrar
            estado="aprobada",
            role="admin"       # <- asegúrate de agregar esta columna a tu modelo
        )
        db.add(admin)
        db.commit()
        print("Administrador creado")
    else:
        print("Administrador ya existe")
    db.close()

if __name__ == "__main__":
    init_db()
    crear_admin()
