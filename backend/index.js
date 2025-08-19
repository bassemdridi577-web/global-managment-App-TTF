const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('./generated/prisma');
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

// CORS options to allow all origins and methods
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());

// Mount route modules
const pvEssaiRoutes = require('./routes/pvEssai');
const userRoutes = require('./routes/users');

app.get('/', (req, res) => res.send('ye5dem el backend jawek mrigel'));

app.use('/api/pv-essai', pvEssaiRoutes(prisma));
app.use('/api/users', userRoutes(prisma));
app.use('/api', userRoutes(prisma));

// Create a new PvEssai record
app.post('/api/pv-essai', async (req, res) => {
  try {
  // If frontend sends `info` object (nested), keep it but also create a
  // `source` object that prefers values from `info` for robust mapping.
  if (req.body && req.body.info && typeof req.body.info === 'object') {
    // keep original req.body intact for logging, but build a source that
    // flattens info on top of req.body (info wins)
    // Example: source.marque will resolve from req.body.info.marque or req.body.marque
  }
  // Build a source object where nested `info` overrides top-level values
  // so that values coming from the frontend `info` object take precedence.
  const source = { ...(req.body || {}), ...(req.body && req.body.info ? req.body.info : {}) };
  // remove nested info key from the source to avoid duplication
  if (source.info) delete source.info;
  console.log('Incoming /api/pv-essai body keys:', Object.keys(req.body || {}));
  console.log('Incoming /api/pv-essai combined source preview:', JSON.stringify(source || {}, null, 2));
  // Normalized source (string/number casts can be added here if needed)
  const normalizedSource = { ...source };
  console.log('Normalized source for mapping:', JSON.stringify(normalizedSource, null, 2));
    // Extract and map fields from request body to match database schema
    // Convert string values to appropriate types during extraction
    const {
      marque,
      numero,
      type,
      client,
      couplage,
      btu2_2,
      bti2_2,
      mti2_1,
  // Test data
  voltage_ratio,
  no_load_test,
  short_circuit_test,
  dielectric_test,
  resistance_test,
      date,
      ...otherFields
    } = req.body;
    
    // Extract and convert numeric values
    // Parse numeric values from the combined source (prefer info fields)
    const power = source.power !== undefined && source.power !== null && source.power !== '' ? parseFloat(String(source.power)) : null;
    const mtu1 = source.mtu1 !== undefined && source.mtu1 !== null && source.mtu1 !== '' ? parseFloat(String(source.mtu1)) : null;
    const mtu2 = source.mtu2 !== undefined && source.mtu2 !== null && source.mtu2 !== '' ? parseFloat(String(source.mtu2)) : null;
    const btu2 = source.btu2 !== undefined && source.btu2 !== null && source.btu2 !== '' ? parseFloat(String(source.btu2)) : null;
    const bti2 = source.bti2 !== undefined && source.bti2 !== null && source.bti2 !== '' ? parseFloat(String(source.bti2)) : null;

    // Derive phases number: try multiple keys and fallbacks
    let phasesInt = null;
    const phaseCandidates = [
      'nbphase', 'nbPhase', 'nbPhases', 'phases', 'nbPhases', 'NbPhase', 'NbPhases'
    ];
    for (const k of phaseCandidates) {
      if (source[k] !== undefined && source[k] !== null && source[k] !== '') {
        const parsed = parseInt(String(source[k]).replace(/[^0-9]/g, ''), 10);
        if (!Number.isNaN(parsed) && parsed > 0) { phasesInt = parsed; break; }
      }
    }
    if (phasesInt === null) {
      // try to infer from type-like fields which may contain 'Biphasé', '2 Biphasé', etc.
      const typeFields = [source.type, source.Type, source.typeSource, source.typeName];
      const typeStr = (typeFields.find(Boolean) || '').toString().toLowerCase();
      // If the type string contains a digit (e.g. "2 Biphasé"), use it
      const digitMatch = typeStr.match(/([1-9])/);
      if (digitMatch) phasesInt = parseInt(digitMatch[1], 10);
      else if (typeStr.includes('mono')) phasesInt = 1;
      else if (typeStr.includes('bi')) phasesInt = 2;
      else if (typeStr.includes('tri')) phasesInt = 3;
    }
    // Additional fallbacks: if still null, infer from presence of bip fields or multi-line test arrays
    if (phasesInt === null) {
      try {
        if (source.btu2_2 || source.bti2_2 || source.mti2_1) phasesInt = 2;
        else if (Array.isArray(source.resistance_test) && source.resistance_test.length > 1) phasesInt = 2;
        else if (Array.isArray(source.no_load_test) && source.no_load_test.length > 1) phasesInt = 2;
        else if (Array.isArray(source.voltage_ratio && source.voltage_ratio.measured) && (source.voltage_ratio.measured[0] || []).length > 1) {
          // if measured rows have two columns, it's likely multi-phase; set to 2 as safe default
          phasesInt = 2;
        }
      } catch (e) {
        // swallow fallback errors and leave phasesInt null
        console.warn('phases inference fallback failed', e && e.message);
      }
    }

    // Log the original values for debugging
    console.log('Original values:', { power, mtu1, mtu2, btu2, bti2 });

    // Map fields to database schema with proper type conversion using source
    const dataToSave = {
      marque: source.marque || null,
      power: (source.power !== undefined && source.power !== null && source.power !== '') ? parseFloat(String(source.power)) : null,
      frequency: (source.frequency !== undefined && source.frequency !== null && source.frequency !== '') ? parseInt(String(source.frequency)) : 50,
      numero: source.numero || null,
  phases: phasesInt,
      type: source.type || null,
      client: source.client || null,
      mtu1: (source.mtu1 !== undefined && source.mtu1 !== null && source.mtu1 !== '') ? parseFloat(String(source.mtu1)) : null,
      mtu2: (source.mtu2 !== undefined && source.mtu2 !== null && source.mtu2 !== '') ? parseFloat(String(source.mtu2)) : null,
      btu2: (source.btu2 !== undefined && source.btu2 !== null && source.btu2 !== '') ? parseFloat(String(source.btu2)) : null,
  btu2_2: (source.btu2_2 !== undefined && source.btu2_2 !== null && source.btu2_2 !== '') ? String(source.btu2_2) : (source.btU2_2 !== undefined && source.btU2_2 !== null && source.btU2_2 !== '' ? String(source.btU2_2) : null),
  bti2_2: (source.bti2_2 !== undefined && source.bti2_2 !== null && source.bti2_2 !== '') ? String(source.bti2_2) : null,
  mti2_1: (source.mti2_1 !== undefined && source.mti2_1 !== null && source.mti2_1 !== '') ? String(source.mti2_1) : null,
      prises: source.prises || null,
      norme: source.norme || 'CEI 60076', // Default value as per frontend
      couplage: source.couplage || null,
      bti2: (source.bti2 !== undefined && source.bti2 !== null && source.bti2 !== '') ? parseFloat(String(source.bti2)) : null,
      date: source.date ? new Date(source.date) : new Date(),
      voltage_ratio,
      no_load_test,
      short_circuit_test,
      dielectric_test,
      resistance_test,
    };

  // Log the converted values for debugging
  console.log('Converted values:', dataToSave);

    // Log the data to be saved for debugging
    console.log('Data to save:', JSON.stringify(dataToSave, null, 2));
    
    const pvEssai = await prisma.pvEssai.create({
      data: dataToSave,
    });
    // Return created record along with the computed source for debugging
    res.status(201).json({ pvEssai, debugSource: source });
  } catch (error) {
    console.error('PvEssai creation error message:', error.message);
    console.error('PvEssai creation error meta:', error.meta || null);
    console.error('PvEssai creation error stack:', error.stack);
    res.status(500).json({
      error: 'Failed to create PvEssai record',
      details: error.message,
      meta: error.meta || null,
    });
  }
});

