let currentCalculation = null;

document.addEventListener("DOMContentLoaded", () => {
    calcular();
    renderHistorial();

    document.getElementById("btnCalcular").addEventListener("click", calcular);
    document
        .getElementById("btnGuardar")
        .addEventListener("click", guardarEnHistorial);
    document
        .getElementById("btnShareAll")
        .addEventListener("click", shareAllHistory);
    document
        .getElementById("btnClearAll")
        .addEventListener("click", clearAllHistory);
});

function calcular() {
    const salarioBase =
        parseFloat(document.getElementById("salarioBase").value) || 0;
    const auxilioTransporte =
        parseFloat(document.getElementById("auxilioTransporte").value) || 0;
    const exoneracion = document.getElementById("exoneracion").value;
    const horasMes =
        parseFloat(document.getElementById("horasMes").value) ||
        NORMATIVA_COLOMBIA.HORAS_MES_DEFECTO;

    const valorHoraOrdinaria = salarioBase / horasMes;

    // Recargos y Extras usando la constante global
    const recNocturno =
        (parseFloat(document.getElementById("recNocturno").value) || 0) *
        (valorHoraOrdinaria * NORMATIVA_COLOMBIA.RECARGOS.NOCTURNO);
    const extDiurna =
        (parseFloat(document.getElementById("extDiurna").value) || 0) *
        (valorHoraOrdinaria * NORMATIVA_COLOMBIA.RECARGOS.EXTRA_DIURNA);
    const extNocturna =
        (parseFloat(document.getElementById("extNocturna").value) || 0) *
        (valorHoraOrdinaria * NORMATIVA_COLOMBIA.RECARGOS.EXTRA_NOCTURNA);
    const recDomDiurno =
        (parseFloat(document.getElementById("recDomDiurno").value) || 0) *
        (valorHoraOrdinaria * NORMATIVA_COLOMBIA.RECARGOS.DOM_FEST_DIURNO);
    const recDomNocturno =
        (parseFloat(document.getElementById("recDomNocturno").value) || 0) *
        (valorHoraOrdinaria * NORMATIVA_COLOMBIA.RECARGOS.DOM_FEST_NOCTURNO);
    const extDomDiurna =
        (parseFloat(document.getElementById("extDomDiurna").value) || 0) *
        (valorHoraOrdinaria * NORMATIVA_COLOMBIA.RECARGOS.EXTRA_DOM_DIURNA);
    const extDomNocturna =
        (parseFloat(document.getElementById("extDomNocturna").value) || 0) *
        (valorHoraOrdinaria * NORMATIVA_COLOMBIA.RECARGOS.EXTRA_DOM_NOCTURNA);

    const totalExtras =
        recNocturno +
        extDiurna +
        extNocturna +
        recDomDiurno +
        recDomNocturno +
        extDomDiurna +
        extDomNocturna;

    // Totales
    const totalTrabajador = salarioBase + auxilioTransporte + totalExtras;
    const basePrestaciones = salarioBase + totalExtras + auxilioTransporte;
    const baseSeguridadSocial = salarioBase + totalExtras;

    // Prestaciones Sociales calculadas con config.js
    const cesantias =
        basePrestaciones * NORMATIVA_COLOMBIA.PRESTACIONES.CESANTIAS;
    const intCesantias =
        cesantias * NORMATIVA_COLOMBIA.PRESTACIONES.INTERESES_CESANTIAS;
    const prima = basePrestaciones * NORMATIVA_COLOMBIA.PRESTACIONES.PRIMA;
    const vacaciones =
        baseSeguridadSocial * NORMATIVA_COLOMBIA.PRESTACIONES.VACACIONES;
    const totalPrestaciones = cesantias + intCesantias + prima + vacaciones;

    // Seguridad Social & Parafiscales calculados con config.js
    const pension =
        baseSeguridadSocial * NORMATIVA_COLOMBIA.SEGURIDAD_SOCIAL.PENSION;
    const arl =
        baseSeguridadSocial * NORMATIVA_COLOMBIA.SEGURIDAD_SOCIAL.ARL_RIESGO_1;
    let salud =
        exoneracion === "si"
            ? 0
            : baseSeguridadSocial * NORMATIVA_COLOMBIA.SEGURIDAD_SOCIAL.SALUD;
    let sena =
        exoneracion === "si"
            ? 0
            : baseSeguridadSocial * NORMATIVA_COLOMBIA.SEGURIDAD_SOCIAL.SENA;
    let icbf =
        exoneracion === "si"
            ? 0
            : baseSeguridadSocial * NORMATIVA_COLOMBIA.SEGURIDAD_SOCIAL.ICBF;
    const caja = baseSeguridadSocial * NORMATIVA_COLOMBIA.SEGURIDAD_SOCIAL.CAJA;

    const totalSeguridad = pension + arl + salud + sena + icbf + caja;
    const costoTotalEmpleador =
        totalTrabajador + totalPrestaciones + totalSeguridad;
    const sobrecosto =
        salarioBase > 0
            ? ((costoTotalEmpleador - salarioBase) / salarioBase) * 100
            : 0;

    // Actualizar Render en el DOM
    document.getElementById("totalWorker").innerText =
        `$ ${Math.round(totalTrabajador).toLocaleString("es-CO")}`;
    document.getElementById("totalEmployer").innerText =
        `$ ${Math.round(costoTotalEmpleador).toLocaleString("es-CO")}`;
    document.getElementById("detSalario").innerText =
        `$ ${Math.round(salarioBase).toLocaleString("es-CO")}`;
    document.getElementById("detAuxilio").innerText =
        `$ ${Math.round(auxilioTransporte).toLocaleString("es-CO")}`;
    document.getElementById("detExtras").innerText =
        `$ ${Math.round(totalExtras).toLocaleString("es-CO")}`;
    document.getElementById("detPrestaciones").innerText =
        `$ ${Math.round(totalPrestaciones).toLocaleString("es-CO")}`;
    document.getElementById("detSeguridad").innerText =
        `$ ${Math.round(totalSeguridad).toLocaleString("es-CO")}`;
    document.getElementById("detSobrecosto").innerText =
        `${sobrecosto.toFixed(1)}%`;

    renderTablaHoras(valorHoraOrdinaria);

    currentCalculation = {
        fecha: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        }),
        totalTrabajador: Math.round(totalTrabajador),
        costoTotal: Math.round(costoTotalEmpleador)
    };
}

