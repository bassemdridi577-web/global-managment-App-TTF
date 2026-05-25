export const BCT_COURS_URL = 'https://www.bct.gov.tn/bct/siteprod/cours.jsp';

export const getTodayIsoDate = () => new Date().toISOString().split('T')[0];

export const parseInputNumber = (value) => {
  if (value === '' || value === null || value === undefined) return 0;
  const normalized = String(value).replace(',', '.');
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const computeUnitPrice = (euroRate, priceEuro, priceDinar) => {
  if (euroRate === null || euroRate === undefined) return 0;
  return (euroRate * parseInputNumber(priceEuro)) + parseInputNumber(priceDinar);
};

export const numberToFrenchWords = (num) => {
  if (num === 0) return 'zéro dinar';

  const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
  const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
  const tens = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];

  const convertUnder1000 = (n) => {
    let words = '';
    if (n >= 100) {
      const hundreds = Math.floor(n / 100);
      if (hundreds === 1) {
        words += 'cent ';
      } else {
        words += units[hundreds] + ' cent ';
      }
      n %= 100;
    }
    if (n >= 20) {
      const ten = Math.floor(n / 10);
      const unit = n % 10;
      if (ten === 7 || ten === 9) {
        words += tens[ten - 1] + '-';
        words += teens[unit] + ' ';
      } else {
        words += tens[ten] + ' ';
        if (unit > 0) {
          if (unit === 1 && ten !== 8) {
            words += 'et un ';
          } else {
            words += units[unit] + ' ';
          }
        }
      }
    } else if (n >= 10) {
      words += teens[n - 10] + ' ';
    } else if (n > 0) {
      words += units[n] + ' ';
    }
    return words.trim();
  };

  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 1000); // 3 decimals for millimes

  let result = '';
  let temp = integerPart;

  if (temp >= 1000000) {
    const millions = Math.floor(temp / 1000000);
    result += convertUnder1000(millions) + ' million' + (millions > 1 ? 's' : '') + ' ';
    temp %= 1000000;
  }
  if (temp >= 1000) {
    const thousands = Math.floor(temp / 1000);
    if (thousands === 1) {
      result += 'mille ';
    } else {
      result += convertUnder1000(thousands) + ' mille ';
    }
    temp %= 1000;
  }
  if (temp > 0) {
    result += convertUnder1000(temp) + ' ';
  }

  result = result.trim() + ' dinar' + (integerPart > 1 ? 's' : '');

  if (decimalPart > 0) {
    result += ' et ' + convertUnder1000(decimalPart) + ' millime' + (decimalPart > 1 ? 's' : '');
  }

  return result.charAt(0).toUpperCase() + result.slice(1);
};

export const calculateInvoiceTotals = (invoiceRows, taxConfig) => {
  let subtotalHT = 0;
  invoiceRows.forEach(row => {
    subtotalHT += parseInputNumber(row.quantity) * parseInputNumber(row.unitPrice);
  });

  const tvaAmount = subtotalHT * (taxConfig.tvaRate / 100);
  const subtotalTTC = subtotalHT + tvaAmount;

  const retenueSourceAmount = subtotalTTC * 0.01;
  const deductionTvaAmount = tvaAmount * 0.25;

  const totalTTC = subtotalTTC - retenueSourceAmount - deductionTvaAmount;

  return {
    subtotalHT,
    tvaAmount,
    subtotalTTC,
    retenueSourceAmount,
    deductionTvaAmount,
    totalTTC
  };
};
