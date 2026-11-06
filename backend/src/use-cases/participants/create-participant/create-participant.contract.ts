import { z } from 'zod';
import { UnitSystemSchema } from '../participant.contract';
import { MEASUREMENT_LIMITS } from './constants/measurement-limits';

const PHONE_PATTERN = /^\+?[0-9 ()\-.]{7,30}$/;

export const CreateParticipantSchema = z
  .object({
    firstName: z.string().trim().min(1).max(100),
    lastName: z.string().trim().min(1).max(100),
    email: z.email().max(255),
    phone: z.string().trim().regex(PHONE_PATTERN, 'invalid phone number'),
    unitPicked: UnitSystemSchema,
    weight: z.number().positive(),
    height: z.number().positive(),
    age: z.number().int().min(0).max(120),
  })
  .superRefine((input, context) => {
    const limits = MEASUREMENT_LIMITS[input.unitPicked];
    for (const field of ['weight', 'height'] as const) {
      const { min, max, unit } = limits[field];
      if (input[field] < min || input[field] > max) {
        context.addIssue({
          code: 'custom',
          path: [field],
          message: `${field} must be between ${min} and ${max} ${unit}`,
        });
      }
    }
  });

export type CreateParticipantInput = z.infer<typeof CreateParticipantSchema>;
