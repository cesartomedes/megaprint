from pydantic import BaseModel, EmailStr
from typing import Optional

class VendedoraCreate(BaseModel):
    nombre: str
    email: str
    estado: str = "pendiente"

class VendedoraUpdate(BaseModel):
    nombre: str
    email: str
    estado: str
    
class CatalogoSchema(BaseModel):
    id: int
    nombre: str
    categoria: Optional[str]  # Solo el nombre
    vendedora_id: Optional[int]
    url: str
class VendedoraBase(BaseModel):
    nombre: str
    email: EmailStr

class VendedoraCreate(VendedoraBase):
    password: str

class VendedoraResponse(VendedoraBase):
    id: int
    estado: str

    class Config:
        from_attributes = True  # equivalente a orm_mode en Pydantic V1
class VolanteSchema(BaseModel):
    id: int
    nombre: str
    archivo: str
    vendedora_id: Optional[int] = None  # <--- permitir nulos
    estado: Optional[str]

    class Config:
        orm_mode = True 