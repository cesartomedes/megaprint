[ VENDEDORA - Panel de Volantes ]
         |
         |--- Selección de volantes
         |
         |--- Contador diario/semanal (ya implementado)
         |--- Botón de Confirmar Impresión (ya implementado)
         |--- Modal de confirmación con detalle de volantes y costo extra (ya implementado)
         |
         V
[ Backend - Registro de impresión ]
         |
         |--- Guardar registro de cada impresión:
         |       - Usuario
         |       - Fecha
         |       - Cantidad de volantes impresos
         |       - Cantidad excedente
         |       - Costo extra generado
         |
         V
[ Lógica de límites y costos ]
         |
         |--- Verificar límite diario/semanal
         |--- Calcular costo extra si se excede
         |
         V
[ Notificación al Administrador ]
         |
         |--- Generar alerta si la vendedora excede el límite diario
         |--- Datos de la notificación:
         |       - Nombre de la vendedora
         |       - Fecha
         |       - Total impreso
         |       - Exceso de volantes
         |       - Costo extra
         |
         V
[ ADMINISTRADOR - Dashboard ]
         |
         |--- Panel de alertas/notificaciones (pendiente implementar)
         |       - Lista de alertas
         |       - Filtros por fecha, usuario, exceso
         |       - Posibilidad de marcar como revisada
