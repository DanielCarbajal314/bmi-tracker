import type { UnitSystem } from '../../../../../apis/participant.contract';

export type UnitSystemToggleProps = {
  value: UnitSystem;
  onChange: (value: UnitSystem) => void;
};
