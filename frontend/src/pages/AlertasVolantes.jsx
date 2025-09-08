const AlertasVolantes = ({ totalHoy, limiteDiario, totalSemana, limiteSemanal }) => {
  return (
    <div className="flex flex-col gap-2">
      {totalHoy >= limiteDiario && (
        <div className="p-2 bg-red-500 text-white rounded">¡Has alcanzado el límite diario!</div>
      )}
      {totalHoy >= limiteDiario * 0.8 && totalHoy < limiteDiario && (
        <div className="p-2 bg-yellow-400 text-gray-900 rounded">
          Estás cerca del límite diario: {limiteDiario - totalHoy} impresiones restantes
        </div>
      )}
      {totalSemana >= limiteSemanal && (
        <div className="p-2 bg-red-500 text-white rounded">¡Has alcanzado el límite semanal!</div>
      )}
      {totalSemana >= limiteSemanal * 0.8 && totalSemana < limiteSemanal && (
        <div className="p-2 bg-yellow-400 text-gray-900 rounded">
          Estás cerca del límite semanal: {limiteSemanal - totalSemana} impresiones restantes
        </div>
      )}
    </div>
  );
};
