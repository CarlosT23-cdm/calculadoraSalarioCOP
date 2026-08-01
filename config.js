// ==========================================
// CONFIGURACIÓN DE PARÁMETROS LABORALES COLOMBIA (2026)
// Polar Web Studio
// ==========================================

const NORMATIVA_COLOMBIA = Object.freeze({
    AÑO: 2026,
    SMMLV: 1750000, // Salario Mínimo Mensual Legal Vigente de referencia

    // Jornada laboral máxima legal de 42 horas semanales (Ley 2101 de 2021)
    HORAS_MES_DEFECTO: 210,
    DIAS_MES_LABORALES: 30, // Base comercial para cálculo del valor día

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

    // Tabla Progresiva del Fondo de Solidaridad Pensional (Art. 27 Ley 100/93)
    FONDO_SOLIDARIDAD: {
        APLICA_DESDE_SMMLV: 4,
        RANGOS: [
            { minSMMLV: 4, maxSMMLV: 16, porcentaje: 0.01 }, // 1.0% (0.5% FSP + 0.5% Subsistencia)
            { minSMMLV: 16, maxSMMLV: 17, porcentaje: 0.012 }, // 1.2%
            { minSMMLV: 17, maxSMMLV: 18, porcentaje: 0.014 }, // 1.4%
            { minSMMLV: 18, maxSMMLV: 19, porcentaje: 0.016 }, // 1.6%
            { minSMMLV: 19, maxSMMLV: 20, porcentaje: 0.018 }, // 1.8%
            { minSMMLV: 20, maxSMMLV: Infinity, porcentaje: 0.02 } // 2.0%
        ]
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
        SENA: 0.02, // 2% SENA (sujeto a exoneración Art. 114-1 E.T.)
        ICBF: 0.03, // 3% ICBF (sujeto a exoneración Art. 114-1 E.T.)
        CAJA: 0.04, // 4% Caja de Compensación Familiar (No exonerable)
        ARL_NIVELES: {
            1: 0.00522, // Riesgo I (Clase de riesgo mínimo)
            2: 0.01044, // Riesgo II
            3: 0.02436, // Riesgo III
            4: 0.0435, // Riesgo IV
            5: 0.0696 // Riesgo V (Máximo riesgo: minería, construcción, etc.)
        }
    }
});
