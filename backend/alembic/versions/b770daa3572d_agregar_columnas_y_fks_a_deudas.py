"""Agregar columnas y FKs a deudas (SQLite safe)

Revision ID: b770daa3572d
Revises: 3925033a9db0
Create Date: 2025-09-11 15:50:00

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'b770daa3572d'
down_revision = '3925033a9db0'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Creamos una tabla nueva con las columnas y FKs
    op.execute("""
    CREATE TABLE deudas_new (
        id INTEGER PRIMARY KEY,
        vendedora_id INTEGER,
        monto REAL,
        cantidad_excedida INTEGER,
        metodo TEXT,
        referencia TEXT,
        capture_url TEXT,
        estado TEXT,
        fecha TEXT,
        tipo TEXT,
        volante_id INTEGER,
        impresion_id INTEGER,
        FOREIGN KEY(volante_id) REFERENCES volantes(id),
        FOREIGN KEY(impresion_id) REFERENCES impresiones(id)
    );
    """)

    # Copiamos los datos de la tabla antigua a la nueva
    op.execute("""
    INSERT INTO deudas_new (
        id, vendedora_id, monto, cantidad_excedida, metodo, referencia, capture_url, estado, fecha, tipo
    )
    SELECT id, vendedora_id, monto, cantidad_excedida, metodo, referencia, capture_url, estado, fecha, tipo
    FROM deudas;
    """)

    # Borramos la tabla antigua y renombramos la nueva
    op.execute("DROP TABLE deudas;")
    op.execute("ALTER TABLE deudas_new RENAME TO deudas;")


def downgrade() -> None:
    # Revertimos a la tabla antigua sin las columnas nuevas
    op.execute("""
    CREATE TABLE deudas_old (
        id INTEGER PRIMARY KEY,
        vendedora_id INTEGER,
        monto REAL,
        cantidad_excedida INTEGER,
        metodo TEXT,
        referencia TEXT,
        capture_url TEXT,
        estado TEXT,
        fecha TEXT,
        tipo TEXT
    );
    """)

    op.execute("""
    INSERT INTO deudas_old (
        id, vendedora_id, monto, cantidad_excedida, metodo, referencia, capture_url, estado, fecha, tipo
    )
    SELECT id, vendedora_id, monto, cantidad_excedida, metodo, referencia, capture_url, estado, fecha, tipo
    FROM deudas;
    """)

    op.execute("DROP TABLE deudas;")
    op.execute("ALTER TABLE deudas_old RENAME TO deudas;")
