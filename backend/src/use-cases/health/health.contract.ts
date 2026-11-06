import { z } from 'zod';

export const HealthSchema = z.object({ status: z.literal('ok') });

export type HealthContract = z.infer<typeof HealthSchema>;
