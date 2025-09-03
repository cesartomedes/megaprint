# init_db.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base  

SQLALCHEMY_DATABASE_URL = "sqlite:///./megaprint.db"

# Crear engine con SQLite
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

# Crear sesión
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    print("Creando la base de datos...")
    Base.metadata.create_all(bind=engine)
    print("Base de datos inicializada correctamente.")

if __name__ == "__main__":
    init_db()
