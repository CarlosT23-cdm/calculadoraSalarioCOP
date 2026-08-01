// ==========================================
// CALCULADORA DE COSTO REAL DE EMPLEADO (COLOMBIA)
// Polar Web Studio
// ==========================================

let currentCalculation = null;

document.addEventListener("DOMContentLoaded", () => {
    // 1. Event Listeners para recálculo automático cuando cambien opciones clave
    const inputsAutoRecalc = [
        "salarioBase",
        "auxilioTransporte",
        "horasMes",
        "tipoContrato",
        "nivelARL",
        "switchAuxTransporte",
        "switchExoneracion",
        "switchPrestaciones",
        "switchInformal"
    ];

    inputsAutoRecalc.forEach(id => {
        document.getElementById(id)?.addEventListener("change", calcular);
        document.getElementById(id)?.addEventListener("input", calcular);
    });

    // Control de interacción entre tipo de contrato / informalidad
    document.getElementById("tipoContrato")?.addEventListener("change", e => {
        const tipo = e.target.value;
        const switchPrest = document.getElementById("switchPrestaciones");
        const switchInf = document.getElementById("switchInformal");

        if (tipo === "servicios") {
            if (switchPrest) switchPrest.checked = false;
            if (switchInf) switchInf.checked = true;
        } else if (tipo === "integral") {
            if (switchPrest) switchPrest.checked = false;
            if (switchInf) switchInf.checked = false;
        } else if (tipo === "indefinido") {
            if (switchPrest) switchPrest.checked = true;
            if (switchInf) switchInf.checked = false;
        }
        calcular();
    });

    calcular();
    renderHistorial();

    document.getElementById("btnCalcular")?.addEventListener("click", calcular);
    document
        .getElementById("btnGuardar")
        ?.addEventListener("click", guardarEnHistorial);
    document
        .getElementById("btnShareAll")
        ?.addEventListener("click", shareAllHistory);
    document
        .getElementById("btnClearAll")
        ?.addEventListener("click", clearAllHistory);

    // Cargar y cambiar tema
    const themeSelect = document.getElementById("themeSelect");
    if (themeSelect) {
        const savedTheme = localStorage.getItem("selectedTheme") || "dark";
        document.documentElement.setAttribute("data-theme", savedTheme);
        themeSelect.value = savedTheme;

        themeSelect.addEventListener("change", e => {
            const theme = e.target.value;
            document.documentElement.setAttribute("data-theme", theme);
            localStorage.setItem("selectedTheme", theme);
        });
    }
});

