const prisma = require('../lib/prismaClient');

/**
 * Database Query Service
 * Provides safe, controlled access to all database tables for AI queries
 */

// Define allowed models and their safe query configurations
const ALLOWED_MODELS = {
    stock: {
        model: 'stock',
        maxRecords: 100,
        defaultSelect: {
            id: true,
            articleName: true,
            nombreUnite: true,
            poid: true,
            unit: true,
            createdAt: true,
            updatedAt: true
        }
    },
    productionLine: {
        model: 'productionLine',
        maxRecords: 50,
        defaultSelect: {
            id: true,
            numeroTransformateur: true,
            puissance: true,
            u1u2: true,
            matiere: true,
            client: true,
            dateDebutPlanifiee: true,
            dateDebutReelle: true,
            dateFinTheorique: true,
            stageDates: true,
            createdAt: true,
            updatedAt: true
        }
    },
    commande: {
        model: 'commande',
        maxRecords: 100,
        defaultSelect: {
            id: true,
            numero: true,
            client: true,
            items: true,
            total: true,
            status: true,
            formData: true,
            operateur: true,
            colonne: true,
            createdAt: true,
            updatedAt: true
        }
    },
    pvEssai: {
        model: 'pvEssai',
        maxRecords: 100,
        defaultSelect: {
            id: true,
            marque: true,
            power: true,
            frequency: true,
            numero: true,
            phases: true,
            type: true,
            client: true,
            date: true,
            mtu1: true,
            mtu2: true,
            btu2: true,
            prises: true,
            norme: true,
            couplage: true,
            bti2: true,
            bti2_2: true,
            btu2_2: true,
            mti2_1: true,
            operateur: true,
            conformite: true,
            matiere: true,
            bitention_tests: true,
            bitention: true,
            couplage2: true,
            voltage_ratio: true,
            no_load_test: true,
            short_circuit_test: true,
            dielectric_test: true,
            resistance_test: true,
            tensionType: true,
            mission: true,
            createdAt: true,
            updatedAt: true
        }
    },
    productionStep: {
        model: 'productionStep',
        maxRecords: 100,
        defaultSelect: {
            id: true,
            productionLineId: true,
            stepName: true,
            data: true,
            createdAt: true,
            updatedAt: true
        }
    },
    user: {
        model: 'user',
        maxRecords: 50,
        defaultSelect: {
            id: true,
            username: true,
            laboname: true,
            email: true,
            role: true
            // Exclude password for security
        }
    },
    operator: {
        model: 'operator',
        maxRecords: 100,
        defaultSelect: {
            id: true,
            name: true,
            teamId: true,
            createdAt: true
        }
    },
    team: {
        model: 'team',
        maxRecords: 50,
        defaultSelect: {
            id: true,
            name: true,
            createdAt: true
        }
    },
    transformator: {
        model: 'transformator',
        maxRecords: 100,
        defaultSelect: {
            id: true,
            numero: true,
            puissance: true,
            createdAt: true
        }
    },
    actionLog: {
        model: 'actionLog',
        maxRecords: 100,
        defaultSelect: {
            id: true,
            action: true,
            details: true,
            userId: true,
            createdAt: true
        }
    }
};

/**
 * Get database schema information for AI context
 */
function getDatabaseSchema() {
    return {
        stock: {
            description: "Inventory/stock items with quantities and weights",
            fields: ["id", "articleName", "nombreUnite", "unit", "poid", "createdAt", "updatedAt"]
        },
        productionLine: {
            description: "Production lines for transformers with dates and stages",
            fields: ["id", "numeroTransformateur", "puissance", "u1u2", "matiere", "client", "dateDebutPlanifiee", "dateDebutReelle", "dateFinTheorique", "stageDates"]
        },
        commande: {
            description: "Orders/commands with items, totals, and status",
            fields: ["id", "numero", "client", "items", "total", "status", "formData", "operateur", "colonne"]
        },
        pvEssai: {
            description: "Test reports (PV) with electrical tests and measurements",
            fields: ["id", "marque", "power", "frequency", "numero", "phases", "type", "client", "voltage_ratio", "no_load_test", "short_circuit_test", "dielectric_test", "resistance_test", "operateur", "conformite"]
        },
        productionStep: {
            description: "Individual production steps for each production line",
            fields: ["id", "productionLineId", "stepName", "data"]
        },
        user: {
            description: "System users with roles and lab names",
            fields: ["id", "username", "laboname", "email", "role"]
        },
        operator: {
            description: "Production operators with their assigned team IDs",
            fields: ["id", "name", "teamId"]
        },
        team: {
            description: "Production teams/groups",
            fields: ["id", "name"]
        },
        transformator: {
            description: "Transformer configurations",
            fields: ["id", "numero", "puissance"]
        },
        actionLog: {
            description: "System action logs and audit trail",
            fields: ["id", "action", "details", "userId", "createdAt"]
        }
    };
}

