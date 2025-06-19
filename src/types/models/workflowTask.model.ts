import { z } from 'zod';

export const WorkflowTaskSchema = z.object({
    system: z.string().optional(),
    modelType: z.string().default('gpt-4o'),
    tasks: z.array(z.object({
        name: z.string().min(1, 'Task name cannot be empty'),
        prompt: z.string().min(1, 'Task prompt cannot be empty'),
        approvalGate: z.object({
            isEnabled: z.boolean().default(false),
            message: z.string().optional(),
        }).optional(),
    })),
});

export type WorkflowTaskType = z.infer<typeof WorkflowTaskSchema>;
