// script.js
function exportarRegistros() {
    let entregaRegistros = JSON.parse(localStorage.getItem('entrega')) || [];
    let finalizadoRegistros = JSON.parse(localStorage.getItem('finalizado')) || [];

    const fechaInicio = new Date(document.getElementById('fechaInicio').value);
    const fechaFin = new Date(document.getElementById('fechaFin').value);

    entregaRegistros = entregaRegistros.filter(registro => {
        const fechaRegistro = new Date(registro.fecha);
        return fechaRegistro >= fechaInicio && fechaRegistro <= fechaFin;
    });

    finalizadoRegistros = finalizadoRegistros.filter(registro => {
        const fechaRegistro = new Date(registro.fecha);
        return fechaRegistro >= fechaInicio && fechaRegistro <= fechaFin;
    });

    let entregaData = entregaRegistros.map(registro => ({
        Nombre: registro.nombre,
        'GDL': registro.pedido,
        Fecha: registro.fecha
    }));

    let finalizadoData = finalizadoRegistros.map(registro => ({
        Nombre: registro.nombre,
        'GDL': registro.pedido,
        Fecha: registro.fecha,
        Estatus: registro.estatus,
        Observaciones: registro.observaciones
    }));

    let wb = XLSX.utils.book_new();

    let wsEntrega = XLSX.utils.json_to_sheet(entregaData);
    XLSX.utils.book_append_sheet(wb, wsEntrega, 'Registros de Entrega');

    let wsFinalizado = XLSX.utils.json_to_sheet(finalizadoData);
    XLSX.utils.book_append_sheet(wb, wsFinalizado, 'Registros de Finalizado');

    XLSX.writeFile(wb, 'registros.xlsx');
}