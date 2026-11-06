import type { UnitSystem } from '../../apis/participant.contract';
import { KG_PER_LB, M_PER_IN } from './constants/unit-conversion';

const round = (value: number): number => Math.round(value * 100) / 100;

export function convertWeight(value: number, from: UnitSystem, to: UnitSystem): number {
  if (from === to) return value;
  return round(to === 'metric' ? value * KG_PER_LB : value / KG_PER_LB);
}

export function convertHeight(value: number, from: UnitSystem, to: UnitSystem): number {
  if (from === to) return value;
  return round(to === 'metric' ? value * M_PER_IN : value / M_PER_IN);
}
