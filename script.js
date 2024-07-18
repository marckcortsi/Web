const formIds = {
    entrega: 'formEntrega',
    finalizado: 'formFinalizado'
};
function mostrarFormulario(opcion) {
    document.querySelectorAll('.registro-form').forEach(form => form.classList.remove('active'));
    document.getElementById('registros').classList.remove('active');
    document.getElementById('opciones').classList.add('hidden');
    document.getElementById('tituloPrincipal').classList.add('hidden');
    document.getElementById(`registro${capitalize(opcion)}`).classList.add('active');
    document.getElementById('resumenTitulo').classList.add('hidden');  // Ocultar el título
}
function registrar(opcion) {
    const form = document.getElementById(formIds[opcion]);
    const nombre = form.querySelector('select[id^="nombre"]').value;
    const pedido = form.querySelector('input[id^="pedido"]').value;
    const fechaHora = form.querySelector('input[type="datetime-local"]').value;
    const timestamp = new Date();

    // Verificar formato del pedido
    if (!/^(GDL\d{6})$/.test(pedido)) {
        mostrarMensaje(opcion, 'El código de pedido debe comenzar con "GDL" seguido de 6 dígitos.');
        return;
    }

    // Verificar si el pedido ya ha sido registrado
    if (verificarDuplicado(opcion, pedido)) {
        mostrarAlerta(opcion);
        return;
    }

    const registro = {
        id: Date.now(),
        nombre,
        pedido,
        fechaHora: new Date(fechaHora).toISOString(),
        fechaRegistro: timestamp.toISOString(),
        tiempoTotal: calcularTiempoTotal(new Date(fechaHora), timestamp)
    };

    if (opcion === 'finalizado') {
        registro.estatus = document.getElementById('estatus').value;
        registro.observaciones = document.getElementById('observaciones').value;

        // Vincular con el registro de entrega correspondiente
        const entregaRegistros = JSON.parse(localStorage.getItem('entrega')) || [];
        const registroEntrega = entregaRegistros.find(r => r.pedido === pedido);
        if (registroEntrega) {
            registro.vinculadoConEntrega = registroEntrega.id;
        }
    }

    let registros = JSON.parse(localStorage.getItem(opcion)) || [];
    registros.push(registro);
    localStorage.setItem(opcion, JSON.stringify(registros));

    form.reset();
    mostrarMensaje(opcion, 'El registro se realizó exitosamente.');
    actualizarTablaRegistros();  // Llamar a la función después de registrar un nuevo pedido
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
    document.getElementById('resumenTitulo').classList.remove('hidden');  // Mostrar el título
}
function mostrarMensaje(opcion, mensaje) {
    document.getElementById(`mensaje${capitalize(opcion)}`).innerText = mensaje;
    setTimeout(() => {
        document.getElementById(`mensaje${capitalize(opcion)}`).innerText = '';
        cancelarRegistro();
    }, 3000);
}
function mostrarTodosRegistros() {
    mostrarRegistros();
    document.getElementById('registros').classList.add('active');
    document.getElementById('opciones').classList.add('hidden');
    document.getElementById('tituloPrincipal').classList.add('hidden');
    document.getElementById('resumenTitulo').classList.add('hidden');  // Ocultar el título
}
function mostrarRegistros() {
    const entregaRegistros = JSON.parse(localStorage.getItem('entrega')) || [];
    const finalizadoRegistros = JSON.parse(localStorage.getItem('finalizado')) || [];
    let listaHTML = '';

    entregaRegistros.forEach(entrega => {
        const finalizado = finalizadoRegistros.find(f => f.pedido === entrega.pedido);
        if (finalizado) {
            const tiempoSurtido = calcularTiempoTotal(new Date(entrega.fechaHora), new Date(entrega.fechaRegistro));
            const tiempoEmpaque = calcularTiempoTotal(new Date(finalizado.fechaHora), new Date(finalizado.fechaRegistro));
            const tiempoTotal = calcularTiempoTotal(new Date(entrega.fechaHora), new Date(finalizado.fechaRegistro));

            listaHTML += `
                <div class="registro vinculado" data-id="${entrega.id}">
                    <p><strong>Pedido:</strong> ${entrega.pedido}</p>
                    <p><strong>Surtido por:</strong> ${entrega.nombre}</p>
                    <p><strong>Tiempo de Surtido:</strong> ${tiempoSurtido}</p>
                    <p><strong>Empacado por:</strong> ${finalizado.nombre}</p>
                    <p><strong>Tiempo de Empaque:</strong> ${tiempoEmpaque}</p>
                    <p><strong>Estatus:</strong> ${finalizado.estatus}</p>
                    <p><strong>Observaciones:</strong> ${finalizado.observaciones}</p>
                    <p><strong>Tiempo Total del Proceso:</strong> ${tiempoTotal}</p>
                </div>`;
        } else {
            listaHTML += `
                <div class="registro entrega" data-id="${entrega.id}">
                    <p><strong>Pedido:</strong> ${entrega.pedido}</p>
                    <p><strong>Surtido por:</strong> ${entrega.nombre}</p>
                    <p><strong>Fecha y Hora:</strong> ${entrega.fechaHora}</p>
                    <p><strong>Fecha del Registro:</strong> ${entrega.fechaRegistro}</p>
                    <p><strong>Tiempo Total:</strong> ${entrega.tiempoTotal}</p>
                    <button onclick="editarRegistro('entrega', ${entrega.id})">Editar</button>
                    <button onclick="eliminarRegistro('entrega', ${entrega.id})">Eliminar</button>
                </div>`;
        }
    });

    finalizadoRegistros.forEach(finalizado => {
        const entrega = entregaRegistros.find(e => e.pedido === finalizado.pedido);
        if (!entrega) {
            listaHTML += `
                <div class="registro finalizado" data-id="${finalizado.id}">
                    <p><strong>Pedido:</strong> ${finalizado.pedido}</p>
                    <p><strong>Empacado por:</strong> ${finalizado.nombre}</p>
                    <p><strong>Fecha y Hora:</strong> ${finalizado.fechaHora}</p>
                    <p><strong>Fecha del Registro:</strong> ${finalizado.fechaRegistro}</p>
                    <p><strong>Tiempo Total:</strong> ${finalizado.tiempoTotal}</p>
                    <p><strong>Estatus:</strong> ${finalizado.estatus}</p>
                    <p><strong>Observaciones:</strong> ${finalizado.observaciones}</p>
                    <button onclick="editarRegistro('finalizado', ${finalizado.id})">Editar</button>
                    <button onclick="eliminarRegistro('finalizado', ${finalizado.id})">Eliminar</button>
                </div>`;
        }
    });

    document.getElementById('listaRegistros').innerHTML = listaHTML;
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
                if (registro.vinculadoConEntrega) {
                    listaHTML += `<p><strong>Vinculado con Entrega ID:</strong> ${registro.vinculadoConEntrega}</p>`;
                }
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

    // Guardar el ID del registro que se está editando en el formulario
    form.setAttribute('data-editing-id', id);
}
function guardarCambios(tipo) {
    const form = document.getElementById(formIds[tipo]);
    const id = form.getAttribute('data-editing-id');
    if (!id) return;

    const nombre = form.querySelector('select[id^="nombre"]').value;
    const pedido = form.querySelector('input[id^="pedido"]').value;
    const fechaHora = form.querySelector('input[type="datetime-local"]').value;

    // Verificar formato del pedido
    if (!/^(GDL\d{6})$/.test(pedido)) {
        mostrarMensaje(tipo, 'El código de pedido debe comenzar con "GDL" seguido de 6 dígitos.');
        return;
    }

    const registros = JSON.parse(localStorage.getItem(tipo)) || [];
    const index = registros.findIndex(r => r.id == id);
    if (index === -1) return;

    registros[index].nombre = nombre;
    registros[index].pedido = pedido;
    registros[index].fechaHora = new Date(fechaHora).toISOString(); // Asegurar que se guarde como ISO string
    registros[index].fechaRegistro = new Date().toISOString();

    if (tipo === 'finalizado') {
        registros[index].estatus = document.getElementById('estatus').value;
        registros[index].observaciones = document.getElementById('observaciones').value;
    }

    localStorage.setItem(tipo, JSON.stringify(registros));

    form.removeAttribute('data-editing-id');
    form.reset();
    mostrarMensaje(tipo, 'El registro se actualizó exitosamente.');
    actualizarTablaRegistros();
    cancelarRegistro();
}
function calcularTiempoTotal(fechaInicio, fechaFin) {
    const diff = fechaFin - fechaInicio;
    if (isNaN(diff)) return '0 horas y 0 minutos';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours} horas y ${minutes} minutos`;
}

function calcularTiempoTotalEnHorasYMinutos(fechaInicio, fechaFin) {
    const diff = fechaFin - fechaInicio;
    if (isNaN(diff)) return { horas: 0, minutos: 0 };
    const horas = Math.floor(diff / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { horas, minutos };
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
    const entregaRegistros = JSON.parse(localStorage.getItem('entrega')) || [];
    const finalizadoRegistros = JSON.parse(localStorage.getItem('finalizado')) || [];

    const wb = XLSX.utils.book_new();

    // Crear una hoja con todos los datos registrados
    const registrosData = [];

    entregaRegistros.forEach(entrega => {
        const finalizado = finalizadoRegistros.find(f => f.pedido === entrega.pedido);
        const tiempoSurtido = calcularTiempoTotalEnHorasYMinutos(new Date(entrega.fechaHora), new Date(entrega.fechaRegistro));
        const tiempoEmpaque = finalizado ? calcularTiempoTotalEnHorasYMinutos(new Date(finalizado.fechaHora), new Date(finalizado.fechaRegistro)) : { horas: 0, minutos: 0 };
        const tiempoTotalProceso = finalizado ? calcularTiempoTotalEnHorasYMinutos(new Date(entrega.fechaHora), new Date(finalizado.fechaRegistro)) : { horas: 0, minutos: 0 };

        registrosData.push([
            entrega.pedido,
            entrega.nombre,
            tiempoSurtido.horas,
            tiempoSurtido.minutos,
            entrega.fechaRegistro,
            finalizado ? finalizado.nombre : '',
            tiempoEmpaque.horas,
            tiempoEmpaque.minutos,
            finalizado ? finalizado.fechaRegistro : '',
            finalizado ? finalizado.estatus : '',
            finalizado ? finalizado.observaciones : '',
            tiempoTotalProceso.horas,
            tiempoTotalProceso.minutos
        ]);
    });

    // Agregar encabezados
    registrosData.unshift([
        'GDL',
        'USUARIO SURTIDO',
        'TIEMPO TOTAL HORAS',
        'TIEMPO TOTAL MINUTOS',
        'FECHA Y HORA DEL REGISTRO SURTIDO',
        'USUARIO DE EMPAQUE',
        'TOTAL HORAS EMPAQUE',
        'TOTAL MINUTOS EMPAQUE',
        'FECHA Y HORA DEL REGISTRO EMPAQUE',
        'STATUS',
        'OBSERVACIONES',
        'TIEMPO TOTAL DEL PROCESO HORAS',
        'TIEMPO TOTAL DEL PROCESO MINUTOS'
    ]);

    const ws = XLSX.utils.aoa_to_sheet(registrosData);
    XLSX.utils.book_append_sheet(wb, ws, 'Registros Completos');

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
window.onload = function() {
    setInterval(actualizarReloj, 1000);
    actualizarTablaRegistros();  // Llamar a la función al cargar la página
};
function calcularTiempoTotal(fechaInicio, fechaFin) {
    const diff = fechaFin - fechaInicio;
    if (isNaN(diff)) return '0 horas y 0 minutos';
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
