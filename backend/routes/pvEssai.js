const express = require('express');

module.exports = (prisma) => {
  const router = express.Router();

  // Create a new PvEssai record
  router.post('/', async (req, res) => {
    try {
      const source = { ...(req.body || {}), ...(req.body && req.body.info ? req.body.info : {}) };
      if (source.info) delete source.info;

      console.log('Incoming /api/pv-essai combined source preview:', JSON.stringify(source || {}, null, 2));

      // Parse numeric fields
      const power = source.power !== undefined && source.power !== null && source.power !== '' ? parseFloat(String(source.power)) : null;
      const mtu1 = source.mtu1 !== undefined && source.mtu1 !== null && source.mtu1 !== '' ? parseFloat(String(source.mtu1)) : null;
      const mtu2 = source.mtu2 !== undefined && source.mtu2 !== null && source.mtu2 !== '' ? parseFloat(String(source.mtu2)) : null;
      const btu2 = source.btu2 !== undefined && source.btu2 !== null && source.btu2 !== '' ? parseFloat(String(source.btu2)) : null;
      const bti2 = source.bti2 !== undefined && source.bti2 !== null && source.bti2 !== '' ? parseFloat(String(source.bti2)) : null;

      // Derive phases
      let phasesInt = null;
      const phaseCandidates = ['nbphase', 'nbPhase', 'nbPhases', 'phases', 'nbPhases', 'NbPhase', 'NbPhases'];
      for (const k of phaseCandidates) {
        if (source[k] !== undefined && source[k] !== null && source[k] !== '') {
          const parsed = parseInt(String(source[k]).replace(/[^0-9]/g, ''), 10);
          if (!Number.isNaN(parsed) && parsed > 0) { phasesInt = parsed; break; }
        }
      }
      if (phasesInt === null) {
        const typeFields = [source.type, source.Type, source.typeSource, source.typeName];
        const typeStr = (typeFields.find(Boolean) || '').toString().toLowerCase();
        const digitMatch = typeStr.match(/([1-9])/);
        if (digitMatch) phasesInt = parseInt(digitMatch[1], 10);
        else if (typeStr.includes('mono')) phasesInt = 1;
        else if (typeStr.includes('bi')) phasesInt = 2;
        else if (typeStr.includes('tri')) phasesInt = 3;
      }
      if (phasesInt === null) {
        try {
          if (source.btu2_2 || source.bti2_2 || source.mti2_1) phasesInt = 2;
          else if (Array.isArray(source.resistance_test) && source.resistance_test.length > 1) phasesInt = 2;
          else if (Array.isArray(source.no_load_test) && source.no_load_test.length > 1) phasesInt = 2;
          else if (Array.isArray(source.voltage_ratio && source.voltage_ratio.measured) && (source.voltage_ratio.measured[0] || []).length > 1) phasesInt = 2;
        } catch (e) {
          console.warn('phases inference fallback failed', e && e.message);
        }
      }

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
        norme: source.norme || 'CEI 60076',
        couplage: source.couplage || null,
        bti2: (source.bti2 !== undefined && source.bti2 !== null && source.bti2 !== '') ? parseFloat(String(source.bti2)) : null,
        date: source.date ? new Date(source.date) : new Date(),
        voltage_ratio: source.voltage_ratio || null,
        no_load_test: source.no_load_test || null,
        short_circuit_test: source.short_circuit_test || null,
        dielectric_test: source.dielectric_test || null,
        resistance_test: source.resistance_test || null,
      };

      console.log('Saving PvEssai:', JSON.stringify(dataToSave, null, 2));

      const pvEssai = await prisma.pvEssai.create({ data: dataToSave });
      res.status(201).json({ pvEssai, debugSource: source });
    } catch (error) {
      console.error('PvEssai creation error:', error && error.message);
      res.status(500).json({ error: 'Failed to create PvEssai record', details: error && error.message, meta: error && error.meta });
    }
  });

  // Get all PvEssai records with pagination & filtering
  router.get('/', async (req, res) => {
    try {
      const { page = '1', limit = '25', search, client, type, phases, from, to, sort } = req.query;
      const pageInt = Math.max(1, parseInt(String(page)) || 1);
      const limitInt = Math.max(1, Math.min(1000, parseInt(String(limit)) || 25));
      const skip = (pageInt - 1) * limitInt;

      const where = {};
      const AND = [];
      if (search) {
        const s = String(search);
        AND.push({ OR: [ { marque: { contains: s, mode: 'insensitive' } }, { numero: { contains: s, mode: 'insensitive' } }, { client: { contains: s, mode: 'insensitive' } } ] });
      }
      if (client) AND.push({ client: { equals: String(client), mode: 'insensitive' } });
      if (type) AND.push({ type: { contains: String(type), mode: 'insensitive' } });
      if (phases) {
        const p = parseInt(String(phases)); if (!Number.isNaN(p)) AND.push({ phases: p });
      }
      if (from || to) {
        const dateWhere = {};
        if (from) { const d = new Date(String(from)); if (!Number.isNaN(d.getTime())) dateWhere.gte = d; }
        if (to) { const d = new Date(String(to)); if (!Number.isNaN(d.getTime())) dateWhere.lte = d; }
        if (Object.keys(dateWhere).length) AND.push({ date: dateWhere });
      }
      if (AND.length) where.AND = AND;

      let orderBy = { createdAt: 'desc' };
      if (sort) {
        const [field, dir] = String(sort).split(':'); if (field) orderBy = { [field]: (dir && dir.toLowerCase() === 'asc') ? 'asc' : 'desc' };
      }

      const [total, data] = await Promise.all([
        prisma.pvEssai.count({ where }),
        prisma.pvEssai.findMany({ where, skip, take: limitInt, orderBy }),
      ]);

      res.json({ data, total, page: pageInt, limit: limitInt });
    } catch (error) {
      console.error('GET /api/pv-essai error:', error && error.message);
      res.status(500).json({ error: 'Failed to fetch PvEssai records', details: error && error.message });
    }
  });

  return router;
};
