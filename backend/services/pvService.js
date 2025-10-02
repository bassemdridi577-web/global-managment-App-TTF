const prisma = require('../lib/prismaClient');

function buildSource(payload) {
  console.log('buildSource payload:', JSON.stringify(payload, null, 2));
  const source = { ...(payload || {}), ...(payload && payload.info ? payload.info : {}) };
  if (source.info) delete source.info;
  delete source.colonne;
  console.log('buildSource result:', JSON.stringify(source, null, 2));
  console.log('Operateur in source:', source.operateur);
  
  return source;
}

function calculateConformite(payload) {
  if (payload.short_circuit_test && payload.short_circuit_test.resultat) {
    const resultat = payload.short_circuit_test.resultat.toLowerCase();
    if (resultat === 'non conforme pcc') {
      return 'non conforme pcc';
    }
    if (resultat === 'non conforme ucc') {
      return 'non conforme ucc';
    }
  }

  const nonConformites = new Set();

  const addNonConformite = (value) => {
    if (value && typeof value === 'string' && value.toLowerCase().includes('non conforme')) {
      nonConformites.add(value);
    }
  };

  try {
    if (payload.voltage_ratio && Array.isArray(payload.voltage_ratio.conclusions)) {
      payload.voltage_ratio.conclusions.forEach(addNonConformite);
    }

    if (payload.no_load_test && Array.isArray(payload.no_load_test)) {
      payload.no_load_test.forEach(test => addNonConformite(test.conclusion));
    }

    if (payload.short_circuit_test) {
      addNonConformite(payload.short_circuit_test.resultat);
    }

    if (payload.dielectric_test) {
      addNonConformite(payload.dielectric_test.spires?.resultat);
      addNonConformite(payload.dielectric_test.htbt?.resultat);
      addNonConformite(payload.dielectric_test.btht?.resultat);
    }
  } catch (error) {
    console.error('Error calculating conformite:', error);
    return 'non conforme';
  }

  if (nonConformites.size === 1) {
    return Array.from(nonConformites)[0];
  }

  if (nonConformites.size > 1) {
    return 'non conforme';
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

async function createPv(payload) {
  console.log('Backend received payload:', JSON.stringify(payload, null, 2));
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

  delete dataToSave.colonne;

  const pvEssai = await prisma.pvEssai.create({ data: dataToSave });
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

  delete dataToSave.colonne;

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
    sort
  } = query || {};

  const pageInt = Math.max(1, parseInt(String(page)) || 1);
  const limitInt = Math.max(1, Math.min(1000, parseInt(String(limit)) || 25));
  const skip = (pageInt - 1) * limitInt;

  const where = {};
  const AND = [];

  if (search) {
    const s = String(search);
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
  if (!id) throw new Error('Missing id');
  const pv = await prisma.pvEssai.findUnique({ where: { id: Number(id) } });
  if (!pv) throw new Error('PvEssai not found');
  return pv;
}

async function getPvStats(query) {
  const { month, day } = query || {};

  const where = {};
  if (month) {
    const year = parseInt(month.split('-')[0], 10);
    const monthInt = parseInt(month.split('-')[1], 10) - 1; // month is 0-indexed in JS Date

    if (!isNaN(year) && !isNaN(monthInt)) {
      const startDate = new Date(Date.UTC(year, monthInt, 1));
      let endDate = new Date(Date.UTC(year, monthInt + 1, 1));
      
      if (day) {
        const dayInt = parseInt(day, 10);
        if(!isNaN(dayInt)) {
            startDate.setUTCDate(dayInt);
            endDate = new Date(Date.UTC(year, monthInt, dayInt + 1));
        }
      }

      where.date = {
        gte: startDate,
        lt: endDate,
      };
    }
  }

  const stats = await prisma.pvEssai.groupBy({
    by: ['conformite'],
    _count: {
      conformite: true,
    },
    where,
  });

  let conformeCount = 0;
  let nonConformeCount = 0;
  let nonConformePccCount = 0;
  let nonConformeUccCount = 0;

  stats.forEach(stat => {
    const count = stat._count.conformite;
    switch (stat.conformite) {
      case 'conforme':
        conformeCount = count;
        break;
      case 'non conforme':
        nonConformeCount = count;
        break;
      case 'non conforme pcc':
        nonConformePccCount = count;
        break;
      case 'non conforme ucc':
        nonConformeUccCount = count;
        break;
      default:
        break;
    }
  });

  return {
    conformeCount,
    nonConformeCount,
    nonConformePccCount,
    nonConformeUccCount,
  };
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

module.exports = { createPv, listPv, enrichPv, getPvById, updatePv, getPvStats, getAvailableMonths };