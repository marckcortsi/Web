const formIds = {
  entrega: 'formEntrega',
  finalizado: 'formFinalizado'
};

function mostrarFormulario(opcion) {
  document.querySelectorAll('.registro-form').forEach(form => form.classList.remove('active'));
  document.getElementById('registros').classList.remove('active');
  document.getElementById('opciones').style.display = 'none';
  document.getElementById('tituloPrincipal').style.display = 'none';
  document.getElementById(`registro${capitalize(opcion)}`).classList.add('active');
}

function registrar(opcion) {
  const form = document.getElementById(formIds[opcion]);
  const nombre = form.querySelector('select[id^="nombre"]').value;
  const pedido = form.querySelector('input[id^="pedido"]').value;
  const fechaHora = form.querySelector('input[type="datetime-local"]').value;
  const timestamp = new Date();

  if (!nombre || !pedido || !fechaHora) {
    mostrarMensaje(opcion, 'Todos los campos son obligatorios.', 'error');
    return;
  }

  if (verificarDuplicado(opcion, pedido)) {
    mostrarAlerta(opcion);
    return;
  }

  const registro = {
    nombre,
    pedido,
    fechaHora: formatDateTime(new Date(fechaHora)),
    fechaRegistro: formatDateTime(timestamp),
    tiempoTotal: calcularTiempoTotal(new Date(fechaHora), timestamp)
  };

  if (opcion === 'finalizado') {
    registro.estatus = form.querySelector('#estatus').value;
    registro.observaciones = form.querySelector('#observaciones').value;
  }

  let registros = JSON.parse(localStorage.getItem(opcion)) || [];
  registros.push(registro);
  localStorage.setItem(opcion, JSON.stringify(registros));

  form.reset();
  mostrarMensaje(opcion, 'El registro se realizó exitosamente.');
}

function verificarDuplicado(opcion, pedido) {
  let registros = JSON.parse(localStorage.getItem(opcion)) || [];
  return registros.some(registro => registro.pedido.toUpperCase() === pedido.toUpperCase());
}

function mostrarAlerta(opcion) {
  const mensaje = opcion === 'entrega'
    ? "ADVERTENCIA: El pedido ya ha sido registrado con anterioridad. Favor de validar que no haya sido surtido dos veces."
    : "ADVERTENCIA: El pedido ya ha sido registrado con anterioridad. Favor de validar nuevamente el pedido.";
  document.getElementById('alertaMensaje').innerText = mensaje;
  document.getElementById('alertaDuplicado').classList.add('active');
}

function cerrarAlerta() {
  document.getElementById('alertaDuplicado').classList.remove('active');
}

function cancelarRegistro() {
  document.querySelectorAll('.registro-form').forEach(form => form.classList.remove('active'));
  document.getElementById('opciones').style.display = 'flex';
  document.getElementById('tituloPrincipal').style.display = 'block';
}

function mostrarTodosRegistros() {
  mostrarRegistros();
  document.getElementById('registros').classList.add('active');
  document.getElementById('opciones').style.display = 'none';
  document.getElementById('tituloPrincipal').style.display = 'none';
}

function mostrarRegistros() {
  const tipos = ['entrega', 'finalizado'];
  let listaHTML = '';

  tipos.forEach(tipo => {
    const registros = JSON.parse(localStorage.getItem(tipo)) || [];
    registros.forEach((registro, index) => {
      listaHTML += `<div class="registro ${tipo}">
                      <p><strong>Nombre:</strong> ${registro.nombre}</p>
                      <p><strong>GDL:</strong> ${registro.pedido}</p>
                      <p><strong>Fecha y Hora:</strong> ${registro.fechaHora}</p>
                      <p><strong>Fecha del Registro:</strong> ${registro.fechaRegistro}</p>
                      <p><strong>Tiempo Total:</strong> ${registro.tiempoTotal}</p>`;
      if (tipo === 'finalizado') {
        listaHTML += `<p><strong>Estatus:</strong> ${registro.estatus}</p>
                      <p><strong>Observaciones:</strong> ${registro.observaciones}</p>`;
      }
      listaHTML += `<button onclick="eliminarRegistro('${tipo}', ${index})">Eliminar</button>
                    <button onclick="editarRegistro('${tipo}', ${index})">Editar</button>
                  </div>`;
    });
  });

  document.getElementById('listaRegistros').innerHTML = listaHTML;
}

function eliminarRegistro(tipo, index) {
  let registros = JSON.parse(localStorage.getItem(tipo)) || [];
  registros.splice(index, 1);
  localStorage.setItem(tipo, JSON.stringify(registros));
  mostrarRegistros();
}

function editarRegistro(tipo, index) {
  const registro = JSON.parse(localStorage.getItem(tipo))[index];
  mostrarFormulario(tipo);
  const form = document.getElementById(formIds[tipo]);
  form.querySelector('select[id^="nombre"]').value = registro.nombre;
  form.querySelector('input[id^="pedido"]').value = registro.pedido;
  form.querySelector('input[type="datetime-local"]').value = new Date(registro.fechaHora).toISOString().slice(0, -1);

  if (tipo === 'finalizado') {
    form.querySelector('#estatus').value = registro.estatus;
    form.querySelector('#observaciones').value = registro.observaciones;
  }

  eliminarRegistro(tipo, index);
}

