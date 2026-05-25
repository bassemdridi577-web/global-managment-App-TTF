const { z } = require('zod');

const userSchema = z.object({
    username: z.string().min(3),
    password: z.string().min(6),
    laboname: z.string().min(1),
    email: z.string().email().optional().nullable(),
    role: z.string().default('tester').optional(),
});

module.exports = {
    userSchema
};
