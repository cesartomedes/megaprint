from fastapi import APIRouter, UploadFile, File, Form, Depends
from sqlalchemy.orm import Session
from database import get_db
from typing import Optional
from models import Catalogo, Categoria
from schemas import CatalogoSchema
import os
import shutil

router = APIRouter()
UPLOAD_DIR = "uploads/catalogos/pdf"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# GET catálogo general
@router.get("/general", response_model=list[CatalogoSchema])
def get_catalogo_general(db: Session = Depends(get_db)):
    catalogos = db.query(Catalogo).all()
    result = []
    for c in catalogos:
        result.append(
            CatalogoSchema(
                id=c.id,
                nombre=c.nombre,
                categoria=c.categoria.nombre if c.categoria else None,
                vendedora_id=c.vendedora_id,
                url=c.url,
            )
        )
    return result

# GET catálogo por vendedora
@router.get("/vendedora/{vendedora_id}", response_model=list[CatalogoSchema])
def get_catalogo_vendedora(vendedora_id: int, db: Session = Depends(get_db)):
    catalogos = db.query(Catalogo).filter(Catalogo.vendedora_id == vendedora_id).all()
    result = [
        CatalogoSchema(
            id=c.id,
            nombre=c.nombre,
            categoria=c.categoria.nombre if c.categoria else None,
            vendedora_id=c.vendedora_id,
            url=c.url,
        )
        for c in catalogos
    ]
    return result

# POST agregar PDF
@router.post("/add", response_model=CatalogoSchema)
def add_pdf(
    file: UploadFile = File(...),
    nombre: str = Form(...),
    categoria_id: int = Form(...),
    vendedora_id: Optional[int] = Form(None),
    db: Session = Depends(get_db),
):
    filepath = os.path.join(UPLOAD_DIR, file.filename)
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Crear registro
    nuevo = Catalogo(
        nombre=nombre,
        categoria_id=categoria_id,
        vendedora_id=vendedora_id,
        url=f"http://127.0.0.1:8000/catalogos/files/{file.filename}",
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)

    # Traer nombre de la categoría
    categoria = db.query(Categoria).filter(Categoria.id == categoria_id).first()

    return CatalogoSchema(
        id=nuevo.id,
        nombre=nuevo.nombre,
        categoria=categoria.nombre if categoria else None,
        vendedora_id=nuevo.vendedora_id,
        url=nuevo.url,
    )

# DELETE PDF
@router.delete("/{pdf_id}")
def eliminar_pdf(pdf_id: int, db: Session = Depends(get_db)):
    catalogo = db.query(Catalogo).filter(Catalogo.id == pdf_id).first()
    if catalogo:
        db.delete(catalogo)
        db.commit()
        return {"msg": "PDF eliminado"}
    return {"msg": "PDF no encontrado"}
