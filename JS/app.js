const API_URL = "https://bkendingresos.onrender.com/ingresos";

// =======================
//  INIT
// =======================
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btnLogin").addEventListener("click", login);

    let user = localStorage.getItem("usuarioLogueado");
    if (user) {
        document.getElementById("loginScreen").style.display = "none";
        document.getElementById("app").style.display = "block";
        cargarDatos();
    }
});

// =======================
// LOGIN (FRONTEND)
// =======================
const usuarios = {
    "Reconquista": "Recon1234", 
    "Polo": "Pol1234",
    "Calderon": "Cal1234!"
};

function login() {
    let user = document.getElementById("loginUser").value;
    let pass = document.getElementById("loginPass").value;

    if (usuarios[user] && usuarios[user] === pass) {
        localStorage.setItem("usuarioLogueado", user);
        document.getElementById("loginScreen").style.display = "none";
        document.getElementById("app").style.display = "block";
        cargarDatos();
    } else {
        alert("Usuario o contraseña incorrectos");
    }
}

// =======================
// LOGOUT
// =======================
function logout() {
    localStorage.removeItem("usuarioLogueado");
    document.getElementById("loginScreen").style.display = "block";
    document.getElementById("app").style.display = "none";
}

// =======================
// GUARDAR DATO
// =======================
async function guardarDato() {
    let user = localStorage.getItem("usuarioLogueado");
    if (!user) {
        alert("Debes iniciar sesión");
        return;
    }

    const data = {
        usuario: document.getElementById("dato1").value,
        fecha: document.getElementById("dato2").value,
        edificio: document.getElementById("dato3").value,
        gerencia: document.getElementById("dato6").value,
        puesto: document.getElementById("dato4").value,
        equipo: document.getElementById("equipoEntregado").value
    };

    if (!data.usuario || !data.fecha || !data.edificio) {
        alert("Faltan completar campos obligatorios (Usuario, Fecha y Edificio).");
        return;
    }

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await res.json();
        console.log("✅ Guardado:", result);

        limpiarFormulario();
        cargarDatos();
    } catch (error) {
        console.error("❌ Error al guardar:", error);
    }
}

// =======================
// OBTENER/CARGAR DATOS
// =======================
async function cargarDatos() {
    let user = localStorage.getItem("usuarioLogueado");
    if (!user) {
        console.warn("No autorizado");
        return;
    }

    try {
        const res = await fetch(API_URL);
        const datos = await res.json();
        mostrarDatos(datos);
    } catch (error) {
        console.error("❌ Error al cargar datos:", error);
    }
}

// =======================
// MOSTRAR DATOS EN PANTALLA
// =======================
function mostrarDatos(datos) {
    let lista = document.getElementById("lista");
    lista.innerHTML = "";

    datos.forEach((item) => {
        let fechaFormateada = "Fecha no válida";

        if (item.fecha) {
            let partes = item.fecha.split("-");
            if (partes.length === 3) {
                let [año, mes, dia] = partes;
                fechaFormateada = `${dia.padStart(2, "0")}-${mes.padStart(2, "0")}-${año}`;
            } else {
                fechaFormateada = new Date(item.fecha).toLocaleDateString("es-AR");
            }
        }

        let li = document.createElement("li");
        li.classList.add("list-group-item");

        li.innerHTML = `
            <div class="container">
                <div class="row">
                    <div class="col-12 col-md-6">
                        <p><strong>Ingreso:</strong> 
                        <span contenteditable="true" class="editable resaltado2" data-id="${item._id}" data-field="fecha">${fechaFormateada}</span></p>

                        <p><strong>Usuario:</strong> 
                        <span contenteditable="true" class="editable resaltado3" data-id="${item._id}" data-field="usuario">${item.usuario}</span></p>

                        <p><strong>Edificio:</strong> 
                        <span contenteditable="true" class="editable" data-id="${item._id}" data-field="edificio">${item.edificio}</span></p>

                        <p><strong>Gerencia:</strong> 
                        <span contenteditable="true" class="editable" data-id="${item._id}" data-field="gerencia">${item.gerencia || ''}</span></p>

                        <p><strong>Puesto:</strong> 
                        <span contenteditable="true" class="editable" data-id="${item._id}" data-field="puesto">${item.puesto || ''}</span></p>

                        <p><strong>Equipo Entregado:</strong> 
                        <span contenteditable="true" class="editable resaltado" data-id="${item._id}" data-field="equipo">
                        ${item.equipo || 'Cargar modelo y serie'}
                        </span></p>
                    </div>

                    <div class="col-12 col-md-2 d-flex flex-column ms-auto">
                        <button class="btn btn-danger btn-sm mb-2" onclick="eliminarDato('${item._id}')">Eliminar</button>
                        <button class="btn btn-info btn-sm mb-2" onclick="generarNota('${item._id}')">Generar Nota</button>
                    </div>
                </div>
            </div>
        `;
        lista.appendChild(li);
    });

    activarEdicion();
}

