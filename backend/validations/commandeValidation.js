const { z } = require('zod');

const commandeSchema = z.object({
    numero: z.string().optional().nullable(),
    client: z.string().optional().nullable(),
    items: z.any().optional().nullable(),
    total: z.number().optional().nullable(),
    status: z.string().default('pending').optional(),
    formData: z.any().optional().nullable(),
    operateur: z.string().optional().nullable(),
    colonne: z.string().optional().nullable(),
});

module.exports = {
    commandeSchema
};
