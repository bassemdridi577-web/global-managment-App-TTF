const prisma = require('../lib/prismaClient');
const { createLog } = require('./logService');

function buildSource(payload) {
  console.log('buildSource payload:', JSON.stringify(payload, null, 2));
  const source = { ...(payload || {}), ...(payload && payload.info ? payload.info : {}) };
  if (source.info) delete source.info;
  console.log('buildSource result:', JSON.stringify(source, null, 2));
  console.log('Operateur in source:', source.operateur);

  return source;
}

function calculateConformite(payload) {
  const nonConformites = new Set();

  const addReason = (reason) => {
    if (reason && typeof reason === 'string') {
      // Clean "non conforme" variations and normalize separators, preserving case for terms like I0/P0
      const cleanedReason = reason
        .replace(/non[- \s]*conforme/gi, '')
        .replace(/&/g, ',')
        .replace(/\s+/g, ' ')
        .trim();

      if (cleanedReason) {
        const parts = cleanedReason.split(',');
        parts.forEach(p => {
          const trimmed = p.trim();
          if (trimmed) nonConformites.add(trimmed);
        });
      }
    }
  };

  // Helper to scan any object or array for failure strings
  const scanForFailures = (data) => {
    if (!data) return;
    if (Array.isArray(data)) {
      data.forEach(item => scanForFailures(item));
    } else if (typeof data === 'object') {
      Object.values(data).forEach(val => {
        if (typeof val === 'string' && val.toLowerCase().includes('non conforme')) {
          addReason(val);
        } else if (typeof val === 'object') {
          scanForFailures(val);
        }
      });
    }
  };

  // Dielectric Test
  if (payload.dielectric_test) {
    if (payload.dielectric_test.resultat?.toLowerCase().includes('non conforme')) {
      addReason(payload.dielectric_test.resultat);
    }
    scanForFailures(payload.dielectric_test);
    // Explicit mappings for known fields if not caught by scan
    if (payload.dielectric_test.spires?.conclusion?.toLowerCase().includes('non conforme')) nonConformites.add('dielectrique (spires)');
    if (payload.dielectric_test.htbt?.conclusion?.toLowerCase().includes('non conforme')) nonConformites.add('dielectrique (htbt)');
    if (payload.dielectric_test.btht?.conclusion?.toLowerCase().includes('non conforme')) nonConformites.add('dielectrique (btht)');
  }

  // Voltage Ratio
  if (payload.voltage_ratio) {
    scanForFailures(payload.voltage_ratio.conclusions);
    scanForFailures(payload.voltage_ratio.conclusions3);
    if (payload.voltage_ratio.conclusions?.some(c => c && c.toLowerCase().includes('non conforme'))) nonConformites.add('rapport');
    if (payload.voltage_ratio.conclusions3?.some(c => c && c.toLowerCase().includes('non conforme'))) nonConformites.add('rapport');
  }

  // No-Load Test
  if (payload.no_load_test) {
    scanForFailures(payload.no_load_test);
  }

  // Short-Circuit Test
  if (payload.short_circuit_test) {
    scanForFailures(payload.short_circuit_test);
  }

  // Bitention tests
  if (payload.bitention_tests) {
    scanForFailures(payload.bitention_tests);
  }


  if (nonConformites.size > 0) {
    // Return unique, cleaned reasons, e.g. "I0, P0"
    return Array.from(nonConformites)
      .map(r => r.replace(/non[- \s]*conforme/gi, '').trim())
      .filter(r => r)
      .join(', ');
  }

  return 'conforme';
}

function inferPhasesFromSource(source) {
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
    const typeFields = [source.type, source.Type, source.typeSource, source.typeName];
    const typeStr = (typeFields.find(Boolean) || '').toString().toLowerCase();
    const digitMatch = typeStr.match(/([1-9])/);
    if (digitMatch) phasesInt = parseInt(digitMatch[1], 10);
    else if (typeStr.includes('mono')) phasesInt = 1;
    else if (typeStr.includes('tri')) phasesInt = 3;
    else if (typeStr.includes('bi')) phasesInt = 2;
  }
  if (phasesInt === null) {
    try {
      if (source.btu2_2 || source.bti2_2 || source.mti2_1) phasesInt = 2;
      else if (Array.isArray(source.resistance_test) && source.resistance_test.length > 1) phasesInt = 2;
      else if (Array.isArray(source.no_load_test) && source.no_load_test.length > 1) phasesInt = 2;
      else if (Array.isArray(source.voltage_ratio && source.voltage_ratio.measured) && (source.voltage_ratio.measured[0] || []).length > 1) {
        phasesInt = 2;
      }
    } catch (e) {
      // ignore
    }
  }
  return phasesInt;
}

