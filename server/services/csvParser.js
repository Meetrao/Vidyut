const { parse } = require('csv-parse/sync');

/**
 * Parse a CSV buffer into an array of Usage-shaped objects.
 * Expected CSV columns (case-insensitive): date, units, cost, source
 */
function parseCSV(buffer) {
  const records = parse(buffer, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  return records.map((row) => {
    const date = new Date(row.date || row.Date);
    const units = parseFloat(row.units || row.Units || row['Units (kWh)'] || 0);
    const cost = parseFloat(row.cost || row.Cost || row['Cost (₹)'] || row['Cost (Rs)'] || 0);
    const source = row.source || row.Source || 'CSV';

    if (isNaN(date.getTime())) throw new Error(`Invalid date: "${row.date || row.Date}"`);
    if (isNaN(units)) throw new Error(`Invalid units value in row: ${JSON.stringify(row)}`);
    if (isNaN(cost)) throw new Error(`Invalid cost value in row: ${JSON.stringify(row)}`);

    return { date, units, cost, source };
  });
}

module.exports = { parseCSV };
