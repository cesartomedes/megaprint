from pydantic import BaseModel, EmailStr
from datetime import date, datetime
from typing import Optional

# ─── Vendedoras ──────────────────────────────────────────────
class VendedoraBase(BaseModel):
    nombre: str
    email: EmailStr

class VendedoraCreate(VendedoraBase):
    password: str
    estado: str = "pendiente"

class VendedoraUpdate(BaseModel):
    nombre: str
    email: str
    estado: str

class VendedoraResponse(VendedoraBase):
    id: int
    estado: str

    class Config:
        from_attributes = True   # 👈 reemplazo de orm_mode


# ─── Catálogos / Volantes ─────────────────────────────────────
class CatalogoSchema(BaseModel):
    id: int
    nombre: str
    categoria: Optional[str]  # Solo el nombre
    vendedora_id: Optional[int]
    url: str

class VolanteSchema(BaseModel):
    id: int
    nombre: str
    archivo: str
    vendedora_id: Optional[int] = None
    estado: Optional[str]


# ─── Impresiones ─────────────────────────────────────────────
class ImpresionCreate(BaseModel):
    usuario_id: int
    volante_id: int
    fecha: date
    cantidad_impresa: int


# ─── Deudas ─────────────────────────────────────────────────
class DeudaBase(BaseModel):
    vendedora_id: int
    monto: float
    metodo: Optional[str] = None
    referencia: Optional[str] = None
    capture_url: Optional[str] = None
    tipo: Optional[str] = "diaria"

class DeudaCreate(DeudaBase):
    pass

class Deuda(DeudaBase):
    id: int
    fecha: datetime
    estado: str

    class Config:
        from_attributes = True   # 👈 reemplazo de orm_mode


# ─── Pagos ──────────────────────────────────────────────────
class PagoBase(BaseModel):
    monto: float
    metodo: Optional[str] = None
    referencia: Optional[str] = None
    capture_url: Optional[str] = None

class PagoCreate(PagoBase):
    vendedora_id: int

class PagoResponse(PagoBase):
    id: int
    vendedora_id: int
    estado: str
    fecha: datetime

    class Config:
        from_attributes = True   # 👈 necesario para mapear desde SQLAlchemy


# ─── Configuración de límites ────────────────────────────────
class LimitsUpdate(BaseModel):
    diario: float
    semanal: float
    mensual: float
    costoExcedente: float
    applyToAll: bool = False

    class Config:
        from_attributes = True
