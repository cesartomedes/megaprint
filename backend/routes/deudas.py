# routes/deudas.py
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from database import get_db
from models import Deuda
from schemas import DeudaCreate, Deuda as DeudaSchema
from typing import List
import shutil
import os
from datetime import datetime

router = APIRouter(prefix="/deudas", tags=["Deudas"])

# ── Obtener todas las deudas
@router.get("/", response_model=List[DeudaSchema])
def get_all_deudas(db: Session = Depends(get_db)):
    return db.query(Deuda).order_by(Deuda.fecha.desc()).all()

# ── Obtener deudas de una vendedora
@router.get("/{vendedora_id}", response_model=List[DeudaSchema])
def get_deudas_vendedora(vendedora_id: int, db: Session = Depends(get_db)):
    return (
        db.query(Deuda)
        .filter(Deuda.vendedora_id == vendedora_id)
        .order_by(Deuda.fecha.desc())
        .all()
    )

# ── Crear nueva deuda
@router.post("/", response_model=DeudaSchema)
def create_deuda(deuda: DeudaCreate, db: Session = Depends(get_db)):
    nueva_deuda = Deuda(**deuda.dict())
    db.add(nueva_deuda)
    db.commit()
    db.refresh(nueva_deuda)
    return nueva_deuda

# ── Subir capture opcional
@router.post("/upload_capture/{deuda_id}")
def upload_capture(deuda_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    deuda = db.query(Deuda).filter(Deuda.id == deuda_id).first()
    if not deuda:
        raise HTTPException(status_code=404, detail="Deuda no encontrada")
    
    filename = f"uploads/captures/{datetime.utcnow().timestamp()}_{file.filename}"
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with open(filename, "wb") as f:
        shutil.copyfileobj(file.file, f)
    
    deuda.capture_url = f"/{filename}"
    db.commit()
    db.refresh(deuda)
    return {"message": "Capture subido", "capture_url": deuda.capture_url}

# ── Marcar deuda como pagada
@router.post("/pagar/{deuda_id}")
def pagar_deuda(deuda_id: int, db: Session = Depends(get_db)):
    deuda = db.query(Deuda).filter(Deuda.id == deuda_id).first()
    if not deuda:
        raise HTTPException(status_code=404, detail="Deuda no encontrada")
    
    deuda.estado = "Pagado"
    db.commit()
    db.refresh(deuda)
    return deuda