async function createPv(payload, userId) {
  console.log('Backend received payload:', JSON.stringify(payload, null, 2));
  console.log('voltage_ratio:', JSON.stringify(payload.voltage_ratio, null, 2));
  console.log('no_load_test:', JSON.stringify(payload.no_load_test, null, 2));
  console.log('short_circuit_test:', JSON.stringify(payload.short_circuit_test, null, 2));
  console.log('Operateur in payload:', payload.operateur);


  const source = buildSource(payload);

  const parseIf = (v, asInt = false) => {
    if (v === undefined || v === null || v === '') return null;
    const s = String(v).trim();
    if (s === '') return null;
    return asInt ? parseInt(s, 10) : parseFloat(s);
  };

  const power = parseIf(source.power);
  const mtu1 = parseIf(source.mtu1);
  const mtu2 = parseIf(source.mtu2);
  const btu2 = parseIf(source.btu2);
  const bti2 = parseIf(source.bti2);

  const phasesInt = inferPhasesFromSource(source);
  const conformite = calculateConformite(payload);
  console.log('Calculated conformite:', conformite);

  const dataToSave = {
    marque: source.marque || null,
    power: (source.power !== undefined && source.power !== null && source.power !== '') ? parseIf(source.power) : null,
    frequency: (source.frequency !== undefined && source.frequency !== null && source.frequency !== '') ? (parseIf(source.frequency, true) || 50) : 50,
    numero: source.numero || null,
    phases: phasesInt,
    type: source.type || null,
    client: source.client || null,
    mission: source.mission || null,
    mtu1: (source.mtu1 !== undefined && source.mtu1 !== null && source.mtu1 !== '') ? parseIf(source.mtu1) : null,
    mtu2: (source.mtu2 !== undefined && source.mtu2 !== null && source.mtu2 !== '') ? parseIf(source.mtu2) : null,
    mtu2_2: (source.mtu2_2 !== undefined && source.mtu2_2 !== null && source.mtu2_2 !== '') ? parseIf(source.mtu2_2) : null,
    btu2: (source.btu2 !== undefined && source.btu2 !== null && source.btu2 !== '') ? parseIf(source.btu2) : null,
    btu2_2: (source.btu2_2 !== undefined && source.btu2_2 !== null && source.btu2_2 !== '') ? String(source.btu2_2) : (source.btU2_2 !== undefined && source.btU2_2 !== null && source.btU2_2 !== '' ? String(source.btU2_2) : null),
    bti2_2: (source.bti2_2 !== undefined && source.bti2_2 !== null && source.bti2_2 !== '') ? String(source.bti2_2) : null,
    mti2_1: (source.mti2_1 !== undefined && source.mti2_1 !== null && source.mti2_1 !== '') ? String(source.mti2_1) : null,
    prises: source.prises || null,
    norme: source.norme || 'CEI 60076',
    couplage: source.couplage || null,
    list1: source.list1 || null,
    list2: source.list2 || null,
    list3: source.list3 || null,
    list4: source.list4 || null,
    couplage2: source.couplage2 || null,
    mtU1_2: source.mtU1_2 || null,
    bitention: source.bitention || null,
    matiere: source.matiere || null,
    refroidissement: source.refroidissement || null,
    bti2: (source.bti2 !== undefined && source.bti2 !== null && source.bti2 !== '') ? parseIf(source.bti2) : null,
    date: source.date ? new Date(source.date) : new Date(),
    voltage_ratio: source.voltage_ratio || null,
    no_load_test: source.no_load_test || null,
    no_load_test_2: source.no_load_test_2 || null,
    short_circuit_test: source.short_circuit_test || null,
    dielectric_test: source.dielectric_test || null,
    resistance_test: source.resistance_test || null,
    bitention_tests: source.bitention_tests || null,
    operateur: source.operateur || null,
    conformite: conformite,
    tensionType: source.tensionType || '',
  };

  console.log('Data to save:', JSON.stringify(dataToSave, null, 2));


  const pvEssai = await prisma.pvEssai.create({ data: dataToSave });

  if (userId) {
    const isModification = payload.voltage_ratio?.__meta?.modifiedFrom;
    const action = isModification ? 'pv_modified' : 'pv_created';
    const details = {
      pvId: pvEssai.id,
      numero: pvEssai.numero,
      power: pvEssai.power,
    };
    if (isModification) {
      details.modifiedFromId = payload.voltage_ratio.__meta.modifiedFrom;
    }
    await createLog(userId, action, details);
  }

  return { pvEssai, debugSource: source };
}

