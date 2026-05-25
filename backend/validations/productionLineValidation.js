const { z } = require('zod');

const productionLineSchema = z.object({
    commandeId: z.number().int().positive(),
    numeroTransformateur: z.string().min(1),
    puissance: z.string().optional().nullable(),
    u1u2: z.string().optional().nullable(),
    matiere: z.string().optional().nullable(),
    client: z.string().optional().nullable(),
    dateDebutPlanifiee: z.string().or(z.date()).optional().nullable().transform(v => v ? new Date(v) : null),
    dateDebutReelle: z.string().or(z.date()).optional().nullable().transform(v => v ? new Date(v) : null),
    dateFinTheorique: z.string().or(z.date()).optional().nullable().transform(v => v ? new Date(v) : null),
    stageDates: z.any().optional().nullable(),
});

module.exports = {
    productionLineSchema
};
