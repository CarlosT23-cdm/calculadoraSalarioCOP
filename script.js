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
        parseFloat(document.getElementById("horasMes").value) || 210;

    const valorHoraOrdinaria = salarioBase / horasMes;

    // Recargos y Extras
    const recNocturno =
        (parseFloat(document.getElementById("recNocturno").value) || 0) *
        (valorHoraOrdinaria * 0.35);
    const extDiurna =
        (parseFloat(document.getElementById("extDiurna").value) || 0) *
        (valorHoraOrdinaria * 1.25);
    const extNocturna =
        (parseFloat(document.getElementById("extNocturna").value) || 0) *
        (valorHoraOrdinaria * 1.75);
    const recDomDiurno =
        (parseFloat(document.getElementById("recDomDiurno").value) || 0) *
        (valorHoraOrdinaria * 0.75);
    const recDomNocturno =
        (parseFloat(document.getElementById("recDomNocturno").value) || 0) *
        (valorHoraOrdinaria * 1.1);
    const extDomDiurna =
        (parseFloat(document.getElementById("extDomDiurna").value) || 0) *
        (valorHoraOrdinaria * 2.0);
    const extDomNocturna =
        (parseFloat(document.getElementById("extDomNocturna").value) || 0) *
        (valorHoraOrdinaria * 2.5);

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

    // Prestaciones Sociales (~21.84%)
    const cesantias = basePrestaciones * 0.0833;
    const intCesantias = cesantias * 0.12;
    const prima = basePrestaciones * 0.0833;
    const vacaciones = (salarioBase + totalExtras) * 0.0417;
    const totalPrestaciones = cesantias + intCesantias + prima + vacaciones;

    // Seguridad Social & Parafiscales
    const pension = baseSeguridadSocial * 0.12;
    const arl = baseSeguridadSocial * 0.00522; // Riesgo I por defecto
    let salud = exoneracion === "si" ? 0 : baseSeguridadSocial * 0.085;
    let sena = exoneracion === "si" ? 0 : baseSeguridadSocial * 0.02;
    let icbf = exoneracion === "si" ? 0 : baseSeguridadSocial * 0.03;
    const caja = baseSeguridadSocial * 0.04;

    const totalSeguridad = pension + arl + salud + sena + icbf + caja;
    const costoTotalEmpleador =
        totalTrabajador + totalPrestaciones + totalSeguridad;
    const sobrecosto =
        salarioBase > 0
            ? ((costoTotalEmpleador - salarioBase) / salarioBase) * 100
            : 0;

    // Actualizar Render
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
    const items = [
        { name: "Valor Hora Ordinaria", val: vOrdinaria },
        { name: "Recargo Nocturno (35%)", val: vOrdinaria * 0.35 },
        { name: "Hora Extra Diurna (125%)", val: vOrdinaria * 1.25 },
        { name: "Hora Extra Nocturna (175%)", val: vOrdinaria * 1.75 },
        { name: "Re. Dom/Fest Diurno (75%)", val: vOrdinaria * 0.75 },
        { name: "Recargo Dom/Fest Nocturno (110%)", val: vOrdinaria * 1.1 },
        { name: "Hora Extra Dom/Fest Diurna (200%)", val: vOrdinaria * 2.0 },
        { name: "Hora Extra Dom/Fest Noct (250%)", val: vOrdinaria * 2.5 }
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
    navigator.clipboard.writeText(number);
    alert("Número copiado al portapapeles");
}
