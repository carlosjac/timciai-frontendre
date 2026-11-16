import dayjs, { type Dayjs } from 'dayjs';

const MAX_ANCHOR_STEPS = 240;
const PREVIEW_LIMIT = 12;

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function addMonthsKeepingDay(originIso: string, months: number, dayOfMonth: number): string {
  const origin = dayjs(originIso);
  const total = origin.year() * 12 + origin.month() + months;
  const year = Math.floor(total / 12);
  const monthIndex = ((total % 12) + 12) % 12;
  const monthStart = dayjs(`${year}-${pad(monthIndex + 1)}-01`);
  const day = Math.min(Math.max(dayOfMonth, 1), monthStart.daysInMonth());

  return monthStart.date(day).format('YYYY-MM-DD');
}

function anchorAt(startsOn: string, intervalMonths: number, index: number): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startsOn)) return null;
  if (!Number.isInteger(intervalMonths) || intervalMonths < 1) return null;

  return addMonthsKeepingDay(startsOn, index * intervalMonths, dayjs(startsOn).date());
}

export function subscriptionAnchorInMonth(
  startsOn: string | undefined,
  intervalMonths: number | undefined,
  endsOn: string | null | undefined,
  month: Dayjs,
): string | null {
  if (!startsOn || intervalMonths == null) return null;
  const start = dayjs(startsOn);
  if (!start.isValid()) return null;
  const delta = month.year() * 12 + month.month() - (start.year() * 12 + start.month());
  if (delta < 0 || delta % intervalMonths !== 0) return null;
  const anchor = anchorAt(startsOn, intervalMonths, delta / intervalMonths);
  if (!anchor) return null;
  if (endsOn && anchor > endsOn) return null;

  return anchor;
}

export function lineBillingPreview(input: {
  startsOn: string | undefined;
  intervalMonths: number | undefined;
  endsOn: string | null | undefined;
  lineStartsOn: string | null | undefined;
  lineEndsOn: string | null | undefined;
}): { dates: string[]; continues: boolean } {
  const dates: string[] = [];
  if (!input.startsOn || input.intervalMonths == null) return { dates, continues: false };
  let continues = false;
  for (let index = 0; index < MAX_ANCHOR_STEPS; index += 1) {
    const anchor = anchorAt(input.startsOn, input.intervalMonths, index);
    if (!anchor) break;
    if (input.endsOn && anchor > input.endsOn) break;
    if (input.lineEndsOn && anchor > input.lineEndsOn) break;
    if (input.lineStartsOn && anchor < input.lineStartsOn) continue;
    if (dates.length === PREVIEW_LIMIT) {
      continues = true;
      break;
    }
    dates.push(anchor);
  }

  return { dates, continues };
}

export const emptySubscriptionLine = {
  quantity: '1',
  description: '',
  discountPercent: '0',
  includeSellableItemName: true,
  includeDescription: true,
  includePeriod: true,
};

export function lineExtrasDiffer(line: {
  description?: string | null;
  discountPercent?: string | number | null;
  startsOn?: string | null;
  endsOn?: string | null;
  includeSellableItemName?: boolean;
  includeDescription?: boolean;
  includePeriod?: boolean;
} | null | undefined): boolean {
  if (!line) return false;
  const description = (line.description ?? '').trim();
  const discount = String(line.discountPercent ?? '0').trim();
  const discountIsZero = discount === '' || Number(discount) === 0;

  return (
    description !== '' ||
    !discountIsZero ||
    Boolean(line.startsOn) ||
    Boolean(line.endsOn) ||
    line.includeSellableItemName === false ||
    line.includeDescription === false ||
    line.includePeriod === false
  );
}

export function normalizeSubscriptionLines(lines: unknown): unknown {
  if (!Array.isArray(lines)) return lines;

  return lines.map((line) => {
    const row = (line ?? {}) as Record<string, unknown>;
    const description = typeof row.description === 'string' ? row.description.trim() : '';
    const discount =
      row.discountPercent == null || String(row.discountPercent).trim() === ''
        ? '0'
        : String(row.discountPercent);

    return {
      sellableItemId: row.sellableItemId,
      quantity: row.quantity == null || row.quantity === '' ? '1' : String(row.quantity),
      description: description || null,
      discountPercent: discount,
      startsOn: row.startsOn || null,
      endsOn: row.endsOn || null,
      includeSellableItemName: row.includeSellableItemName !== false,
      includeDescription: row.includeDescription !== false,
      includePeriod: row.includePeriod !== false,
    };
  });
}
