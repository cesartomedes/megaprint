from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from database import get_db
from models import Vendedora
from schemas import VendedoraCreate, VendedoraResponse

router = APIRouter()

# Login
class LoginRequest(BaseModel):
    username: str  # Este será el "nombre" del usuario
    password: str

@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    # Buscar usuario por nombre
    usuario = db.query(Vendedora).filter(Vendedora.nombre == data.username).first()
    if not usuario or usuario.password != data.password:
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrecta")

    if usuario.estado != "aprobada":
        raise HTTPException(status_code=403, detail="Tu cuenta está pendiente de aprobación")

    return {
        "msg": "Login exitoso",
        "id": usuario.id,
        "role": usuario.role,
        "username": usuario.nombre  # Devuelve "nombre" como "username"
    }



# Registro de vendedoras
@router.post("/register", response_model=VendedoraResponse)
def register(data: VendedoraCreate, db: Session = Depends(get_db)):
    # Verificar si ya existe
    existe = db.query(Vendedora).filter(Vendedora.email == data.email).first()
    if existe:
        raise HTTPException(status_code=400, detail="El correo ya está registrado")

    nueva_vendedora = Vendedora(
        nombre=data.nombre,
        email=data.email,
        password=data.password,  # ⚠️ más adelante usar hashing
        estado="pendiente",
        role="vendedora"
    )
    db.add(nueva_vendedora)
    db.commit()
    db.refresh(nueva_vendedora)

    return nueva_vendedora


# Función helper para validar rol (puede usarse en dependencias)
def admin_required(usuario: Vendedora = Depends(lambda db=Depends(get_db): None)):
    if not usuario or usuario.role != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    return usuario