function calcular() {
    // 1. Lectura de Entradas
    const salarioBase =
        parseFloat(document.getElementById("salarioBase")?.value) || 0;
    const inputAuxTransporte =
        parseFloat(document.getElementById("auxilioTransporte")?.value) || 0;
    const horasMes =
        parseFloat(document.getElementById("horasMes")?.value) ||
        NORMATIVA_COLOMBIA.HORAS_MES_DEFECTO;

    const tipoContrato =
        document.getElementById("tipoContrato")?.value || "indefinido";
    const nivelARL = parseInt(document.getElementById("nivelARL")?.value) || 1;

    // Lectura de Switches
    const PagaAuxTransporte =
        document.getElementById("switchAuxTransporte")?.checked ?? true;
    const AplicaExoneracion =
        document.getElementById("switchExoneracion")?.checked ?? true;
    const IncluyePrestaciones =
        document.getElementById("switchPrestaciones")?.checked ?? true;
    const ModoInformal =
        document.getElementById("switchInformal")?.checked ?? false;

    // Ajuste de Auxilio de Transporte
    const auxilioTransporte = PagaAuxTransporte ? inputAuxTransporte : 0;

    const valorHoraOrdinaria = salarioBase / horasMes;

    // 2. Horas Extras y Recargos
    const recNocturno =
        (parseFloat(document.getElementById("recNocturno")?.value) || 0) *
        (valorHoraOrdinaria * NORMATIVA_COLOMBIA.RECARGOS.NOCTURNO);
    const extDiurna =
        (parseFloat(document.getElementById("extDiurna")?.value) || 0) *
        (valorHoraOrdinaria * NORMATIVA_COLOMBIA.RECARGOS.EXTRA_DIURNA);
    const extNocturna =
        (parseFloat(document.getElementById("extNocturna")?.value) || 0) *
        (valorHoraOrdinaria * NORMATIVA_COLOMBIA.RECARGOS.EXTRA_NOCTURNA);
    const recDomDiurno =
        (parseFloat(document.getElementById("recDomDiurno")?.value) || 0) *
        (valorHoraOrdinaria * NORMATIVA_COLOMBIA.RECARGOS.DOM_FEST_DIURNO);
    const recDomNocturno =
        (parseFloat(document.getElementById("recDomNocturno")?.value) || 0) *
        (valorHoraOrdinaria * NORMATIVA_COLOMBIA.RECARGOS.DOM_FEST_NOCTURNO);
    const extDomDiurna =
        (parseFloat(document.getElementById("extDomDiurna")?.value) || 0) *
        (valorHoraOrdinaria * NORMATIVA_COLOMBIA.RECARGOS.EXTRA_DOM_DIURNA);
    const extDomNocturna =
        (parseFloat(document.getElementById("extDomNocturna")?.value) || 0) *
        (valorHoraOrdinaria * NORMATIVA_COLOMBIA.RECARGOS.EXTRA_DOM_NOCTURNA);

    const totalExtras =
        recNocturno +
        extDiurna +
        extNocturna +
        recDomDiurno +
        recDomNocturno +
        extDomDiurna +
        extDomNocturna;

    // 3. Bases de Cálculo
    const baseSeguridadSocial = salarioBase + totalExtras;
    const basePrestaciones = salarioBase + totalExtras + auxilioTransporte;
    const devengadoTotal = salarioBase + auxilioTransporte + totalExtras;

    // 4. Fondo de Solidaridad Pensional (FSP) - Solo si aplica deducción legal al trabajador
    let aporteFSP = 0;
    if (tipoContrato !== "servicios" && !ModoInformal) {
        const smmlvVigente = NORMATIVA_COLOMBIA.SMMLV || 1750000;
        const salariosEnSMMLV = baseSeguridadSocial / smmlvVigente;

        if (
            NORMATIVA_COLOMBIA.FONDO_SOLIDARIDAD &&
            salariosEnSMMLV >=
                NORMATIVA_COLOMBIA.FONDO_SOLIDARIDAD.APLICA_DESDE_SMMLV
        ) {
            const rango = NORMATIVA_COLOMBIA.FONDO_SOLIDARIDAD.RANGOS.find(
                r =>
                    salariosEnSMMLV >= r.minSMMLV &&
                    salariosEnSMMLV < r.maxSMMLV
            );
            if (rango) {
                aporteFSP = baseSeguridadSocial * rango.porcentaje;
            }
        }
    }

    // 5. Deducciones del Trabajador (Salud 4%, Pensión 4% + FSP)
    let aporteSaludTrabajador = 0;
    let aportePensionTrabajador = 0;

    if (tipoContrato !== "servicios" && !ModoInformal) {
        aporteSaludTrabajador = baseSeguridadSocial * 0.04;
        aportePensionTrabajador = baseSeguridadSocial * 0.04;
    }

    const totalDeduccionesTrabajador =
        aporteSaludTrabajador + aportePensionTrabajador + aporteFSP;
    const totalTrabajadorNeto = devengadoTotal - totalDeduccionesTrabajador;

    // 6. Prestaciones Sociales (Cargo Empleador)
    let totalPrestaciones = 0;
    if (tipoContrato === "indefinido" && IncluyePrestaciones) {
        const cesantias =
            basePrestaciones * NORMATIVA_COLOMBIA.PRESTACIONES.CESANTIAS;
        const intCesantias =
            cesantias * NORMATIVA_COLOMBIA.PRESTACIONES.INTERESES_CESANTIAS;
        const prima = basePrestaciones * NORMATIVA_COLOMBIA.PRESTACIONES.PRIMA;
        const vacaciones =
            baseSeguridadSocial * NORMATIVA_COLOMBIA.PRESTACIONES.VACACIONES;

        totalPrestaciones = cesantias + intCesantias + prima + vacaciones;
    }

    // 7. Seguridad Social y Parafiscales Patronales (Cargo Empleador)
    let totalSeguridad = 0;

    if (tipoContrato !== "servicios" && !ModoInformal) {
        const pension =
            baseSeguridadSocial * NORMATIVA_COLOMBIA.SEGURIDAD_SOCIAL.PENSION;
        const porcentajeARL =
            NORMATIVA_COLOMBIA.SEGURIDAD_SOCIAL.ARL_NIVELES[nivelARL] ||
            0.00522;
        const arl = baseSeguridadSocial * porcentajeARL;

        const salud = AplicaExoneracion
            ? 0
            : baseSeguridadSocial * NORMATIVA_COLOMBIA.SEGURIDAD_SOCIAL.SALUD;
        const sena = AplicaExoneracion
            ? 0
            : baseSeguridadSocial * NORMATIVA_COLOMBIA.SEGURIDAD_SOCIAL.SENA;
        const icbf = AplicaExoneracion
            ? 0
            : baseSeguridadSocial * NORMATIVA_COLOMBIA.SEGURIDAD_SOCIAL.ICBF;
        const caja =
            baseSeguridadSocial * NORMATIVA_COLOMBIA.SEGURIDAD_SOCIAL.CAJA;

        totalSeguridad = pension + arl + salud + sena + icbf + caja;
    }

    // Costo Total Empleador
    let costoTotalEmpleador = devengadoTotal;
    if (tipoContrato === "servicios") {
        costoTotalEmpleador = devengadoTotal;
    } else {
        costoTotalEmpleador =
            devengadoTotal + totalPrestaciones + totalSeguridad;
    }

    const sobrecosto =
        salarioBase > 0
            ? ((costoTotalEmpleador - salarioBase) / salarioBase) * 100
            : 0;

    // 8. Cálculo de Valores por Día
    const diasMes = NORMATIVA_COLOMBIA.DIAS_MES_LABORALES || 30;
    const diaBase = salarioBase / diasMes;
    const diaTrabajador = totalTrabajadorNeto / diasMes;
    const diaEmpleador = costoTotalEmpleador / diasMes;

    // 9. Renderizar Resultados en el DOM
    document.getElementById("totalWorker").innerText =
        `$ ${Math.round(totalTrabajadorNeto).toLocaleString("es-CO")}`;
    document.getElementById("totalEmployer").innerText =
        `$ ${Math.round(costoTotalEmpleador).toLocaleString("es-CO")}`;

    if (document.getElementById("detDiaBase"))
        document.getElementById("detDiaBase").innerText =
            `$ ${Math.round(diaBase).toLocaleString("es-CO")} / día`;
    if (document.getElementById("detDiaTrabajador"))
        document.getElementById("detDiaTrabajador").innerText =
            `$ ${Math.round(diaTrabajador).toLocaleString("es-CO")} / día`;
    if (document.getElementById("detDiaEmpleador"))
        document.getElementById("detDiaEmpleador").innerText =
            `$ ${Math.round(diaEmpleador).toLocaleString("es-CO")} / día`;

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

    const rowFSP = document.getElementById("rowFSP");
    const detFSP = document.getElementById("detFSP");
    if (rowFSP && detFSP) {
        detFSP.innerText = `$ ${Math.round(aporteFSP).toLocaleString("es-CO")}`;
        rowFSP.style.display = aporteFSP > 0 ? "flex" : "none";
    }

    renderTablaHoras(valorHoraOrdinaria);

    currentCalculation = {
        fecha: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        }),
        totalTrabajador: Math.round(totalTrabajadorNeto),
        costoTotal: Math.round(costoTotalEmpleador),
        costoDiaEmpleador: Math.round(diaEmpleador)
    };
}

