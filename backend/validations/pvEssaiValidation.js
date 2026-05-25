const { z } = require('zod');

// Reusable transformer: accepts string, number, or null → coerces to string
const flexibleStringField = z.union([z.string(), z.number(), z.null()])
    .transform(v => (v !== null && v !== undefined) ? String(v) : v)
    .optional()
    .nullable();

// Reusable transformer: accepts string, number, or null → coerces to float
const flexibleFloatField = z.union([z.number(), z.string(), z.null()])
    .transform(v => {
        if (v === null || v === undefined || v === '') return null;
        if (typeof v === 'string') {
            const parsed = parseFloat(v.replace(',', '.'));
            return isNaN(parsed) ? null : parsed;
        }
        return typeof v === 'number' ? v : null;
    })
    .optional()
    .nullable();

const pvEssaiSchema = z.object({
    marque: flexibleStringField,
    power: flexibleFloatField,
    frequency: z.union([z.number(), z.string(), z.null()]).transform((val) => {
        if (typeof val === 'string') {
            const parsed = parseInt(val, 10);
            return isNaN(parsed) ? 50 : parsed;
        }
        return val || 50;
    }).optional(),
    numero: flexibleStringField,
    type: flexibleStringField,
    client: flexibleStringField,
    mission: flexibleStringField,
    mtu1: flexibleFloatField,
    mtu2: flexibleFloatField,
    mtu2_2: flexibleFloatField,
    btu2: flexibleFloatField,
    bti2: flexibleFloatField,
    btu2_2: flexibleStringField,
    bti2_2: flexibleStringField,
    mti2_1: flexibleStringField,
    prises: flexibleStringField,
    norme: z.string().default('CEI 60076').optional().nullable(),
    couplage: flexibleStringField,
    list1: flexibleStringField,
    list2: flexibleStringField,
    list3: flexibleStringField,
    list4: flexibleStringField,
    list5: flexibleStringField,
    couplage2: flexibleStringField,
    mtU1_2: flexibleStringField,
    bitention: flexibleStringField,
    matiere: flexibleStringField,
    refroidissement: flexibleStringField,
    date: z.union([z.string(), z.date(), z.null()]).optional().transform(v => v ? new Date(v) : new Date()),
    voltage_ratio: z.any().optional().nullable(),
    no_load_test: z.any().optional().nullable(),
    no_load_test_2: z.any().optional().nullable(),
    short_circuit_test: z.any().optional().nullable(),
    dielectric_test: z.any().optional().nullable(),
    resistance_test: z.any().optional().nullable(),
    bitention_tests: z.any().optional().nullable(),
    operateur: flexibleStringField,
    tensionType: z.string().default('').optional().nullable(),
    courtCircuit: z.union([z.boolean(), z.string(), z.number(), z.null()]).transform(v => {
        if (typeof v === 'boolean') return v;
        if (typeof v === 'string') return v.toLowerCase() === 'true';
        if (typeof v === 'number') return v === 1;
        return null;
    }).optional().nullable(),
    overall_conformity: flexibleStringField,
    // Catch-all for other potential fields sent by frontend
}).passthrough();

module.exports = {
    pvEssaiSchema
};