function buscarPorPedido() {
  const pedidoBusqueda = document.getElementById('pedidoBusqueda').value.trim().toUpperCase();
  if (!pedidoBusqueda) return;

  const tipos = ['entrega', 'finalizado'];
  let listaHTML = '';

  tipos.forEach(tipo => {
    const registros = (JSON.parse(localStorage.getItem(tipo)) || []).filter(registro => registro.pedido.toUpperCase().includes(pedidoBusqueda));
    registros.forEach(registro => {
      listaHTML += `<div class="registro ${tipo}">
                      <p><strong>Nombre:</strong> ${registro.nombre}</p>
                      <p><strong>GDL:</strong> ${registro.pedido}</p>
                      <p><strong>Fecha y Hora:</strong> ${registro.fechaHora}</p>
                      <p><strong>Fecha del Registro:</strong> ${registro.fechaRegistro}</p>
                      <p><strong>Tiempo Total:</strong> ${registro.tiempoTotal}</p>`;
      if (tipo === 'finalizado') {
        listaHTML += `<p><strong>Estatus:</strong> ${registro.estatus}</p>
                      <p><strong>Observaciones:</strong> ${registro.observaciones}</p>`;
      }
      listaHTML += `</div>`;
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
  const tipos = ['entrega', 'finalizado'];
  let wb = XLSX.utils.book_new();

  tipos.forEach(tipo => {
    const registros = JSON.parse(localStorage.getItem(tipo)) || [];
    const data = registros.map(registro => {
      const [hours, minutes] = registro.tiempoTotal.match(/\d+/g); // Extraer horas y minutos del tiempo total
      const commonData = {
        Nombre: registro.nombre,
        GDL: registro.pedido,
        'Fecha y Hora': registro.fechaHora,
        'Fecha del Registro': registro.fechaRegistro,
        'Horas': hours,
        'Minutos': minutes
      };
      return tipo === 'finalizado' ? { ...commonData, Estatus: registro.estatus, Observaciones: registro.observaciones } : commonData;
    });
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, `Registros de ${capitalize(tipo)}`);
  });

  const registrosEmpaque = JSON.parse(localStorage.getItem('empaque')) || [];
  const registrosSurtido = JSON.parse(localStorage.getItem('surtido')) || [];
  const fechaImpresion = new Date();
  const fechaImpresionISO = fechaImpresion.toISOString();
  let nuevaHojaData = [['GDL', 'Fecha de Impresión', 'Fecha de Registro de Empaque', 'Usuario de Surtido', 'Usuario de Empaque', 'Tiempo Total']];

  registrosSurtido.forEach(surtido => {
    const registroEmpaque = registrosEmpaque.find(empaque => empaque.pedido === surtido.pedido);
    if (registroEmpaque) {
      const tiempoTotal = (fechaImpresion - new Date(registroEmpaque.fechaRegistro)) / (1000 * 60 * 60);
      nuevaHojaData.push([
        surtido.pedido,
        fechaImpresionISO,
        registroEmpaque.fechaRegistro,
        surtido.usuario,
        registroEmpaque.usuario,
        tiempoTotal.toFixed(2)
      ]);
    }
  });

  const nuevaHoja = XLSX.utils.aoa_to_sheet(nuevaHojaData);
  XLSX.utils.book_append_sheet(wb, nuevaHoja, 'Resumen GDL');

  const fechaArchivo = fechaImpresion.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '-');

  const nombreArchivo = `REPORTE_${fechaArchivo}.xlsx`;
  XLSX.writeFile(wb, nombreArchivo);
}

function volverAlPrincipal() {
  document.getElementById('registros').classList.remove('active');
  document.getElementById('listaRegistros').innerHTML = '';
  document.getElementById('opciones').style.display = 'flex';
  document.getElementById('tituloPrincipal').style.display = 'block';
}

function actualizarReloj() {
  const now = new Date();
  const horas = now.getHours() % 12 || 12;
  const minutos = String(now.getMinutes()).padStart(2, '0');
  const segundos = String(now.getSeconds()).padStart(2, '0');
  const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
  document.getElementById('reloj').innerText = `${horas}:${minutos}:${segundos} ${ampm}`;
}

function mostrarMensaje(opcion, mensaje, tipo = 'success') {
  const mensajeElement = document.getElementById(`mensaje${capitalize(opcion)}`);
  mensajeElement.innerText = mensaje;
  mensajeElement.className = `message ${tipo}`;
  setTimeout(() => {
    mensajeElement.innerText = '';
    mensajeElement.className = 'message';
    if (tipo === 'success') cancelarRegistro();
  }, 3000);
}

window.onload = function() {
  setInterval(actualizarReloj, 1000);
};