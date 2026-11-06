import { z } from 'zod';

export const UnitSystemSchema = z.enum(['imperial', 'metric']);

export const ParticipantSchema = z.object({
  id: z.number().int(),
  firstName: z.string(),
  email: z.string(),
  phone: z.string(),
  unitPicked: UnitSystemSchema,
  weightInLbs: z.number(),
  weightInKilos: z.number(),
  heightInInches: z.number(),
  heightInMeters: z.number(),
  bmi: z.number(),
  birthday: z.iso.datetime(),
  creationDate: z.iso.datetime(),
});

export type ParticipantContract = z.infer<typeof ParticipantSchema>;
