import { z } from 'zod';

export const OrchestratorSchema = z.object({
    prompt: z.string().min(1, 'Prompt cannot be empty'),
    modelType: z.string().default('gpt-4o'),
});

export type OrchestratorType = z.infer<typeof OrchestratorSchema>;
