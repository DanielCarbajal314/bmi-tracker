import { z } from 'zod';
import { MEASUREMENT_LIMITS } from '../constants/measurement-limits';
import { UNIT_SYSTEMS } from '../constants/unit-systems';

const PHONE_PATTERN = /^\+?[0-9 ()\-.]{7,30}$/;

const requiredText = (max: number) =>
  z.string().trim().min(1, 'Required').max(max, `At most ${max} characters`);

export const UnitSystemSchema = z.enum(['imperial', 'metric']);

export type UnitSystem = z.infer<typeof UnitSystemSchema>;

export const CreateParticipantSchema = z
  .object({
    firstName: requiredText(100),
    lastName: requiredText(100),
    email: z.email('Enter a valid email').max(255, 'At most 255 characters'),
    phone: z.string().trim().regex(PHONE_PATTERN, 'Enter a valid phone number'),
    unitPicked: UnitSystemSchema,
    weight: z.number({ error: 'Enter a number' }).positive('Must be positive'),
    height: z.number({ error: 'Enter a number' }).positive('Must be positive'),
    age: z
      .number({ error: 'Enter a whole number' })
      .int('Enter a whole number')
      .min(0, 'Must be 0 or more')
      .max(120, 'Must be 120 or less'),
  })
  .superRefine((input, context) => {
    const limits = MEASUREMENT_LIMITS[input.unitPicked];
    const units = UNIT_SYSTEMS[input.unitPicked];
    const fields = [
      { name: 'weight', unit: units.weightUnit },
      { name: 'height', unit: units.heightUnit },
    ] as const;
    for (const { name, unit } of fields) {
      const { min, max } = limits[name];
      if (input[name] < min || input[name] > max) {
        context.addIssue({
          code: 'custom',
          path: [name],
          message: `Must be between ${min} and ${max} ${unit}`,
        });
      }
    }
  });

export type CreateParticipantInput = z.infer<typeof CreateParticipantSchema>;

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

export type Participant = z.infer<typeof ParticipantSchema>;

export const ParticipantPageSchema = z.object({
  items: z.array(ParticipantSchema),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
  totalPages: z.number().int(),
});

export type ParticipantPage = z.infer<typeof ParticipantPageSchema>;

export const ListParticipantsParamsSchema = z.object({
  minBmi: z.number().optional(),
  maxBmi: z.number().optional(),
  page: z.number().int(),
  limit: z.number().int(),
});

export type ListParticipantsParams = z.infer<typeof ListParticipantsParamsSchema>;
