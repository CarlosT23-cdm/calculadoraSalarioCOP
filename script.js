document.addEventListener("DOMContentLoaded", () => {
  const btnCalcular = document.getElementById("btn-calcular");
  const btnGuardar = document.getElementById("btn-guardar");
  const btnLimpiarHistorial = document.getElementById("btn-limpiar-historial");
  const historyList = document.getElementById("history-list");

  let ultimoCalculo = null;

  // Formateador de moneda colombiana
  const formatCOP = (val) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }).format(val);
  };

  const calcularNomina = () => {
    // Entradas básicas
    const salario = parseFloat(document.getElementById("salario").value) || 0;
    const auxilio = parseFloat(document.getElementById("auxilio").value) || 0;
    const esExonerado = document.getElementById("exonerado").value === "si";
    const horasMes = parseFloat(document.getElementById("horasMes").value) || 210;

    // Horas extra y recargos
    const recNocturno = parseFloat(document.getElementById("recNocturno").value) || 0;
    const heDiurna = parseFloat(document.getElementById("heDiurna").value) || 0;
    const heNocturna = parseFloat(document.getElementById("heNocturna").value) || 0;
    const recDomDiurno = parseFloat(document.getElementById("recDomDiurno").value) || 0;
    const recDomNocturno = parseFloat(document.getElementById("recDomNocturno").value) || 0;
    const heDomDiurna = parseFloat(document.getElementById("heDomDiurna").value) || 0;
    const heDomNocturna = parseFloat(document.getElementById("heDomNocturna").value) || 0;

    // Cálculo de Hora Ordinaria
    const horaOrdinaria = salario / horasMes;

    // Factores de recargo/extra
    const tarifas = {
      recNocturno: { factor: 0.35, label: "Recargo Nocturno (35%)" },
      heDiurna: { factor: 1.25, label: "Hora Extra Diurna (125%)" },
      heNocturna: { factor: 1.75, label: "Hora Extra Nocturna (175%)" },
      recDomDiurno: { factor: 0.75, label: "Recargo Dom/Fest Diurno (75%)" },
      recDomNocturno: { factor: 1.10, label: "Recargo Dom/Fest Nocturno (110%)" },
      heDomDiurna: { factor: 2.00, label: "Hora Extra Dom/Fest Diurna (200%)" },
      heDomNocturna: { factor: 2.50, label: "Hora Extra Dom/Fest Nocturna (250%)" }
    };

    // Totalizar valor de extras y recargos
    let totalExtras = 0;
    totalExtras += recNocturno * (horaOrdinaria * tarifas.recNocturno.factor);
    totalExtras += heDiurna * (horaOrdinaria * tarifas.heDiurna.factor);
    totalExtras += heNocturna * (horaOrdinaria * tarifas.heNocturna.factor);
    totalExtras += recDomDiurno * (horaOrdinaria * tarifas.recDomDiurno.factor);
    totalExtras += recDomNocturno * (horaOrdinaria * tarifas.recDomNocturno.factor);
    totalExtras += heDomDiurna * (horaOrdinaria * tarifas.heDomDiurna.factor);
    totalExtras += heDomNocturna * (horaOrdinaria * tarifas.heDomNocturna.factor);

    // Bases de liquidación
    const basePrestaciones = salario + auxilio + totalExtras;
    const baseVacaciones = salario; 
    const baseSeguridadSocial = salario + totalExtras;

    // Prestaciones Sociales
    const cesantias = basePrestaciones * 0.0833;
    const interesesCesantias = basePrestaciones * 0.01;
    const prima = basePrestaciones * 0.0833;
    const vacaciones = baseVacaciones * 0.0417;
    const totalPrestaciones = cesantias + interesesCesantias + prima + vacaciones;

    // Seguridad Social y Parafiscales
    const pension = baseSeguridadSocial * 0.12;
    const arl = baseSeguridadSocial * 0.00522; // Riesgo I
    const caja = baseSeguridadSocial * 0.04;

    let salud = 0;
    let sena = 0;
    let icbf = 0;

    if (!esExonerado) {
      salud = baseSeguridadSocial * 0.085;
      sena = baseSeguridadSocial * 0.02;
      icbf = baseSeguridadSocial * 0.03;
    }

    const totalSeguridadSocial = pension + arl + caja + salud + sena + icbf;

    // Totales finales
    const costoTotal = salario + auxilio + totalExtras + totalPrestaciones + totalSeguridadSocial;
    const sobrecostoPorcentaje = ((costoTotal - (salario + auxilio)) / salario) * 100;

    // Guardar referencia del cálculo actual
    ultimoCalculo = {
      salario,
      auxilio,
      totalExtras,
      costoTotal,
      sobrecostoPorcentaje,
      fecha: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Mostrar resultados en la interfaz
    document.getElementById("res-salario").textContent = formatCOP(salario);
    document.getElementById("res-auxilio").textContent = formatCOP(auxilio);
    document.getElementById("res-extras").textContent = formatCOP(totalExtras);
    document.getElementById("res-prestaciones").textContent = formatCOP(totalPrestaciones);
    document.getElementById("res-seguridad").textContent = formatCOP(totalSeguridadSocial);
    document.getElementById("res-total-costo").textContent = formatCOP(costoTotal);
    document.getElementById("res-porcentaje").textContent = `${sobrecostoPorcentaje.toFixed(1)}%`;

    // Renderizar desglose de tarifas por hora
    const ratesList = document.getElementById("rates-list");
    ratesList.innerHTML = `<li><span>Valor Hora Ordinaria:</span> <strong>${formatCOP(horaOrdinaria)}</strong></li>`;

    Object.keys(tarifas).forEach((key) => {
      const valHora = horaOrdinaria * tarifas[key].factor;
      ratesList.innerHTML += `
        <li>
          <span>${tarifas[key].label}:</span> 
          <strong>${formatCOP(valHora)} / hr</strong>
        </li>`;
    });
  };

  // FUNCIONES DE HISTORIAL
  const obtenerHistorial = () => {
    return JSON.parse(localStorage.getItem("historialCalculos")) || [];
  };

  const guardarEnHistorial = () => {
    if (!ultimoCalculo) return;

    const historial = obtenerHistorial();
    historial.unshift(ultimoCalculo); // Agregar al inicio
    if (historial.length > 10) historial.pop(); // Mantener máximo 10 registros

    localStorage.setItem("historialCalculos", JSON.stringify(historial));
    renderizarHistorial();
  };

  const renderizarHistorial = () => {
    const historial = obtenerHistorial();

    if (historial.length === 0) {
      historyList.innerHTML = `<p class="empty-history">No hay cálculos guardados todavía.</p>`;
      return;
    }

    historyList.innerHTML = historial.map((item) => `
      <div class="history-item">
        <div class="history-item-details">
          <strong>${formatCOP(item.costoTotal)}</strong>
          <span>Base: ${formatCOP(item.salario)} | Extras: ${formatCOP(item.totalExtras)}</span>
        </div>
        <span>${item.fecha} hs</span>
      </div>
    `).join("");
  };

  const borrarHistorial = () => {
    localStorage.removeItem("historialCalculos");
    renderizarHistorial();
  };

  // Escuchar eventos
  btnCalcular.addEventListener("click", calcularNomina);
  btnGuardar.addEventListener("click", guardarEnHistorial);
  btnLimpiarHistorial.addEventListener("click", borrarHistorial);

  // Ejecución inicial
  calcularNomina();
  renderizarHistorial();
});
