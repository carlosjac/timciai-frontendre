import { describe, expect, it } from 'vitest';
import { rowsToCsv } from './csv-export.js';

describe('rowsToCsv', () => {
  it('builds header and rows with CRLF', () => {
    const csv = rowsToCsv(
      [
        { name: 'Ada', note: 'ok' },
        { name: 'Bob', note: 'a,b' },
      ],
      [
        { header: 'Name', accessor: (r) => r.name },
        { header: 'Note', accessor: (r) => r.note },
      ],
    );
    expect(csv).toBe('Name,Note\r\nAda,ok\r\nBob,"a,b"');
  });

  it('escapes quotes', () => {
    const csv = rowsToCsv([{ q: 'say "hi"' }], [
      { header: 'Q', accessor: (r) => r.q },
    ]);
    expect(csv).toBe('Q\r\n"say ""hi"""');
  });
});
