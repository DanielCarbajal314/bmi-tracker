import type { UseFormReturn } from 'react-hook-form';
import type { CreateParticipantInput, UnitSystem } from '../../../../../apis/participant.contract';

export type MeasurementFieldsProps = {
  form: UseFormReturn<CreateParticipantInput>;
  unitSystem: UnitSystem;
  onUnitSystemChange: (unitSystem: UnitSystem) => void;
};
