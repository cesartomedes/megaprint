from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
import os
import shutil
import uuid

from database import get_db
from models import Catalogo, Categoria
from schemas import CatalogoSchema

router = APIRouter()

UPLOAD_DIR = "uploads/catalogos/pdf"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# -------------------
# GET: catálogo general (solo PDFs sin vendedora)
# -------------------
@router.get("/general", response_model=list[CatalogoSchema])
def get_catalogo_general(db: Session = Depends(get_db)):
    catalogos = db.query(Catalogo).filter(Catalogo.vendedora_id == None).all()
    result = [
        CatalogoSchema(
            id=c.id,
            nombre=c.nombre,
            categoria=c.categoria.nombre if c.categoria else None,
            vendedora_id=c.vendedora_id,
            url=f"/catalogos/files/{os.path.basename(c.url)}",
        )
        for c in catalogos
    ]
    return result

# -------------------
# GET: catálogo por vendedora (sus PDFs + generales)
# -------------------
@router.get("/vendedora/{vendedora_id}", response_model=list[CatalogoSchema])
def get_catalogo_vendedora(vendedora_id: int, db: Session = Depends(get_db)):
    catalogos = db.query(Catalogo).filter(
        or_(Catalogo.vendedora_id == vendedora_id, Catalogo.vendedora_id == None)
    ).all()
    result = [
        CatalogoSchema(
            id=c.id,
            nombre=c.nombre,
            categoria=c.categoria.nombre if c.categoria else None,
            vendedora_id=c.vendedora_id,
            url=f"/catalogos/files/{os.path.basename(c.url)}",
        )
        for c in catalogos
    ]
    return result

# -------------------
# POST: subir PDF
# -------------------
@router.post("/upload", response_model=CatalogoSchema)
async def upload_catalogo(
    file: UploadFile = File(...),
    nombre: str = Form(...),
    categoria_id: int = Form(...),
    vendedora_id: Optional[int] = Form(None),
    db: Session = Depends(get_db),
):
    # Nombre único para evitar sobrescribir
    nombre_unico = f"{uuid.uuid4().hex}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, nombre_unico)

    # Guardar archivo
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Guardar solo el nombre del archivo en DB
    nuevo = Catalogo(
        nombre=nombre,
        categoria_id=categoria_id,
        vendedora_id=vendedora_id,
        url=nombre_unico,
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)

    categoria = db.query(Categoria).filter(Categoria.id == categoria_id).first()

    return CatalogoSchema(
        id=nuevo.id,
        nombre=nuevo.nombre,
        categoria=categoria.nombre if categoria else None,
        vendedora_id=nuevo.vendedora_id,
        url=f"/catalogos/files/{nombre_unico}",
    )

# -------------------
# DELETE: eliminar PDF
# -------------------
@router.delete("/{pdf_id}")
def eliminar_pdf(pdf_id: int, db: Session = Depends(get_db)):
    catalogo = db.query(Catalogo).filter(Catalogo.id == pdf_id).first()
    if not catalogo:
        raise HTTPException(status_code=404, detail="PDF no encontrado")

    file_path = os.path.join(UPLOAD_DIR, os.path.basename(catalogo.url))
    if os.path.exists(file_path):
        os.remove(file_path)

    db.delete(catalogo)
    db.commit()
    return {"msg": "PDF eliminado correctamente"}
