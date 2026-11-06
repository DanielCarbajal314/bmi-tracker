import { z } from 'zod';
import { ParticipantSchema } from '../participant.contract';

export const ListParticipantsSchema = z
  .object({
    minBmi: z.coerce.number().min(0).optional(),
    maxBmi: z.coerce.number().min(0).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .refine(
    ({ minBmi, maxBmi }) => minBmi === undefined || maxBmi === undefined || minBmi <= maxBmi,
    { path: ['minBmi'], message: 'minBmi must not be greater than maxBmi' },
  );

export type ListParticipantsInput = z.infer<typeof ListParticipantsSchema>;

export const ParticipantPageSchema = z.object({
  items: z.array(ParticipantSchema),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
  totalPages: z.number().int(),
});

export type ParticipantPageContract = z.infer<typeof ParticipantPageSchema>;