async function updatePv(id, payload) {
  console.log(`Backend received update payload for id ${id}:`, JSON.stringify(payload, null, 2));

  const source = buildSource(payload);

  const parseIf = (v, asInt = false) => {
    if (v === undefined || v === null || v === '') return null;
    const s = String(v).trim();
    if (s === '') return null;
    return asInt ? parseInt(s, 10) : parseFloat(s);
  };

  const phasesInt = inferPhasesFromSource(source);
  const conformite = calculateConformite(payload);
  console.log('Calculated conformite for update:', conformite);

  const dataToSave = {
    marque: source.marque || null,
    power: (source.power !== undefined && source.power !== null && source.power !== '') ? parseIf(source.power) : null,
    frequency: (source.frequency !== undefined && source.frequency !== null && source.frequency !== '') ? (parseIf(source.frequency, true) || 50) : 50,
    numero: source.numero || null,
    phases: phasesInt,
    type: source.type || null,
    client: source.client || null,
    mission: source.mission || null,
    mtu1: (source.mtu1 !== undefined && source.mtu1 !== null && source.mtu1 !== '') ? parseIf(source.mtu1) : null,
    mtu2: (source.mtu2 !== undefined && source.mtu2 !== null && source.mtu2 !== '') ? parseIf(source.mtu2) : null,
    mtu2_2: (source.mtu2_2 !== undefined && source.mtu2_2 !== null && source.mtu2_2 !== '') ? parseIf(source.mtu2_2) : null,
    btu2: (source.btu2 !== undefined && source.btu2 !== null && source.btu2 !== '') ? parseIf(source.btu2) : null,
    btu2_2: (source.btu2_2 !== undefined && source.btu2_2 !== null && source.btu2_2 !== '') ? String(source.btu2_2) : (source.btU2_2 !== undefined && source.btU2_2 !== null && source.btU2_2 !== '' ? String(source.btU2_2) : null),
    bti2_2: (source.bti2_2 !== undefined && source.bti2_2 !== null && source.bti2_2 !== '') ? String(source.bti2_2) : null,
    mti2_1: (source.mti2_1 !== undefined && source.mti2_1 !== null && source.mti2_1 !== '') ? String(source.mti2_1) : null,
    prises: source.prises || null,
    norme: source.norme || 'CEI 60076',
    couplage: source.couplage || null,
    list1: source.list1 || null,
    list2: source.list2 || null,
    list3: source.list3 || null,
    list4: source.list4 || null,
    couplage2: source.couplage2 || null,
    mtU1_2: source.mtU1_2 || null,
    bitention: source.bitention || null,
    tensionType: source.tensionType || '',
    matiere: source.matiere || null,
    refroidissement: source.refroidissement || null,
    bti2: (source.bti2 !== undefined && source.bti2 !== null && source.bti2 !== '') ? parseIf(source.bti2) : null,
    date: source.date ? new Date(source.date) : new Date(),
    voltage_ratio: source.voltage_ratio || null,
    no_load_test: source.no_load_test || null,
    no_load_test_2: source.no_load_test_2 || null,
    short_circuit_test: source.short_circuit_test || null,
    dielectric_test: source.dielectric_test || null,
    resistance_test: source.resistance_test || null,
    bitention_tests: source.bitention_tests || null,
    operateur: source.operateur || null,
    conformite: conformite,
  };

  console.log('Data to update:', JSON.stringify(dataToSave, null, 2));


  const pvEssai = await prisma.pvEssai.update({
    where: { id: Number(id) },
    data: dataToSave,
  });

  return { pvEssai, debugSource: source };
}

