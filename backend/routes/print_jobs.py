from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class PrintRequest(BaseModel):
    volante_id: int
    copies: int
    user_id: int

@router.post("/request")
async def request_print(data: PrintRequest):
    # Aquí guardamos en BD el trabajo
    return {"msg": f"Trabajo agregado: {data.copies} copias del volante {data.volante_id}"}
