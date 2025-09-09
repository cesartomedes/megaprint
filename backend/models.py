from sqlalchemy import Column, Integer, String, Float, DateTime, Date, Numeric, TIMESTAMP, ForeignKey, func
from sqlalchemy.orm import declarative_base, relationship
import datetime

Base = declarative_base()

class Vendedora(Base):
    __tablename__ = "vendedoras"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String)
    email = Column(String, unique=True)
    password = Column(String)  # ⚠️ en producción, cifrar siempre
    estado = Column(String, default="pendiente")
    role = Column(String, default="vendedora")  # roles: "vendedora" o "admin"

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
    archivo = Column(String)  # nombre del archivo en uploads/catalogos/pdf
    estado = Column(String, default="pendiente")  # pendiente, activa, completada, etc
    vendedora_id = Column(Integer, ForeignKey("vendedoras.id"))  # asignación

    vendedora = relationship("Vendedora", backref="volantes")

    
class Impresion(Base):
    __tablename__ = "impresiones"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("vendedoras.id"), nullable=False)
    volante_id = Column(Integer, ForeignKey("volantes.id"), nullable=False)
    fecha = Column(Date, nullable=False)
    cantidad_impresa = Column(Integer, nullable=False)
    exceso = Column(Integer, default=0)
    costo_extra = Column(Numeric(10,2), default=0)
    creado_en = Column(TIMESTAMP, server_default=func.now())

    vendedora = relationship("Vendedora")
    volante = relationship("Volante")