async function listPv(query) {
  const {
    page = '1',
    limit = '25',
    search,
    client,
    type,
    phases,
    from,
    to,
    sort,
    bitention
  } = query || {};

  const pageInt = Math.max(1, parseInt(String(page)) || 1);
  const limitInt = Math.max(1, Math.min(1000, parseInt(String(limit)) || 25));
  const skip = (pageInt - 1) * limitInt;

  const where = {};
  const AND = [];

  if (search) {
    const s = String(search);
    const searchField = query.searchField; // 'numero', 'operateur', 'client', 'power'

    if (searchField === 'power') {
      const p = parseFloat(s);
      if (!isNaN(p)) {
        AND.push({ power: { equals: p } });
      }
    } else if (searchField && ['numero', 'operateur', 'client', 'marque'].includes(searchField)) {
      AND.push({ [searchField]: { contains: s, mode: 'insensitive' } });
    } else {
      // Global search fallback
      const searchConditions = [
        { marque: { contains: s, mode: 'insensitive' } },
        { numero: { contains: s, mode: 'insensitive' } },
        { client: { contains: s, mode: 'insensitive' } },
        { operateur: { contains: s, mode: 'insensitive' } }
      ];

      const searchNumber = parseInt(s, 10);
      if (!isNaN(searchNumber)) {
        searchConditions.push({ id: { equals: searchNumber } });
      }
      AND.push({ OR: searchConditions });
    }
  }
  if (client) AND.push({ client: { equals: String(client), mode: 'insensitive' } });
  if (type) AND.push({ type: { contains: String(type), mode: 'insensitive' } });
  if (phases) {
    const p = parseInt(String(phases));
    if (!Number.isNaN(p)) AND.push({ phases: p });
  }
  if (bitention) {
    AND.push({ bitention: { equals: String(bitention) } });
  }
  if (from || to) {
    const dateWhere = {};
    if (from) {
      const d = new Date(String(from));
      if (!Number.isNaN(d.getTime())) dateWhere.gte = d;
    }
    if (to) {
      const d = new Date(String(to));
      if (!Number.isNaN(d.getTime())) {
        d.setUTCHours(23, 59, 59, 999); // Set to the end of the day in UTC
        dateWhere.lte = d;
      }
    }
    if (Object.keys(dateWhere).length) AND.push({ date: dateWhere });
  }

  if (AND.length) where.AND = AND;

  console.log('Prisma where clause:', JSON.stringify(where, null, 2));

  const validSortFields = [
    'id', 'marque', 'power', 'frequency', 'numero', 'phases', 'type', 'client',
    'mtu1', 'mtu2', 'btu2', 'prises', 'norme', 'couplage', 'matiere', 'bti2',
    'date', 'createdAt', 'updatedAt', 'bti2_2', 'btu2_2', 'mti2_1', 'operateur',
    'conformite', 'bitention', 'list1', 'list2', 'list3', 'list4', 'mtU1_2', 'couplage2'
  ];

  let orderBy = { createdAt: 'desc' };
  if (sort) {
    const [field, dir] = String(sort).split(':');
    if (field && validSortFields.includes(field)) {
      orderBy = { [field]: (dir && dir.toLowerCase() === 'asc') ? 'asc' : 'desc' };
    }
  }

  const [total, data] = await Promise.all([
    prisma.pvEssai.count({ where }),
    prisma.pvEssai.findMany({
      where,
      skip,
      take: limitInt,
      orderBy,
      select: {
        id: true,
        marque: true,
        power: true,
        frequency: true,
        numero: true,
        phases: true,
        type: true,
        client: true,
        mtu1: true,
        mtu2: true,
        btu2: true,
        prises: true,
        norme: true,
        couplage: true,
        matiere: true,
        bti2: true,
        date: true,
        voltage_ratio: true,
        no_load_test: true,
        no_load_test_2: true,
        short_circuit_test: true,
        dielectric_test: true,
        resistance_test: true,
        bitention_tests: true,
        createdAt: true,
        updatedAt: true,
        bti2_2: true,
        btu2_2: true,
        mti2_1: true,
        operateur: true,
        conformite: true,
        bitention: true,
        tensionType: true,
        list1: true,
        list2: true,
        list3: true,
        list4: true,
        mtU1_2: true,
        couplage2: true,
        refroidissement: true,
        mtu2_2: true,
        mission: true,
      }
    })
  ]);

  console.log('Data sent to frontend:', data);

  return { data, total, page: pageInt, limit: limitInt };
}

