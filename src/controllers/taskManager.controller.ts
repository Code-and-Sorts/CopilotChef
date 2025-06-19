import 'reflect-metadata';
import * as vscode from 'vscode';
import { TaskManagerSchema } from '@models/taskManager.model';
import { TaskManagerService } from '@services/taskManager.service';
import { inject, injectable } from 'inversify';

@injectable()
export class TaskManagerController {
  constructor(
    @inject(TaskManagerService) private readonly _orchestratorService: TaskManagerService,
  ) {}

  async createTasksAsync(
    request: vscode.ChatRequest,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken,
  ) {
    const validationResult = TaskManagerSchema.safeParse(request.prompt);

    if (!validationResult.success) {
        stream.markdown(`Validation error: ${JSON.stringify(validationResult.error.errors)}\n\nPlease provide JSON in the format:\n\`\`\`json\n{\n  "tasks": [\n    {\n      "name": "Task 1",\n      "prompt": "Task 1 description"\n    },\n    {\n      "name": "Task 2",\n      "prompt": "Task 2 description"\n    }\n  ],\n  "system": "Optional system prompt",\n  "modelType": "gpt-4o"\n}\n\`\`\``);
        return stream;
    }

    return this._orchestratorService.createTasksAsync(validationResult.data, stream, token);
  }
}
