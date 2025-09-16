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
        from_attributes = True  # reemplazo de orm_mode

# ─── Catálogos ───────────────────────────────────────────────
class CatalogoSchema(BaseModel):
    id: int
    nombre: str
    categoria: Optional[str]  # Solo el nombre
    vendedora_id: Optional[int]
    url: str
    archivo: Optional[str] = None  # nombre del archivo en uploads

    class Config:
        from_attributes = True

# ─── Impresiones ─────────────────────────────────────────────
class ImpresionCreate(BaseModel):
    usuario_id: int
    catalogo_id: int
    fecha: date
    cantidad_impresa: int

class ImpresionResponse(BaseModel):
    id: int
    usuario_id: int
    catalogo_id: int
    fecha: date
    cantidad_impresa: int
    exceso: Optional[int] = 0
    costo_extra: Optional[float] = 0

    class Config:
        from_attributes = True

# ─── Deudas ─────────────────────────────────────────────────
class DeudaBase(BaseModel):
    vendedora_id: int
    monto: float
    catalogo_id: Optional[int] = None
    impresion_id: Optional[int] = None
    cantidad_excedida: Optional[int] = 0
    metodo: Optional[str] = None
    referencia: Optional[str] = None
    capture_url: Optional[str] = None
    tipo: Optional[str] = "diaria"

class DeudaCreate(DeudaBase):
    pass

class DeudaResponse(DeudaBase):
    id: int
    estado: str
    fecha: datetime

    class Config:
        from_attributes = True

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
        from_attributes = True

# ─── Configuración de límites ────────────────────────────────
class LimitsUpdate(BaseModel):
    diario: float
    semanal: float
    mensual: float
    costoExcedente: float
    applyToAll: bool = False

    class Config:
        from_attributes = True

# ─── Deuda por exceso (request interno) ─────────────────────
class DeudaExcesoCreate(BaseModel):
    usuario_id: int
    monto: float
    tipo: str

# ─── Notificaciones ─────────────────────────────────────────
class NotificacionResponse(BaseModel):
    id: int
    vendedora_id: int
    mensaje: str
    leido: bool
    fecha: datetime

    class Config:
        from_attributes = True

# ─── Request para impresión directa ─────────────────────────
class PrintRequest(BaseModel):
    file_path: str
    printer_name: str = "HPI21F282"