// =======================
// ACTIVAR EDICIÓN EN LINEA (PUT)
// =======================
function activarEdicion() {
    document.querySelectorAll('.editable').forEach(element => {
        element.addEventListener('blur', async (event) => {
            const id = event.target.dataset.id;
            const field = event.target.dataset.field;
            const value = event.target.innerText.trim();

            try {
                await fetch(`${API_URL}/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ [field]: value })
                });
                console.log("Actualizado");
            } catch (error) {
                console.error("Error al actualizar:", error);
            }
        });
    });
}

// =======================
// ELIMINAR DATO (DELETE)
// =======================
async function eliminarDato(id) {
    let user = localStorage.getItem("usuarioLogueado");
    if (!user) {
        alert("No autorizado");
        return;
    }

    if(!confirm("¿Estás seguro de que querés eliminar este registro?")) return;

    try {
        await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        cargarDatos();
    } catch (error) {
        console.error("❌ Error al eliminar:", error);
    }
}

// =======================
// FILTRAR DATOS
// =======================
async function filtrarDatos() {
    let fechaFiltro = document.getElementById("filtroFecha").value;
    let edificioFiltro = document.getElementById("filtroEdificio").value;
    let gerenciaFiltro = document.getElementById("filtroGerencia").value;
    let puestoFiltro = document.getElementById("filtroPuesto").value;
    let equipoFiltro = document.getElementById("filtroEquipo").value;

    try {
        const response = await fetch(API_URL);
        const datos = await response.json();

        let filtrados = datos.filter(item =>
            (fechaFiltro === "" || item.fecha === fechaFiltro) &&
            (edificioFiltro === "" || item.edificio === edificioFiltro) &&
            (gerenciaFiltro === "" || item.gerencia === gerenciaFiltro) &&
            (puestoFiltro === "" || item.puesto === puestoFiltro) &&
            (equipoFiltro === "" ||
                (equipoFiltro === 'true' && item.equipo && item.equipo.trim() !== "") ||
                (equipoFiltro === 'false' && (!item.equipo || item.equipo.trim() === ""))
            )
        );

        mostrarDatos(filtrados);
    } catch (error) {
        console.error("Error filtrando:", error);
    }
}

// =======================
// DESCARGAR EXCEL
// =======================
async function descargarExcel() {
    try {
        const res = await fetch(API_URL);
        const datos = await res.json();

        if (datos.length === 0) {
            alert("No hay datos para exportar.");
            return;
        }

        let datosModificados = datos.map((item, index) => ({
            "ID": index + 1,
            "Usuario": item.usuario,
            "Fecha de Ingreso": item.fecha,
            "Edificio": item.edificio,
            "Gerencia": item.gerencia,
            "Puesto": item.puesto,
            "Equipo": item.equipo || ""
        }));

        let ws = XLSX.utils.json_to_sheet(datosModificados);
        let wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Ingresos");
        XLSX.writeFile(wb, "ingresos.xlsx");
    } catch (error) {
        console.error("Error exportando excel:", error);
    }
}

// =======================
// GENERAR NOTA (WORD)
// =======================
async function generarNota(id) {
    try {
        const res = await fetch(API_URL);
        const datos = await res.json();
        const item = datos.find(d => d._id.toString() === id.toString());

        if (!item) {
            alert("No se encontró el registro");
            return;
        }

        let usuario = item.usuario;
        let equipo = item.equipo || "No especificado";

        let response = await fetch("https://dl.dropboxusercontent.com/scl/fi/ycuw0lqxd7pdwaifzki1r/plantilla.docx?rlkey=9hxcmam06ev63mv255d5lan5s");
        if (!response.ok) throw new Error("No se pudo cargar la plantilla de Word");

        let arrayBuffer = await response.arrayBuffer();
        let zip = new PizZip(arrayBuffer);
        let doc = new docxtemplater().loadZip(zip);

        doc.setData({ nombre: usuario, equipo: equipo });
        doc.render();

        let blob = doc.getZip().generate({ type: "blob" });
        saveAs(blob, `Nota_Entrega_${usuario}.docx`);

    } catch (error) {
        console.error("Error al generar la nota:", error);
    }
}

// =======================
// LIMPIAR FORMULARIO
// =======================
function limpiarFormulario() {
    document.getElementById("dato1").value = "";
    document.getElementById("dato2").value = "";
    document.getElementById("dato3").selectedIndex = 0;
    document.getElementById("dato6").selectedIndex = 0; // Cambiado a selectedIndex de forma uniforme
    document.getElementById("dato4").selectedIndex = 0; // Cambiado a selectedIndex de forma uniforme
    document.getElementById("equipoEntregado").value = "";
}