function renderTablaHoras(vOrdinaria) {
    const table = document.getElementById("rateTable");
    if (!table) return;
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
    const historySummary = document.getElementById("historySummary");
    const avgCostoDia = document.getElementById("avgCostoDia");

    if (!historyList) return;
    const history = JSON.parse(localStorage.getItem("calcHistory")) || [];

    if (history.length === 0) {
        historyList.innerHTML =
            '<p class="empty-msg">No hay cálculos guardados todavía.</p>';
        if (historySummary) historySummary.style.display = "none";
        return;
    }

    const sumaCostoDia = history.reduce(
        (acc, item) =>
            acc + (item.costoDiaEmpleador || Math.round(item.costoTotal / 30)),
        0
    );
    const promedioDia = Math.round(sumaCostoDia / history.length);

    if (historySummary && avgCostoDia) {
        historySummary.style.display = "flex";
        avgCostoDia.innerText = `$ ${promedioDia.toLocaleString("es-CO")} / día`;
    }

    historyList.innerHTML = history
        .map(
            (item, index) => `
        <div class="history-item">
            <div class="history-info">
                <strong>Empleador: $ ${item.costoTotal.toLocaleString("es-CO")} ($ ${item.costoDiaEmpleador || Math.round(item.costoTotal / 30)}/día)</strong>
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
    if (
        !confirm(
            "⚠️ ¿Estás seguro de que deseas eliminar este cálculo del historial?"
        )
    )
        return;
    let history = JSON.parse(localStorage.getItem("calcHistory")) || [];
    history.splice(index, 1);
    localStorage.setItem("calcHistory", JSON.stringify(history));
    renderHistorial();
}

function clearAllHistory() {
    if (
        confirm(
            "🗑️ ¿Estás seguro de que deseas BORRAR TODO el historial? Esta acción no se puede deshacer."
        )
    ) {
        localStorage.removeItem("calcHistory");
        renderHistorial();
    }
}

function shareItem(index) {
    const history = JSON.parse(localStorage.getItem("calcHistory")) || [];
    const item = history[index];
    const costoDia = item.costoDiaEmpleador || Math.round(item.costoTotal / 30);
    const text =
        `📊 *Cálculo de Nómina Colombia*\n` +
        `• Neto Trabajador: $ ${item.totalTrabajador.toLocaleString("es-CO")}\n` +
        `• Costo Empleador: $ ${item.costoTotal.toLocaleString("es-CO")}\n` +
        `• Costo Día Empleador: $ ${costoDia.toLocaleString("es-CO")}\n` +
        `• Hora: ${item.fecha}`;

    ejecutarCompartir(text);
}

function shareAllHistory() {
    const history = JSON.parse(localStorage.getItem("calcHistory")) || [];
    if (history.length === 0) return alert("El historial está vacío");

    let text = `📋 *Historial de Cálculos*\n\n`;
    history.forEach((item, i) => {
        const costoDia =
            item.costoDiaEmpleador || Math.round(item.costoTotal / 30);
        text += `#${i + 1} | Empleador: $${item.costoTotal.toLocaleString("es-CO")} ($${costoDia.toLocaleString("es-CO")}/día) | Trabajador: $${item.totalTrabajador.toLocaleString("es-CO")}\n`;
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

// Modal Donaciones
const btnDonate = document.getElementById("btnDonate");
const donateModal = document.getElementById("donateModal");
const closeDonate = document.getElementById("closeDonate");

if (btnDonate && donateModal) {
    btnDonate.addEventListener("click", () => {
        donateModal.style.display = "flex";
    });

    closeDonate?.addEventListener("click", () => {
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
            .then(() => alert("Número copiado al portapapeles"))
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
