const registros = {
    unidad1: [],
    unidad2: [],
    unidad3: []
};

let videoStream;

function mostrarRegistro(tipo) {
    document.getElementById("mainMenu").style.display = "none";
    document.getElementById("registroForm").style.display = "block";
    document.getElementById("registroTitulo").innerText = `Registrar ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`;
    
    if (tipo === "mantenimiento") {
        document.getElementById("mantenimientoFields").style.display = "block";
    } else {
        document.getElementById("mantenimientoFields").style.display = "none";
    }

    document.getElementById("registroForm").dataset.tipoRegistro = tipo;
}

function mostrarMenuPrincipal() {
    document.getElementById("mainMenu").style.display = "block";
    document.getElementById("registroForm").style.display = "none";
    document.getElementById("consultaForm").style.display = "none";
    detenerCamara();
}

function solicitarCamara() {
    const video = document.getElementById("cameraPreview");
    video.style.display = "block";

    // Solicitar permisos para acceder a la cámara
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(stream => {
            videoStream = stream;
            video.srcObject = stream;
            console.log("Cámara activada con éxito");
        })
        .catch(error => {
            console.error("Error al acceder a la cámara:", error);
            alert("No se pudo acceder a la cámara. Asegúrate de que los permisos estén habilitados.");
        });
}

function capturarFoto() {
    if (!videoStream) {
        alert("Primero activa la cámara.");
        return;
    }

    const canvas = document.createElement("canvas");
    const video = document.getElementById("cameraPreview");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const foto = canvas.toDataURL("image/png"); // Captura la foto en formato base64
    
    detenerCamara();

    document.getElementById("registroForm").dataset.fotoCapturada = foto;
    alert("Foto capturada con éxito.");
}

function detenerCamara() {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
        document.getElementById("cameraPreview").srcObject = null;
        document.getElementById("cameraPreview").style.display = "none";
    }
}

function guardarRegistro() {
    const unidad = document.getElementById("unidad").value;
    const tipoRegistro = document.getElementById("registroForm").dataset.tipoRegistro;
    const fecha = new Date().toLocaleString();
    const foto = document.getElementById("registroForm").dataset.fotoCapturada;
    
    let registro = {
        tipo: tipoRegistro,
        fecha,
        foto
    };

    if (tipoRegistro === "mantenimiento") {
        const tipoMantenimiento = document.getElementById("tipoMantenimiento").value;
        registro.motivo = tipoMantenimiento;
    }

    registros[unidad].push(registro);
    alert(`Registro de ${tipoRegistro} guardado para la ${unidad} con fecha: ${fecha}`);
    mostrarMenuPrincipal();
}

function mostrarConsulta() {
    document.getElementById("mainMenu").style.display = "none";
    document.getElementById("consultaForm").style.display = "block";
}

function mostrarHistorial() {
    const unidad = document.getElementById("unidadConsulta").value;
    const historialContainer = document.getElementById("historialContainer");
    historialContainer.innerHTML = `<h3>Historial de ${unidad}</h3>`;

    if (registros[unidad].length === 0) {
        historialContainer.innerHTML += "<p>No hay registros disponibles.</p>";
    } else {
        registros[unidad].forEach((registro, index) => {
            historialContainer.innerHTML += `
                <div>
                    <p><strong>${registro.tipo.charAt(0).toUpperCase() + registro.tipo.slice(1)}</strong> - ${registro.fecha}</p>
                    <p>Motivo: ${registro.motivo || "N/A"}</p>
                    <img src="${registro.foto}" alt="Comprobante" style="width: 100%; max-width: 200px; display: block; margin-top: 10px;">
                    <button onclick="descargarFoto('${registro.foto}')">Descargar Comprobante</button>
                </div>
                <hr>
            `;
        });
    }
}

function descargarFoto(foto) {
    const link = document.createElement("a");
    link.href = foto;
    link.download = "Comprobante.png";
    link.click();
}
