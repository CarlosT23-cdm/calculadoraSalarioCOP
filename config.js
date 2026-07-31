// ==========================================
// CONFIGURACIÓN DE PARÁMETROS LABORALES COLOMBIA (2026)
// Polar Web Studio
// ==========================================

const NORMATIVA_COLOMBIA = Object.freeze({
    AÑO: 2026,

    // Jornada laboral máxima legal de 42 horas semanales (Ley 2101 de 2021)
    HORAS_MES_DEFECTO: 210,

    // Porcentajes de Recargos y Horas Extra (CST)
    RECARGOS: {
        NOCTURNO: 0.35, // Recargo nocturno ordinario (35%)
        EXTRA_DIURNA: 1.25, // Hora extra diurna (100% base + 25%)
        EXTRA_NOCTURNA: 1.75, // Hora extra nocturna (100% base + 75%)
        DOM_FEST_DIURNO: 0.75, // Recargo dominical/festivo diurno (75%)
        DOM_FEST_NOCTURNO: 1.1, // Recargo dominical/festivo nocturno (110%)
        EXTRA_DOM_DIURNA: 2.0, // Hora extra diurna en dominical/festivo (200%)
        EXTRA_DOM_NOCTURNA: 2.5 // Hora extra nocturna en dominical/festivo (250%)
    },

    // Factores para Prestaciones Sociales
    PRESTACIONES: {
        CESANTIAS: 0.0833, // 8.33% (1 mes de salario por año)
        INTERESES_CESANTIAS: 0.12, // 12% anual sobre el valor de las cesantías acumuladas
        PRIMA: 0.0833, // 8.33% (1 mes de salario por año)
        VACACIONES: 0.0417 // 4.17% (15 días hábiles por año sobre base sin aux. transporte)
    },

    // Aportes de Seguridad Social y Parafiscales a cargo del Empleador
    SEGURIDAD_SOCIAL: {
        PENSION: 0.12, // 12% Aporte patronal a pensión
        SALUD: 0.085, // 8.5% Aporte patronal a salud (sujeto a exoneración Art. 114-1 E.T.)
        ARL_RIESGO_1: 0.00522, // 0.522% Riesgo I (Clase de riesgo mínimo)
        SENA: 0.02, // 2% SENA (sujeto a exoneración Art. 114-1 E.T.)
        ICBF: 0.03, // 3% ICBF (sujeto a exoneración Art. 114-1 E.T.)
        CAJA: 0.04 // 4% Caja de Compensación Familiar (No exonerable)
    }
});
