from sqlalchemy import Column, Integer, String, Float, DateTime, Date, Numeric, TIMESTAMP, ForeignKey, func, Boolean
from sqlalchemy.orm import declarative_base, relationship
import datetime

Base = declarative_base()

# -----------------------------
# VENDEDORA
# -----------------------------
class Vendedora(Base):
    __tablename__ = "vendedoras"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String)
    email = Column(String, unique=True)
    password = Column(String)  # ⚠️ cifrar en producción
    estado = Column(String, default="pendiente")
    role = Column(String, default="vendedora")  # roles: "vendedora" o "admin"

# -----------------------------
# CATEGORIA
# -----------------------------
class Categoria(Base):
    __tablename__ = "categorias"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, unique=True, nullable=False)

# -----------------------------
# CATALOGO
# -----------------------------
class Catalogo(Base):
    __tablename__ = "catalogos"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String)
    categoria_id = Column(Integer, ForeignKey("categorias.id"))
    vendedora_id = Column(Integer, ForeignKey("vendedoras.id"), nullable=True)
    url = Column(String)

    categoria = relationship("Categoria")
    vendedora = relationship("Vendedora")

# -----------------------------
# VOLANTE
# -----------------------------
class Volante(Base):
    __tablename__ = "volantes"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String)
    archivo = Column(String)  # nombre del archivo en uploads/catalogos/pdf
    estado = Column(String, default="pendiente")  # pendiente, activa, completada, etc
    vendedora_id = Column(Integer, ForeignKey("vendedoras.id"))  # asignación

    vendedora = relationship("Vendedora", backref="volantes")

# -----------------------------
# IMPRESION
# -----------------------------
class Impresion(Base):
    __tablename__ = "impresiones"
    __table_args__ = {"extend_existing": True}

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

# -----------------------------
# PAGO
# -----------------------------
class Pago(Base):
    __tablename__ = "pagos"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    vendedora_id = Column(Integer, ForeignKey("vendedoras.id"))
    monto = Column(Float)
    metodo = Column(String, nullable=True)       # ejemplo: PagoMovil
    referencia = Column(String, nullable=True)   # referencia del pago
    capture_url = Column(String, nullable=True)  # URL del capture subido
    estado = Column(String, default="pendiente")
    fecha = Column(DateTime, default=datetime.datetime.utcnow)

    vendedora = relationship("Vendedora", backref="pagos")

# -----------------------------
# DEUDA
# -----------------------------
class Deuda(Base):
    __tablename__ = "deudas"
    id = Column(Integer, primary_key=True, index=True)
    vendedora_id = Column(Integer, ForeignKey("vendedoras.id"))
    volante_id = Column(Integer, ForeignKey("volantes.id"), nullable=True)  # nuevo
    impresion_id = Column(Integer, ForeignKey("impresiones.id"), nullable=True)  # nuevo
    monto = Column(Float, nullable=False)
    cantidad_excedida = Column(Integer, default=0)  # nuevo
    metodo = Column(String, nullable=True)
    referencia = Column(String, nullable=True)
    capture_url = Column(String, nullable=True)
    estado = Column(String, default="pendiente")
    fecha = Column(DateTime, default=datetime.datetime.utcnow)
    tipo = Column(String, default="diaria")  # 'diaria' o 'semanal'

    vendedora = relationship("Vendedora", backref="deudas")
    volante = relationship("Volante")
    impresion = relationship("Impresion", backref="deudas")
    
class Configuracion(Base):
    __tablename__ = "configuraciones"

    id = Column(Integer, primary_key=True, index=True)
    clave = Column(String, unique=True, index=True, nullable=False)
    valor = Column(String, nullable=False)
    tipo = Column(String, nullable=False)  # "int", "float", "str"
    
class Notificacion(Base):
    __tablename__ = "notificaciones"
    id = Column(Integer, primary_key=True, index=True)
    vendedora_id = Column(Integer, ForeignKey("vendedoras.id"), nullable=False)
    mensaje = Column(String, nullable=False)
    leido = Column(Boolean, default=False)
    fecha = Column(DateTime, default=datetime.datetime.utcnow)

    vendedora = relationship("Vendedora", backref="notificaciones")