from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Categoria
from pydantic import BaseModel

router = APIRouter()

# Schema para request/response
class CategoriaCreate(BaseModel):
    nombre: str

class CategoriaResponse(BaseModel):
    id: int
    nombre: str
    class Config:
        orm_mode = True

# Listar categorías
@router.get("/", response_model=list[CategoriaResponse])
def listar_categorias(db: Session = Depends(get_db)):
    return db.query(Categoria).all()

# Crear categoría
@router.post("/", response_model=CategoriaResponse)
def crear_categoria(categoria: CategoriaCreate, db: Session = Depends(get_db)):
    existing = db.query(Categoria).filter(Categoria.nombre == categoria.nombre).first()
    if existing:
        raise HTTPException(status_code=400, detail="Categoría ya existe")
    nueva = Categoria(nombre=categoria.nombre)
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva

# Actualizar categoría
@router.put("/{categoria_id}", response_model=CategoriaResponse)
def actualizar_categoria(categoria_id: int, categoria: CategoriaCreate, db: Session = Depends(get_db)):
    cat = db.query(Categoria).get(categoria_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    cat.nombre = categoria.nombre
    db.commit()
    db.refresh(cat)
    return cat

# Eliminar categoría
@router.delete("/{categoria_id}")
def eliminar_categoria(categoria_id: int, db: Session = Depends(get_db)):
    cat = db.query(Categoria).get(categoria_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    db.delete(cat)
    db.commit()
    return {"detail": "Categoría eliminada"}
