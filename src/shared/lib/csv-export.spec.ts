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

  it('neutralizes cells Excel would run as formulas', () => {
    const csv = rowsToCsv(
      [
        { v: '=HYPERLINK("http://evil")' },
        { v: '+1+1' },
        { v: '-1+1' },
        { v: '@SUM(1+1)' },
        { v: '\t=1+1' },
        { v: '\r=1' },
        { v: '  =1' },
        { v: 'Ada' },
      ],
      [{ header: 'V', accessor: (r) => r.v }],
    );
    expect(csv).toBe(
      [
        'V',
        '"\'=HYPERLINK(""http://evil"")"',
        "'+1+1",
        "'-1+1",
        "'@SUM(1+1)",
        "'\t=1+1",
        '"\'\r=1"',
        "'  =1",
        'Ada',
      ].join('\r\n'),
    );
  });
});
