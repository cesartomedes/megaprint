# backend/routes/auth.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

# Modelos
class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str

# Login
@router.post("/login")
async def login(data: LoginRequest):
    if data.username == "admin" and data.password == "1234":
        return {"msg": "Login exitoso", "role": "admin"}
    elif data.username == "vendedora" and data.password == "1234":
        return {"msg": "Login exitoso", "role": "vendedora"}
    else:
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrecta")

# Registro
@router.post("/register")
async def register(data: RegisterRequest):
    return {"msg": "Usuario creado", "username": data.username, "role": "vendedora"}