/**
 * Query a specific model with filters
 */
async function queryModel(modelName, options = {}) {
    const modelConfig = ALLOWED_MODELS[modelName];

    if (!modelConfig) {
        throw new Error(`Model "${modelName}" is not allowed or does not exist`);
    }

    const {
        where = {},
        orderBy = { createdAt: 'desc' },
        take = modelConfig.maxRecords,
        skip = 0
    } = options;

    // Enforce max records limit
    const safeTake = Math.min(take, modelConfig.maxRecords);

    try {
        const results = await prisma[modelConfig.model].findMany({
            where,
            select: modelConfig.defaultSelect,
            orderBy,
            take: safeTake,
            skip
        });

        return results;
    } catch (error) {
        console.error(`Error querying ${modelName}:`, error);
        throw new Error(`Failed to query ${modelName}: ${error.message}`);
    }
}

/**
 * Get targeted database context for AI
 * @param {string[]} requestedModels - Optional list of model keys to fetch (from ALLOWED_MODELS)
 * @param {string} userMessage - The user's message to help target specific records
 */
async function getComprehensiveDatabaseContext(requestedModels = null, userMessage = "") {
    try {
        const fetchWithFallback = async (modelName, options) => {
            try {
                return await queryModel(modelName, options);
            } catch (error) {
                console.error(`Error fetching ${modelName}:`, error.message);
                return [];
            }
        };

        // Determine which models to fetch
        const modelsToFetch = requestedModels && Array.isArray(requestedModels)
            ? requestedModels.filter(m => ALLOWED_MODELS[m])
            : Object.keys(ALLOWED_MODELS);

        if (modelsToFetch.length === 0) return "";

        const results = {};
        const counts = {};

        // Intelligent Detail Fetching: Detect if user is asking for a specific PV number
        let specificPv = null;
        if (modelsToFetch.includes('pvEssai') && userMessage) {
            // Match "PV #123", "PV 123", "rapport 123", etc.
            const pvMatch = userMessage.match(/(?:pv|rapport|essai)\s*(?:#|n°|n)?\s*(\d+)/i);
            if (pvMatch && pvMatch[1]) {
                const pvNum = pvMatch[1];
                try {
                    specificPv = await prisma.pvEssai.findFirst({
                        where: {
                            OR: [
                                { numero: pvNum },
                                { numero: { contains: pvNum } }
                            ]
                        }
                    });
                    if (specificPv) console.log(`🎯 Targeted PV detected: ${specificPv.numero}`);
                } catch (e) {
                    console.error("Error fetching specific PV:", e);
                }
            }
        }

        await Promise.all(modelsToFetch.map(async (modelKey) => {
            try {
                const config = ALLOWED_MODELS[modelKey];
                const [records, total] = await Promise.all([
                    fetchWithFallback(modelKey, { take: config.maxRecords }),
                    prisma[config.model].count()
                ]);
                results[modelKey] = records;
                counts[modelKey] = total;
            } catch (err) {
                console.error(`Error fetching data for ${modelKey}:`, err);
                results[modelKey] = [];
                counts[modelKey] = 0;
            }
        }));

        let context = "=== DATABASE CONTEXT ===\n";
        context += "You have access to the following relevant data sections:\n\n";

        // Stock/Inventory
        if (results.stock) {
            context += `📦 STOCK (Inventory) - Total items: ${counts.stock || 0}\n`;
            if (results.stock.length === 0) {
                context += "  - No stock items found.\n";
            } else {
                results.stock.forEach(s => {
                    context += `  - ${s.articleName}: ${s.nombreUnite} ${s.unit || 'units'} (Weight: ${s.poid} kg)\n`;
                });
            }
            context += "\n";
        }

        // Production Lines
        if (results.productionLine) {
            context += `🏭 PRODUCTION FLOW - Total transformers: ${counts.productionLine || 0}\n`;
            const plines = results.productionLine;
            const plannedLines = plines.filter(pl => {
                if (!pl.stageDates) return false;
                return Object.keys(pl.stageDates).some(key =>
                    !key.endsWith('_operator') && !key.endsWith('_assignment') && pl.stageDates[key]
                );
            });
            const draftLines = plines.filter(pl => !plannedLines.includes(pl));

            context += `  Active (Planified): ${plannedLines.length}\n`;
            context += `  Drafts (Unplanified): ${draftLines.length}\n`;

            plannedLines.slice(0, 30).forEach(pl => {
                const status = pl.dateDebutReelle ? "En cours" : "Planifié";
                context += `  - Transfo: ${pl.numeroTransformateur} | Status: ${status} | Client: ${pl.client || 'N/A'} | Puissance: ${pl.puissance || 'N/A'}\n`;
            });
            context += "\n";
        }

        // Orders
        if (results.commande) {
            context += `📋 ORDERS (Commandes) - Total orders: ${counts.commande || 0}\n`;
            if (results.commande.length === 0) {
                context += "  - No orders found.\n";
            } else {
                results.commande.slice(0, 15).forEach(c => {
                    context += `  - Order #${c.numero}: Client: ${c.client || 'N/A'}, Status: ${c.status}\n`;
                });
            }
            context += "\n";
        }

        // Test Reports (PV Essais)
        if (results.pvEssai) {
            context += `🧪 TEST REPORTS (PV Essais) - Total recorded: ${counts.pvEssai || 0}\n`;

            // Add aggregate stats if available
            try {
                const compliantCount = await prisma.pvEssai.count({ where: { conformite: { equals: 'Conforme', mode: 'insensitive' } } });
                const nonCompliantCount = await prisma.pvEssai.count({ where: { conformite: { equals: 'Non Conforme', mode: 'insensitive' } } });
                context += `  - Stats: ${compliantCount} Conforme, ${nonCompliantCount} Non Conforme\n`;
            } catch (e) { /* silent fail */ }

            if (specificPv) {
                context += `\n  🎯 TARGETED PV DETAILS (#${specificPv.numero}):\n`;
                context += `  ${JSON.stringify(specificPv, null, 2).split('\n').map(l => '    ' + l).join('\n')}\n\n`;
            }

            if (results.pvEssai.length === 0 && !specificPv) {
                context += "  - No recent test reports found.\n";
            } else {
                context += "  - Recent Reports:\n";
                // Provide FULL details for top 5, summary for next 15
                results.pvEssai.slice(0, 5).forEach(pv => {
                    context += `    - PV #${pv.numero || pv.id}: ${pv.marque || 'N/A'}, Client: ${pv.client || 'N/A'}, Power: ${pv.power} kVA\n`;
                    context += `      [Detailed Data]: VoltRatio: ${!!pv.voltage_ratio}, NoLoad: ${!!pv.no_load_test}, Resist: ${!!pv.resistance_test}, Conform: ${pv.conformite}\n`;
                });

                if (results.pvEssai.length > 5) {
                    context += "    - Others (Summary):\n";
                    results.pvEssai.slice(5, 20).forEach(pv => {
                        context += `      - PV #${pv.numero || pv.id}: ${pv.client || 'N/A'} (${pv.conformite})\n`;
                    });
                }
            }
            context += "\n";
        }

        // Users & Teams
        if (results.user || results.team || results.operator) {
            context += "👥 PERSONNEL:\n";
            if (results.team) context += `  Teams: ${results.team.length}\n`;
            if (results.user) context += `  System Users: ${results.user.length}\n`;
            if (results.operator) context += `  Production Operators: ${results.operator.length}\n`;
            context += "\n";
        }

        // Recent Logs
        if (results.actionLog) {
            context += "📝 RECENT ACTIONS:\n";
            results.actionLog.slice(0, 5).forEach(log => {
                const date = new Date(log.createdAt).toLocaleString('fr-FR');
                context += `  - [${date}] ${log.action}\n`;
            });
            context += "\n";
        }

        context += "=== END DATABASE CONTEXT ===\n";
        return context;

    } catch (error) {
        console.error("Critical error in getComprehensiveDatabaseContext:", error);
        return "=== DATABASE CONTEXT (FAILED) ===";
    }
}

/**
 * Execute a custom aggregation query
 */

async function executeAggregation(modelName, aggregationType, field) {
    const modelConfig = ALLOWED_MODELS[modelName];

    if (!modelConfig) {
        throw new Error(`Model "${modelName}" is not allowed`);
    }

    const validAggregations = ['count', 'sum', 'avg', 'min', 'max'];
    if (!validAggregations.includes(aggregationType)) {
        throw new Error(`Invalid aggregation type: ${aggregationType}`);
    }

    try {
        const result = await prisma[modelConfig.model].aggregate({
            _count: aggregationType === 'count' ? { _all: true } : undefined,
            _sum: aggregationType === 'sum' ? { [field]: true } : undefined,
            _avg: aggregationType === 'avg' ? { [field]: true } : undefined,
            _min: aggregationType === 'min' ? { [field]: true } : undefined,
            _max: aggregationType === 'max' ? { [field]: true } : undefined,
        });

        return result;
    } catch (error) {
        console.error(`Error executing aggregation on ${modelName}:`, error);
        throw new Error(`Failed to aggregate ${modelName}: ${error.message}`);
    }
}

module.exports = {
    getDatabaseSchema,
    queryModel,
    getComprehensiveDatabaseContext,
    executeAggregation,
    ALLOWED_MODELS
};
