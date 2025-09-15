# routes/deudas.py
from fastapi import APIRouter,  UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from database import get_db
from models import Deuda, Vendedora, Notificacion
import shutil
from datetime import datetime


import os

UPLOAD_DIR = "uploads/comprobantes"
os.makedirs(UPLOAD_DIR, exist_ok=True)
router = APIRouter()

@router.get("/deudas")
def obtener_deudas(db: Session = Depends(get_db)):
    # Traer vendedoras con deudas pendientes o en verificación, sumando monto
    vendedoras = db.query(
        Deuda.vendedora_id,
        Vendedora.nombre,
        func.count(Deuda.id).label("cantidad_deudas"),
        func.sum(Deuda.monto).label("total_deuda")
    ).join(Vendedora, Vendedora.id == Deuda.vendedora_id) \
     .filter(Deuda.estado.in_(["pendiente", "pendiente_verificacion"])) \
     .group_by(Deuda.vendedora_id, Vendedora.nombre) \
     .all()

    resultado = []

    for v in vendedoras:
        # Detalle de deudas
        deudas_detalle = db.query(Deuda).filter(
            Deuda.vendedora_id == v.vendedora_id,
            Deuda.estado.in_(["pendiente", "pendiente_verificacion"])
        ).all()

        deudas_list = []
        for d in deudas_detalle:
            deudas_list.append({
                "id": d.id,
                "monto": d.monto,
                "cantidad_excedida": d.cantidad_excedida,
                "metodo": d.metodo,
                "referencia": d.referencia,
                "capture_url": d.capture_url,
                "estado": d.estado,
                "fecha": d.fecha.strftime("%Y-%m-%d %H:%M:%S"),
                "tipo": d.tipo,
                "volante_id": d.volante_id,
                "impresion_id": d.impresion_id
            })

        resultado.append({
            "vendedora_id": v.vendedora_id,
            "nombre": v.nombre,
            "cantidad_deudas": v.cantidad_deudas,
            "total_deuda": float(v.total_deuda),
            "deudas": deudas_list
        })

    return resultado


@router.get("/deudas/{usuario_id}")
def obtener_deudas_usuario(usuario_id: int, db: Session = Depends(get_db)):
    """
    Devuelve todas las deudas pendientes de un usuario,
    acumulando correctamente los montos extras y respetando los tipos.
    """
    deudas = db.query(Deuda).filter(
        Deuda.vendedora_id == usuario_id,
        Deuda.estado == "pendiente"  # solo pendientes
    ).order_by(Deuda.fecha.asc()).all()

    resultado = []
    total_deuda = 0.0

    for d in deudas:
        monto = d.monto
        total_deuda += monto
        resultado.append({
            "id": d.id,
            "monto": float(monto),
            "cantidad_excedida": d.cantidad_excedida,
            "referencia": d.referencia,
            "tipo": d.tipo,
            "fecha": d.fecha.strftime("%Y-%m-%d %H:%M:%S"),
            "estado": d.estado
        })

    return {
        "usuario_id": usuario_id,
        "total_deuda": float(total_deuda),
        "deudas": resultado
    }


@router.post("/registrar-pago")
async def registrar_pago(
    deuda_id: int = Form(...),
    banco: str = Form(...),
    referencia: str = Form(...),
    comprobante: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Buscar la deuda
    deuda = db.query(Deuda).filter(Deuda.id == deuda_id).first()
    if not deuda:
        raise HTTPException(status_code=404, detail="Deuda no encontrada")

    # Guardar archivo comprobante
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    filename = f"{deuda_id}_{timestamp}_{comprobante.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(comprobante.file, buffer)

    # Actualizar deuda
    deuda.metodo = banco
    deuda.referencia = referencia
    deuda.capture_url = file_path
    deuda.estado = "pendiente_verificacion"  # 👈 pasa a estado intermedio
    db.commit()
    db.refresh(deuda)

    return {"message": "Pago registrado correctamente", "deuda": deuda.id}

@router.post("/aprobar-pago/{deuda_id}")
def aprobar_pago(deuda_id: int, db: Session = Depends(get_db)):
    """
    Endpoint para que un admin apruebe un pago y cambie
    el estado de la deuda a 'pagado'.
    """
    deuda = db.query(Deuda).filter(Deuda.id == deuda_id).first()
    if not deuda:
        raise HTTPException(status_code=404, detail="Deuda no encontrada")
    
    if deuda.estado != "pendiente_verificacion":
        raise HTTPException(status_code=400, detail="La deuda no está en estado pendiente de verificación")

    # Cambiar estado a pagado
    deuda.estado = "pagado"
    db.commit()
    db.refresh(deuda)
    
    mensaje = f"Tu pago de ${deuda.monto:.2f} (deuda #{deuda.id}) ha sido aprobado ✅"
    n = Notificacion(vendedora_id=deuda.vendedora_id, mensaje=mensaje)
    db.add(n)
    db.commit()

    return {"message": f"Deuda {deuda_id} aprobada correctamente", "deuda_id": deuda.id}

from schemas import DeudaExcesoCreate

@router.post("/crear-exceso")
def crear_exceso(
    data: DeudaExcesoCreate,
    db: Session = Depends(get_db)
):
    vendedora = db.query(Vendedora).filter(Vendedora.id == data.usuario_id).first()
    if not vendedora:
        raise HTTPException(status_code=404, detail="Vendedora no encontrada")

    nueva_deuda = Deuda(
        vendedora_id=data.usuario_id,
        monto=data.monto,
        referencia=f"{data.monto} excedió el límite",
        tipo=data.tipo,
        fecha=datetime.now(),
        estado="pendiente"
    )
    db.add(nueva_deuda)
    db.commit()
    db.refresh(nueva_deuda)

    return {
        "message": "Deuda creada exitosamente",
        "deuda": {
            "id": nueva_deuda.id,
            "usuario_id": data.usuario_id,
            "monto": float(data.monto),
            "tipo": data.tipo,
            "fecha": nueva_deuda.fecha.strftime("%Y-%m-%d %H:%M:%S"),
            "estado": nueva_deuda.estado
        }
    }

@router.post("/rechazar-pago/{deuda_id}")
def rechazar_pago(deuda_id: int, db: Session = Depends(get_db)):
    deuda = db.query(Deuda).filter(Deuda.id == deuda_id).first()
    if not deuda:
        raise HTTPException(status_code=404, detail="Deuda no encontrada")
    
    if deuda.estado != "pendiente_verificacion":
        raise HTTPException(status_code=400, detail="La deuda no está en estado pendiente de verificación")
    
    # Cambiar estado a rechazado
    deuda.estado = "rechazado"
    db.commit()
    db.refresh(deuda)
    
    mensaje = f"Tu pago de ${deuda.monto:.2f} (deuda #{deuda.id}) fue rechazado. Por favor revisa el comprobante o contacta soporte."
    n = Notificacion(vendedora_id=deuda.vendedora_id, mensaje=mensaje)
    db.add(n)
    db.commit()
    
    return {"message": f"Deuda {deuda_id} rechazada correctamente", "deuda_id": deuda.id}