// Get all PvEssai records
app.get('/api/pv-essai', async (req, res) => {
  try {
    // Query params: page, limit, search, client, type, phases, from, to, sort
    const {
      page = '1',
      limit = '25',
      search,
      client,
      type,
      phases,
      from,
      to,
      sort
    } = req.query;

    const pageInt = Math.max(1, parseInt(String(page)) || 1);
    const limitInt = Math.max(1, Math.min(1000, parseInt(String(limit)) || 25));
    const skip = (pageInt - 1) * limitInt;

    // Build where clause
    const where = {};
    const AND = [];

    if (search) {
      const s = String(search);
      AND.push({
        OR: [
          { marque: { contains: s, mode: 'insensitive' } },
          { numero: { contains: s, mode: 'insensitive' } },
          { client: { contains: s, mode: 'insensitive' } }
        ]
      });
    }
    if (client) AND.push({ client: { equals: String(client), mode: 'insensitive' } });
    if (type) AND.push({ type: { contains: String(type), mode: 'insensitive' } });
    if (phases) {
      const p = parseInt(String(phases));
      if (!Number.isNaN(p)) AND.push({ phases: p });
    }
    if (from || to) {
      const dateWhere = {};
      if (from) {
        const d = new Date(String(from));
        if (!Number.isNaN(d.getTime())) dateWhere.gte = d;
      }
      if (to) {
        const d = new Date(String(to));
        if (!Number.isNaN(d.getTime())) dateWhere.lte = d;
      }
      if (Object.keys(dateWhere).length) AND.push({ date: dateWhere });
    }

    if (AND.length) where.AND = AND;

    // sorting: expect format 'field:asc' or 'field:desc', default createdAt:desc
    let orderBy = { createdAt: 'desc' };
    if (sort) {
      const [field, dir] = String(sort).split(':');
      if (field) {
        orderBy = { [field]: (dir && dir.toLowerCase() === 'asc') ? 'asc' : 'desc' };
      }
    }

    const [total, data] = await Promise.all([
      prisma.pvEssai.count({ where }),
      prisma.pvEssai.findMany({ where, skip, take: limitInt, orderBy })
    ]);

    res.json({ data, total, page: pageInt, limit: limitInt });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch PvEssai records',
      details: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
