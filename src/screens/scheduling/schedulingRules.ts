import { SchedulingDoc } from './types';

const ONE_HOUR_MS = 60 * 60 * 1000;

export function hasSchedulingConflict(
  candidateAt: number,
  existingMarked: SchedulingDoc[],
  ignoreId?: string
): boolean {
  return existingMarked.some((item) => {
    if (ignoreId && item.id === ignoreId) return false;
    if (item.status !== 'Marcado') return false;

    const delta = Math.abs(item.scheduledAt - candidateAt);
    return delta <= ONE_HOUR_MS;
  });
}

export function isOverduePending(item: SchedulingDoc, now = Date.now()): boolean {
  return item.status === 'Marcado' && item.scheduledAt < now;
}

export function isFutureMarked(item: SchedulingDoc, now = Date.now()): boolean {
  return item.status === 'Marcado' && item.scheduledAt >= now;
}