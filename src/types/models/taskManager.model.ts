import { z } from 'zod';

export const TaskManagerSchema = z.object({
    system: z.string().optional(),
    modelType: z.string().default('gpt-4o'),
    tasks: z.array(z.object({
        name: z.string().min(1, 'Task name cannot be empty'),
        prompt: z.string().min(1, 'Task prompt cannot be empty'),
    })).min(1, 'At least one task is required'),
});

export type TaskManagerType = z.infer<typeof TaskManagerSchema>;
