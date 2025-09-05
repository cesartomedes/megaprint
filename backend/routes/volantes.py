from typing import Optional, List
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
import shutil, os, uuid

from database import SessionLocal
from models import Catalogo
from schemas import CatalogoSchema  # asegúrate de que este schema refleje tu tabla Catalogo

router = APIRouter()
UPLOAD_DIR = "uploads/catalogos/pdf"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# -------------------
# Dependencia DB
# -------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -------------------
# POST: Subir PDF al catálogo
# -------------------
@router.post("/upload", response_model=CatalogoSchema)
async def upload_catalogo(
    file: UploadFile = File(...),
    vendedora_id: Optional[int] = Form(None),
    categoria_id: int = Form(...),
    db: Session = Depends(get_db)
):
    # Generar nombre único
    filename = f"{uuid.uuid4().hex}_{file.filename}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    
    # Guardar archivo físicamente
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Crear URL
    url = f"/catalogos/files/{filename}"

    # Guardar en DB
    nuevo_pdf = Catalogo(
        nombre=file.filename,
        categoria_id=categoria_id,
        vendedora_id=vendedora_id,
        url=url,
        archivo=filename
    )
    db.add(nuevo_pdf)
    db.commit()
    db.refresh(nuevo_pdf)

    return nuevo_pdf

# -------------------
# GET: PDFs por vendedora (solo los asignados o generales)
# -------------------
@router.get("/vendedora/{vendedora_id}", response_model=List[CatalogoSchema])
def get_catalogo_por_vendedora(vendedora_id: int, db: Session = Depends(get_db)):
    pdfs = db.query(Catalogo).filter(
        (Catalogo.vendedora_id == vendedora_id) | (Catalogo.vendedora_id == None)
    ).all()
    return pdfs

# -------------------
# GET: PDFs generales (vendedora_id == None)
# -------------------
@router.get("/general", response_model=List[CatalogoSchema])
def get_catalogo_general(db: Session = Depends(get_db)):
    pdfs = db.query(Catalogo).filter(Catalogo.vendedora_id == None).all()
    return pdfs

# -------------------
# DELETE: Eliminar PDF del catálogo
# -------------------
@router.delete("/{catalogo_id}")
def eliminar_catalogo(catalogo_id: int, db: Session = Depends(get_db)):
    pdf = db.query(Catalogo).filter(Catalogo.id == catalogo_id).first()
    if not pdf:
        raise HTTPException(status_code=404, detail="PDF no encontrado")
    
    # Eliminar archivo físico
    filepath = os.path.join(UPLOAD_DIR, pdf.archivo)
    if os.path.exists(filepath):
        os.remove(filepath)

    # Eliminar de DB
    db.delete(pdf)
    db.commit()
    return {"msg": "PDF eliminado correctamente"}