async function enrichPv(id) {
  if (!id) throw new Error('Missing id');
  const pv = await prisma.pvEssai.findUnique({ where: { id: Number(id) } });
  if (!pv) throw new Error('PvEssai not found');

  const toUpdate = {};
  if (!pv.voltage_ratio && (pv.mtu1 !== null || pv.mtu2 !== null)) {
    toUpdate.voltage_ratio = {
      measured: [[pv.mtu1 || pv.mtu2 || 0]]
    };
  }
  if (!pv.no_load_test && (pv.mtu1 !== null || pv.mtu2 !== null)) {
    toUpdate.no_load_test = [{ mtu1: pv.mtu1, mtu2: pv.mtu2 }];
  }
  if (!pv.resistance_.test && (pv.bti2 !== null || pv.btu2 !== null)) {
    toUpdate.resistance_test = [{ bti2: pv.bti2, btu2: pv.btu2 }];
  }

  if (Object.keys(toUpdate).length === 0) {
    return pv;
  }

  const updated = await prisma.pvEssai.update({ where: { id: Number(id) }, data: toUpdate });
  return updated;
}

async function getPvById(id) {
  if (!id) return null;
  const numericId = Number(id);
  if (isNaN(numericId)) return null;
  const pv = await prisma.pvEssai.findUnique({ where: { id: numericId } });
  return pv;
}

async function getPvStats(query) {
  const { from, to, types } = query || {};

  const where = {};
  const AND = [];

  // Date range filtering
  if (from || to) {
    const dateWhere = {};
    if (from) {
      const d = new Date(String(from));
      if (!Number.isNaN(d.getTime())) dateWhere.gte = d;
    }
    if (to) {
      const d = new Date(String(to));
      if (!Number.isNaN(d.getTime())) {
        d.setUTCHours(23, 59, 59, 999); // Set to the end of the day
        dateWhere.lte = d;
      }
    }
    if (Object.keys(dateWhere).length) AND.push({ date: dateWhere });
  }

  // Transformer type filtering
  if (types) {
    const typesArray = types.split(',').map(t => t.trim()).filter(t => t);
    if (typesArray.length > 0) {
      AND.push({ type: { in: typesArray, mode: 'insensitive' } });
    }
  }

  if (AND.length) {
    where.AND = AND;
  }

  const allPvs = await prisma.pvEssai.findMany({
    where,
    select: {
      conformite: true,
      date: true,
    },
  });

  let conformeCount = 0;
  const nonConformeCombinations = {};
  let minDate = null;
  let maxDate = null;

  allPvs.forEach(pv => {
    if (pv.date) {
      const pvDate = new Date(pv.date);
      if (!minDate || pvDate < minDate) minDate = pvDate;
      if (!maxDate || pvDate > maxDate) maxDate = pvDate;
    }

    const conformiteStr = (pv.conformite || 'non défini').trim();
    const conformiteLower = conformiteStr.toLowerCase();

    if (conformiteLower === 'conforme') {
      conformeCount++;
    } else {
      // Deep clean: split, remove "non conforme" from sub-parts, normalize separators, and join
      const cleanedParts = conformiteStr
        .replace(/&/g, ',')
        .split(',')
        .map(part => part.replace(/non[- \s]*conforme/gi, '').trim())
        .filter(part => part !== '');

      const reasonKey = cleanedParts.length > 0 ? cleanedParts.join(', ') : 'non spécifié';
      nonConformeCombinations[reasonKey] = (nonConformeCombinations[reasonKey] || 0) + 1;
    }
  });

  const result = {
    conformeCount,
    ...nonConformeCombinations,
    minDate,
    maxDate,
  };

  return result;
}

async function getAvailableMonths() {
  const result = await prisma.$queryRaw`
    SELECT DISTINCT
      strftime('%Y-%m', date) as month
    FROM PvEssai
    ORDER BY month DESC
  `;
  return result.map(r => r.month);
}

