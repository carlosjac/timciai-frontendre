/**
 * Pure CSV helpers — no React / Refine.
 */

/** Excel/LibreOffice treat a leading = + - @ (after whitespace or C0 controls) as a formula. */
function neutralizeSpreadsheetFormula(value: string): string {
  let index = 0;
  while (index < value.length) {
    const code = value.charCodeAt(index);
    const isSpace = code === 0x20;
    const isControl = code <= 0x1f || code === 0x7f;
    if (!isSpace && !isControl) break;
    index += 1;
  }
  if (index >= value.length) return value;
  const first = value[index];
  if (first === '=' || first === '+' || first === '-' || first === '@') {
    return `'${value}`;
  }
  return value;
}

function escapeCsvCell(value: string): string {
  const safe = neutralizeSpreadsheetFormula(value);
  if (safe.includes('"') || safe.includes(',') || safe.includes('\n') || safe.includes('\r')) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
}

export type CsvColumn<T> = {
  header: string;
  accessor: (row: T) => string;
};

export function rowsToCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const headerLine = columns.map((c) => escapeCsvCell(c.header)).join(',');
  const lines = rows.map((row) =>
    columns.map((c) => escapeCsvCell(c.accessor(row))).join(','),
  );
  return [headerLine, ...lines].join('\r\n');
}

export function downloadTextFile(filename: string, content: string, mime = 'text/csv;charset=utf-8'): void {
  const blob = new Blob([`\uFEFF${content}`], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
