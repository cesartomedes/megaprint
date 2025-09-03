from pydantic import BaseModel
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

    class Config:
        orm_mode = True