function renderTablaHoras(vOrdinaria) {
    const table = document.getElementById("rateTable");
    const r = NORMATIVA_COLOMBIA.RECARGOS;
    const items = [
        { name: "Valor Hora Ordinaria", val: vOrdinaria },
        { name: "Recargo Nocturno (35%)", val: vOrdinaria * r.NOCTURNO },
        { name: "Hora Extra Diurna (125%)", val: vOrdinaria * r.EXTRA_DIURNA },
        {
            name: "Hora Extra Nocturna (175%)",
            val: vOrdinaria * r.EXTRA_NOCTURNA
        },
        {
            name: "Recargo Dom/Fest Diurno (75%)",
            val: vOrdinaria * r.DOM_FEST_DIURNO
        },
        {
            name: "Recargo Dom/Fest Nocturno (110%)",
            val: vOrdinaria * r.DOM_FEST_NOCTURNO
        },
        {
            name: "Hora Extra Dom/Fest Diurna (200%)",
            val: vOrdinaria * r.EXTRA_DOM_DIURNA
        },
        {
            name: "Hora Extra Dom/Fest Nocturna (250%)",
            val: vOrdinaria * r.EXTRA_DOM_NOCTURNA
        }
    ];

    table.innerHTML = items
        .map(
            item => `
        <div class="rate-row">
            <span>${item.name}:</span>
            <strong>$ ${Math.round(item.val).toLocaleString("es-CO")} / hr</strong>
        </div>
    `
        )
        .join("");
}

