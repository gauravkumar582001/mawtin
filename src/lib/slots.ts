// Mirror of apps/api/src/viewings/slots.ts, used for demo mode and optimistic UI.
import type { AvailabilityDay, Slot } from './types';

export const SLOT_TIMES = ['09:00', '10:30', '12:00', '16:00', '17:30', '19:00'] as const;
const CLOSED_WEEKDAYS = [5]; // Friday
const LEAD_TIME_MIN = 120;

export function muscatToday(now = new Date()): string {
  return new Date(now.getTime() + 4 * 3_600_000).toISOString().slice(0, 10);
}

export function addDays(date: string, n: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function buildSlots(date: string, durationMin = 45, now = new Date()): Slot[] {
  const closed = CLOSED_WEEKDAYS.includes(new Date(`${date}T12:00:00Z`).getUTCDay());
  return SLOT_TIMES.map((time) => {
    const start = new Date(`${date}T${time}:00+04:00`);
    const end = new Date(start.getTime() + durationMin * 60_000);
    return {
      time,
      startsAt: start.toISOString(),
      endsAt: end.toISOString(),
      available: !closed && start.getTime() >= now.getTime() + LEAD_TIME_MIN * 60_000,
    };
  });
}

export function demoAvailability(days = 7): AvailabilityDay[] {
  const from = addDays(muscatToday(), 1);
  return Array.from({ length: days }, (_, i) => {
    const date = addDays(from, i);
    // Pretend a couple of slots are already booked so the UI shows both states.
    const slots = buildSlots(date).map((s, j) => ((i + j) % 5 === 3 ? { ...s, available: false } : s));
    return { date, slots };
  });
}
