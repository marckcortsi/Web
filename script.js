function mostrarFormulario(opcion) {
    document.querySelectorAll('.registro-form').forEach(form => form.classList.remove('active'));
    document.getElementById('registros').classList.remove('active');
    document.getElementById('opciones').classList.add('hidden');
    document.getElementById('tituloPrincipal').classList.add('hidden');
    document.getElementById(`registro${capitalize(opcion)}`).classList.add('active');
    document.getElementById('resumenTitulo').classList.add('hidden');
}
function registrar(opcion) {
    const form = document.getElementById(formIds[opcion]);
    const nombre = form.querySelector('select[id^="nombre"]').value;
    const pedido = form.querySelector('input[id^="pedido"]').value;
    const fechaHora = form.querySelector('input[type="datetime-local"]').value;
    const timestamp = new Date();

    if (verificarDuplicado(opcion, pedido)) {
        mostrarAlerta(opcion);
        return;
    }

    const registro = {
        id: Date.now(),
        nombre,
        pedido,
        fechaHora: formatDateTime(new Date(fechaHora)),
        fechaRegistro: formatDateTime(timestamp),
        tiempoTotal: calcularTiempoTotal(new Date(fechaHora), timestamp)
    };

    if (opcion === 'finalizado') {
        registro.estatus = document.getElementById('estatus').value;
        registro.observaciones = document.getElementById('observaciones').value;
    }

    let registros = JSON.parse(localStorage.getItem(opcion)) || [];
    registros.push(registro);
    localStorage.setItem(opcion, JSON.stringify(registros));

    form.reset();
    mostrarMensaje(opcion, 'El registro se realizó exitosamente.');
    actualizarTablaRegistros();
}
function verificarDuplicado(opcion, pedido) {
    let registros = JSON.parse(localStorage.getItem(opcion)) || [];
    return registros.some(registro => registro.pedido.toUpperCase() === pedido.toUpperCase());
}
function mostrarAlerta(opcion) {
    const mensaje = opcion === 'entrega'
        ? "ADVERTENCIA: EL PEDIDO QUE ESTÁ INGRESANDO YA HA SIDO REGISTRADO ANTERIORMENTE. POR FAVOR, VALIDAR QUE EL PEDIDO NO HAYA SIDO SURTIDO DOS VECES."
        : "ADVERTENCIA: EL PEDIDO YA HA SIDO REGISTRADO ANTERIORMENTE. POR FAVOR, VALIDAR NUEVAMENTE EL PEDIDO.";
    document.getElementById('alertaMensaje').innerText = mensaje;
    document.getElementById('alertaDuplicado').classList.add('active');
}
function cerrarAlerta() {
    document.getElementById('alertaDuplicado').classList.remove('active');
}
function cancelarRegistro() {
    document.querySelectorAll('.registro-form').forEach(form => form.classList.remove('active'));
    document.getElementById('registros').classList.remove('active');
    document.getElementById('opciones').classList.remove('hidden');
    document.getElementById('tituloPrincipal').classList.remove('hidden');
    document.getElementById('resumenTitulo').classList.remove('hidden');
}
function mostrarTodosRegistros() {
    mostrarRegistros();
    document.getElementById('registros').classList.add('active');
    document.getElementById('opciones').classList.add('hidden');
    document.getElementById('tituloPrincipal').classList.add('hidden');
    document.getElementById('resumenTitulo').classList.add('hidden');
}
function mostrarRegistros() {
    const tipos = ['entrega', 'finalizado'];
    let listaHTML = '';

    tipos.forEach(tipo => {
        const registros = JSON.parse(localStorage.getItem(tipo)) || [];
        registros.forEach(registro => {
            listaHTML += `<div class="registro ${tipo}" data-id="${registro.id}">
                            <p><strong>Nombre:</strong> ${registro.nombre}</p>
                            <p><strong>GDL:</strong> ${registro.pedido}</p>
                            <p><strong>Fecha y Hora:</strong> ${registro.fechaHora}</p>
                            <p><strong>Fecha del Registro:</strong> ${registro.fechaRegistro}</p>
                            <p><strong>Tiempo Total:</strong> ${registro.tiempoTotal}</p>`;
            if (tipo === 'finalizado') {
                listaHTML += `<p><strong>Estatus:</strong> ${registro.estatus}</p>
                              <p><strong>Observaciones:</strong> ${registro.observaciones}</p>`;
            }
            listaHTML += `<button onclick="editarRegistro('${tipo}', ${registro.id})">Editar</button>
                          <button onclick="eliminarRegistro('${tipo}', ${registro.id})">Eliminar</button>
                          </div>`;
        });
    });

    document.getElementById('listaRegistros').innerHTML = listaHTML;
}
function editarRegistro(tipo, id) {
    const registros = JSON.parse(localStorage.getItem(tipo)) || [];
    const registro = registros.find(r => r.id === id);
    
    if (!registro) return;

    const form = document.getElementById(formIds[tipo]);
    form.querySelector('select[id^="nombre"]').value = registro.nombre;
    form.querySelector('input[id^="pedido"]').value = registro.pedido;
    form.querySelector('input[type="datetime-local"]').value = new Date(registro.fechaHora).toISOString().slice(0, 16);

    if (tipo === 'finalizado') {
        document.getElementById('estatus').value = registro.estatus;
        document.getElementById('observaciones').value = registro.observaciones;
    }

    mostrarFormulario(tipo);

    eliminarRegistro(tipo, id);
}
function eliminarRegistro(tipo, id) {
    let registros = JSON.parse(localStorage.getItem(tipo)) || [];
    registros = registros.filter(registro => registro.id !== id);
    localStorage.setItem(tipo, JSON.stringify(registros));
    mostrarRegistros();
    actualizarTablaRegistros();
}
function buscarPorPedido() {
    const pedidoBusqueda = document.getElementById('pedidoBusqueda').value.trim().toUpperCase();
    if (!pedidoBusqueda) return;

    const tipos = ['entrega', 'finalizado'];
    let listaHTML = '';

    tipos.forEach(tipo => {
        const registros = (JSON.parse(localStorage.getItem(tipo)) || []).filter(registro => registro.pedido.toUpperCase().includes(pedidoBusqueda));
        registros.forEach(registro => {
            listaHTML += `<div class="registro ${tipo}" data-id="${registro.id}">
                            <p><strong>Nombre:</strong> ${registro.nombre}</p>
                            <p><strong>GDL:</strong> ${registro.pedido}</p>
                            <p><strong>Fecha y Hora:</strong> ${registro.fechaHora}</p>
                            <p><strong>Fecha del Registro:</strong> ${registro.fechaRegistro}</p>
                            <p><strong>Tiempo Total:</strong> ${registro.tiempoTotal}</p>`;
            if (tipo === 'finalizado') {
                listaHTML += `<p><strong>Estatus:</strong> ${registro.estatus}</p>
                              <p><strong>Observaciones:</strong> ${registro.observaciones}</p>`;
            }
            listaHTML += `<button onclick="editarRegistro('${tipo}', ${registro.id})">Editar</button>
                          <button onclick="eliminarRegistro('${tipo}', ${registro.id})">Eliminar</button>
                          </div>`;
        });
    });

    document.getElementById('listaRegistros').innerHTML = listaHTML;
}
function borrarFiltro() {
    document.getElementById('pedidoBusqueda').value = '';
    mostrarRegistros();
}
function calcularTiempoTotal(fechaInicio, fechaFin) {
    const diff = fechaFin - fechaInicio;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours} horas y ${minutes} minutos`;
}
function formatDateTime(date) {
    return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    }).format(date);
}
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
function exportarRegistros() {
    const fechaInicio = document.getElementById('fechaInicio').value;
    const fechaFin = document.getElementById('fechaFin').value;

    if (!fechaInicio || !fechaFin) {
        alert("Por favor, seleccione un rango de fechas válido.");
        return;
    }

    const fechaInicioObj = new Date(fechaInicio);
    const fechaFinObj = new Date(fechaFin);
    fechaFinObj.setHours(23, 59, 59, 999); // Asegurarse de incluir todo el día de la fecha final

    const entregaRegistros = JSON.parse(localStorage.getItem('entrega')) || [];
    const finalizadoRegistros = JSON.parse(localStorage.getItem('finalizado')) || [];

    const wb = XLSX.utils.book_new();

    // Función para filtrar registros por rango de fechas
    function filtrarRegistrosPorFecha(registros, fechaInicio, fechaFin) {
        return registros.filter(registro => {
            const fechaRegistro = new Date(registro.fechaRegistro);
            return fechaRegistro >= fechaInicio && fechaRegistro <= fechaFin;
        });
    }

    // Filtrar registros de entrega por rango de fechas
    const entregaFiltrados = filtrarRegistrosPorFecha(entregaRegistros, fechaInicioObj, fechaFinObj);

    if (entregaFiltrados.length > 0) {
        // Crear hoja para registros de entrega
        const entregaData = entregaFiltrados.map(registro => [
            registro.pedido,
            registro.nombre,
            registro.fechaHora,
            registro.fechaRegistro,
            Math.floor(registro.tiempoTotal.split(' ')[0]), // horas
            Math.floor(registro.tiempoTotal.split(' ')[3])  // minutos
        ]);
        entregaData.unshift(['GDL', 'Usuario', 'Fecha de Impresión de Documento', 'Fecha del Registro', 'Horas Transcurridas', 'Minutos Transcurridos']);
        const entregaWS = XLSX.utils.aoa_to_sheet(entregaData);
        XLSX.utils.book_append_sheet(wb, entregaWS, 'Registros de Entrega');
    }

    // Filtrar registros de finalizado por rango de fechas
    const finalizadoFiltrados = filtrarRegistrosPorFecha(finalizadoRegistros, fechaInicioObj, fechaFinObj);

    if (finalizadoFiltrados.length > 0) {
        // Crear hoja para registros de finalizado
        const finalizadoData = finalizadoFiltrados.map(registro => [
            registro.pedido,
            registro.nombre,
            registro.fechaHora,
            registro.fechaRegistro,
            Math.floor(registro.tiempoTotal.split(' ')[0]), // horas
            Math.floor(registro.tiempoTotal.split(' ')[3]), // minutos
            registro.estatus, // agregar campo estatus
            registro.observaciones // agregar campo observaciones
        ]);
        finalizadoData.unshift(['GDL', 'Usuario', 'Fecha y Hora de Inicio de Empaque', 'Fecha del Registro', 'Horas Transcurridas', 'Minutos Transcurridos', 'Estatus', 'Observaciones']);
        const finalizadoWS = XLSX.utils.aoa_to_sheet(finalizadoData);
        XLSX.utils.book_append_sheet(wb, finalizadoWS, 'Registros Finalizados');
    }

    if (entregaFiltrados.length === 0 && finalizadoFiltrados.length === 0) {
        alert("No hay registros dentro del rango de fechas seleccionado.");
        return;
    }

    // Fecha actual para el nombre del archivo
    const fechaActual = formatDate(new Date());
    const nombreArchivo = `Registros_${fechaActual}.xlsx`;

    XLSX.writeFile(wb, nombreArchivo);
}

function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}
function volverAlPrincipal() {
    document.getElementById('registros').classList.remove('active');
    document.getElementById('listaRegistros').innerHTML = '';
    document.getElementById('opciones').classList.remove('hidden');
    document.getElementById('tituloPrincipal').classList.remove('hidden');
    document.getElementById('resumenTitulo').classList.remove('hidden');
}
function actualizarReloj() {
    const now = new Date();
    const horas = now.getHours() % 12 || 12;
    const minutos = String(now.getMinutes()).padStart(2, '0');
    const segundos = String(now.getSeconds()).padStart(2, '0');
    const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
    document.getElementById('reloj').innerText = `${horas}:${minutos}:${segundos} ${ampm}`;
}
function mostrarMensaje(opcion, mensaje) {
    document.getElementById(`mensaje${capitalize(opcion)}`).innerText = mensaje;
    setTimeout(() => {
        document.getElementById(`mensaje${capitalize(opcion)}`).innerText = '';
        cancelarRegistro();
    }, 3000);
}
function actualizarTablaRegistros() {
    const entregaRegistros = JSON.parse(localStorage.getItem('entrega')) || [];
    const finalizadoRegistros = JSON.parse(localStorage.getItem('finalizado')) || [];

    const contarRegistrosPorUsuario = (registros) => {
        return registros.reduce((contador, registro) => {
            if (!contador[registro.nombre]) {
                contador[registro.nombre] = { count: 0, totalTime: 0 };
            }
            contador[registro.nombre].count++;
            contador[registro.nombre].totalTime += obtenerTiempoEnMinutos(registro.tiempoTotal);
            return contador;
        }, {});
    };

    const obtenerTiempoEnMinutos = (tiempoTotal) => {
        const [horas, minutos] = tiempoTotal.split(' horas y ');
        return parseInt(horas) * 60 + parseInt(minutos);
    };

    const calcularTiempoPromedio = (totalTime, count) => {
        const promedio = totalTime / count;
        const horas = Math.floor(promedio / 60);
        const minutos = Math.floor(promedio % 60);
        return `${horas} horas y ${minutos} minutos`;
    };

    const registrosSurtido = contarRegistrosPorUsuario(entregaRegistros);
    const registrosEmpaque = contarRegistrosPorUsuario(finalizadoRegistros);

    const crearFilasTabla = (registros) => {
        return Object.entries(registros).map(([usuario, datos]) => {
            const tiempoPromedio = calcularTiempoPromedio(datos.totalTime, datos.count);
            return `<tr><td>${usuario}</td><td>${datos.count}</td><td>${tiempoPromedio}</td></tr>`;
        }).join('');
    };

    document.querySelector('#tablaSurtido tbody').innerHTML = crearFilasTabla(registrosSurtido);
    document.querySelector('#tablaEmpaque tbody').innerHTML = crearFilasTabla(registrosEmpaque);
}

// Inicializar la página
window.onload = function() {
    setInterval(actualizarReloj, 1000);
    actualizarTablaRegistros();  // Llamar a la función al cargar la página
};
