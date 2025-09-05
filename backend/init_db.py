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
# reset_db.py
from database import engine, SessionLocal
from models import Base, Vendedora

# --- Reiniciar la base de datos ---
Base.metadata.drop_all(bind=engine)
print("Tablas eliminadas.")
Base.metadata.create_all(bind=engine)
print("Tablas creadas según models.py actualizado.")

# --- Crear admin si no existe ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def crear_admin():
    db = SessionLocal()
    admin_existente = db.query(Vendedora).filter(Vendedora.email == "admin@correo.com").first()
    if not admin_existente:
        hashed_password = pwd_context.hash("1234")  # <-- cifrar contraseña
        admin = Vendedora(
            nombre="Administrador",
            email="admin@correo.com",
            password=hashed_password,
            estado="aprobada",
            role="admin"
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
