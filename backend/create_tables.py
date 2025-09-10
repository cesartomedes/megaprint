from models import Base, Pago, Deuda, Vendedora, Volante, Catalogo, Categoria, Impresion
from database import engine

# Esto creará todas las tablas que aún no existan
Base.metadata.create_all(bind=engine)

print("Tablas creadas correctamente ✅")