function guardarEnHistorial() {
    if (!currentCalculation) return;
    let history = JSON.parse(localStorage.getItem("calcHistory")) || [];
    history.unshift(currentCalculation);
    localStorage.setItem("calcHistory", JSON.stringify(history));
    renderHistorial();
}

function renderHistorial() {
    const historyList = document.getElementById("historyList");
    const history = JSON.parse(localStorage.getItem("calcHistory")) || [];

    if (history.length === 0) {
        historyList.innerHTML =
            '<p class="empty-msg">No hay cálculos guardados todavía.</p>';
        return;
    }

    historyList.innerHTML = history
        .map(
            (item, index) => `
        <div class="history-item">
            <div class="history-info">
                <strong>Empleador: $ ${item.costoTotal.toLocaleString("es-CO")}</strong>
                <p>Trabajador: $ ${item.totalTrabajador.toLocaleString("es-CO")} | ${item.fecha}</p>
            </div>
            <div class="history-actions">
                <button class="btn-icon" onclick="shareItem(${index})" title="Compartir">📤</button>
                <button class="btn-icon" onclick="deleteItem(${index})" title="Eliminar">🗑️</button>
            </div>
        </div>
    `
        )
        .join("");
}

function deleteItem(index) {
    let history = JSON.parse(localStorage.getItem("calcHistory")) || [];
    history.splice(index, 1);
    localStorage.setItem("calcHistory", JSON.stringify(history));
    renderHistorial();
}

function clearAllHistory() {
    localStorage.removeItem("calcHistory");
    renderHistorial();
}

function shareItem(index) {
    const history = JSON.parse(localStorage.getItem("calcHistory")) || [];
    const item = history[index];
    const text =
        `📊 *Cálculo de Nómina Colombia*\n` +
        `• Neto Trabajador: $ ${item.totalTrabajador.toLocaleString("es-CO")}\n` +
        `• Costo Empleador: $ ${item.costoTotal.toLocaleString("es-CO")}\n` +
        `• Hora: ${item.fecha}`;

    ejecutarCompartir(text);
}

function shareAllHistory() {
    const history = JSON.parse(localStorage.getItem("calcHistory")) || [];
    if (history.length === 0) return alert("El historial está vacío");

    let text = `📋 *Historial de Cálculos*\n\n`;
    history.forEach((item, i) => {
        text += `#${i + 1} | Empleador: $${item.costoTotal.toLocaleString("es-CO")} | Trabajador: $${item.totalTrabajador.toLocaleString("es-CO")}\n`;
    });

    ejecutarCompartir(text);
}

function ejecutarCompartir(text) {
    if (navigator.share) {
        navigator
            .share({ title: "Cálculo de Salario", text: text })
            .catch(() => {});
    } else {
        navigator.clipboard.writeText(text);
        alert("Copiado al portapapeles");
    }
}

const btnDonate = document.getElementById("btnDonate");
const donateModal = document.getElementById("donateModal");
const closeDonate = document.getElementById("closeDonate");

if (btnDonate && donateModal) {
    btnDonate.addEventListener("click", () => {
        donateModal.style.display = "flex";
    });

    closeDonate.addEventListener("click", () => {
        donateModal.style.display = "none";
    });

    window.addEventListener("click", e => {
        if (e.target === donateModal) {
            donateModal.style.display = "none";
        }
    });
}

function copySupportNumber(number) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard
            .writeText(number)
            .then(() => {
                alert("Número copiado al portapapeles");
            })
            .catch(() => fallbackCopy(number));
    } else {
        fallbackCopy(number);
    }
}

function fallbackCopy(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand("copy");
        alert("Número copiado al portapapeles");
    } catch (err) {
        alert("No se pudo copiar automáticamente. Número: " + text);
    }
    document.body.removeChild(textArea);
}
