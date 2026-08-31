import {
  getWorkDatesForDuration,
  isWeekendDate,
  nextWeekdayOnOrAfter,
} from '../src/utils/schedule/scheduleHelpers';

describe('monthly weekday helpers', () => {
  it('skips Sat/Sun when picking next weekday', () => {
    // 2026-08-08 is Saturday
    const next = nextWeekdayOnOrAfter(new Date(2026, 7, 8, 12, 0, 0));
    expect(next.getDay()).toBe(1); // Monday
    expect(isWeekendDate(next)).toBe(false);
  });

  it('generates only Mon–Fri within a 30-day monthly window', () => {
    // Start Tuesday 2026-08-11
    const dates = getWorkDatesForDuration(new Date(2026, 7, 11, 12, 0, 0), 30);
    expect(dates.length).toBeGreaterThan(15);
    expect(dates.every(d => !isWeekendDate(d))).toBe(true);
    expect(dates[0].getDate()).toBe(11);
  });
});
