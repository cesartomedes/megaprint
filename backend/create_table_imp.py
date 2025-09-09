from sqlalchemy import create_engine
from models import Base, Impresion  # tu modelo Impresion
from database import SQLALCHEMY_DATABASE_URL  # tu conexión

# Crear engine
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Crear solo la tabla Impresion
Impresion.__table__.create(bind=engine, checkfirst=True)

print("✅ Tabla 'impresiones' creada o ya existente.")
