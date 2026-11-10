// Planted: terminal output. The table standard does not govern a console report.
export function printRows(rows) {
  console.log('NAME'.padEnd(20) + 'STATE');
  for (const row of rows) console.log(row.name.padEnd(20) + row.state);
}
