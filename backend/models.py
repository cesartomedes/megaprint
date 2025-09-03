from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, relationship
import datetime

Base = declarative_base()

class Vendedora(Base):
    __tablename__ = "vendedoras"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String)
    email = Column(String, unique=True)
    estado = Column(String, default="pendiente")

class Categoria(Base):
    __tablename__ = "categorias"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, unique=True, nullable=False)


class Catalogo(Base):
    __tablename__ = "catalogos"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String)
    categoria_id = Column(Integer, ForeignKey("categorias.id"))
    vendedora_id = Column(Integer, ForeignKey("vendedoras.id"), nullable=True)
    url = Column(String)

    categoria = relationship("Categoria")
    vendedora = relationship("Vendedora")



class Pago(Base):
    __tablename__ = "pagos"
    id = Column(Integer, primary_key=True, index=True)
    vendedora_id = Column(Integer, ForeignKey("vendedoras.id"))
    monto = Column(Float)
    estado = Column(String, default="pendiente")
    fecha = Column(DateTime, default=datetime.datetime.utcnow)

class Volante(Base):
    __tablename__ = "volantes"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String)

