const BCT_ARCHIVE_URL = 'https://www.bct.gov.tn/bct/siteprod/cours_archiv.jsp';
const BCT_COURS_URL = 'https://www.bct.gov.tn/bct/siteprod/cours.jsp';
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const parseEuroRateFromHtml = (html) => {
  if (!html) return null;

  const rowMatch = html.match(
    /<tr[^>]*>[\s\S]*?<td scope=['"]col['"]>EUR<\/td>[\s\S]*?<\/tr>/i
  );

  if (!rowMatch) return null;

  const valueMatches = [...rowMatch[0].matchAll(/<div align=['"]right['"]>\s*([\d,\.\s]+)\s*<\/div>/gi)];
  if (!valueMatches.length) return null;

  const rawValue = valueMatches[valueMatches.length - 1][1].trim().replace(/\s/g, '').replace(',', '.');
  const value = Number.parseFloat(rawValue);
  return Number.isFinite(value) ? value : null;
};

const fetchHtml = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      Accept: 'text/html,application/xhtml+xml',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(`BCT request failed with status ${response.status}`);
  }

  return response.text();
};

const getEuroRateForDate = async (date) => {
  if (!DATE_REGEX.test(date)) {
    throw new Error('Invalid date format. Expected YYYY-MM-DD.');
  }

  const [yyyy, mm, dd] = date.split('-');
  const formattedDate = `${dd}/${mm}/${yyyy}`;

  const archiveHtml = await fetchHtml(BCT_ARCHIVE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `input=${encodeURIComponent(formattedDate)}&langue=`,
  });

  let rate = parseEuroRateFromHtml(archiveHtml);

  if (rate === null) {
    const currentHtml = await fetchHtml(BCT_COURS_URL);
    rate = parseEuroRateFromHtml(currentHtml);
  }

  if (rate === null) {
    throw new Error('EUR exchange rate not found for the selected date.');
  }

  return {
    date,
    currency: 'EUR',
    unit: 1,
    value: rate,
    source: BCT_ARCHIVE_URL,
  };
};

module.exports = {
  getEuroRateForDate,
};