async function deletePv(id) {
  if (!id) {
    throw new Error('Missing id');
  }
  const numericId = Number(id);
  if (isNaN(numericId)) {
    throw new Error('Invalid id');
  }
  const pvToDelete = await prisma.pvEssai.findUnique({ where: { id: numericId } });
  if (!pvToDelete) {
    throw new Error('PvEssai not found');
  }
  await prisma.pvEssai.delete({
    where: { id: numericId },
  });
  return pvToDelete;
}

async function refreshAllPvsConformity() {
  const allPvs = await prisma.pvEssai.findMany();
  let updatedCount = 0;

  for (const pv of allPvs) {
    const newConformite = calculateConformite(pv);
    if (newConformite !== pv.conformite) {
      await prisma.pvEssai.update({
        where: { id: pv.id },
        data: { conformite: newConformite },
      });
      updatedCount++;
    }
  }

  return { message: `Conformity refreshed for ${updatedCount} PVs.` };
}


async function getConformityByPower(query) { // Add query parameter
  const { type } = query || {}; // Destructure type from query

  const where = {};
  if (type) {
    where.type = {
      equals: type,
      mode: 'insensitive',
    };
  }

  const allPvs = await prisma.pvEssai.findMany({
    where, // Add where clause to the query
    select: {
      power: true,
      conformite: true,
    },
  });

  const powerStats = {};

  allPvs.forEach(pv => {
    if (pv.power === null || pv.power === undefined) {
      return;
    }

    if (!powerStats[pv.power]) {
      powerStats[pv.power] = {
        total: 0,
        conforme: 0,
        nonConforme: 0,
      };
    }

    powerStats[pv.power].total++;
    if (pv.conformite && pv.conformite.toLowerCase() === 'conforme') {
      powerStats[pv.power].conforme++;
    } else {
      powerStats[pv.power].nonConforme++;
    }
  });

  const result = Object.keys(powerStats).map(power => {
    const stats = powerStats[power];
    return {
      power: parseFloat(power),
      ...stats,
      conformityRate: stats.total > 0 ? (stats.conforme / stats.total) * 100 : 0,
    };
  });

  result.sort((a, b) => b.conformityRate - a.conformityRate);

  return result;
}

async function getConformityTrend(query) {
  const { period = 'month', from, to } = query;

  const where = {};
  if (from || to) {
    const dateWhere = {};
    if (from) {
      const d = new Date(from);
      if (!Number.isNaN(d.getTime())) dateWhere.gte = d;
    }
    if (to) {
      const d = new Date(to);
      if (!Number.isNaN(d.getTime())) {
        d.setUTCHours(23, 59, 59, 999);
        dateWhere.lte = d;
      }
    }
    if (Object.keys(dateWhere).length) where.date = dateWhere;
  }

  const allPvs = await prisma.pvEssai.findMany({
    where,
    select: {
      date: true,
      conformite: true,
    },
  });

  const trendData = {};

  allPvs.forEach(pv => {
    if (!pv.date) return;

    const date = new Date(pv.date);
    let key;

    if (period === 'year') {
      key = date.getFullYear().toString();
    } else if (period === 'day') {
      key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    } else { // default to month
      key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    }

    if (!trendData[key]) {
      trendData[key] = {
        total: 0,
        conforme: 0,
        nonConforme: 0,
        nonConformeTypes: {},
      };
    }

    trendData[key].total++;
    if (pv.conformite && pv.conformite.toLowerCase() === 'conforme') {
      trendData[key].conforme++;
    } else {
      trendData[key].nonConforme++;
      if (pv.conformite) {
        const reasons = pv.conformite.toLowerCase().replace('non conforme', '').trim().split(/[&,]/);
        reasons.forEach(reason => {
          const trimmed = reason.trim();
          if (trimmed) {
            trendData[key].nonConformeTypes[trimmed] = (trendData[key].nonConformeTypes[trimmed] || 0) + 1;
          }
        });
      }
    }
  });

  const result = Object.keys(trendData).sort().map(key => {
    const stats = trendData[key];
    return {
      period: key,
      ...stats,
      conformityRate: stats.total > 0 ? (stats.conforme / stats.total) * 100 : 0,
    };
  });

  return result;
}

module.exports = { createPv, listPv, enrichPv, getPvById, updatePv, getPvStats, getAvailableMonths, deletePv, refreshAllPvsConformity, getConformityByPower, getConformityTrend };