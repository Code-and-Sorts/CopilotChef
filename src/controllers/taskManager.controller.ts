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
    let promptData;
    try {
      promptData = JSON.parse(request.prompt);
    } catch (error) {
      stream.markdown(`Error parsing JSON: ${error instanceof Error ? error.message : String(error)}\n\nPlease provide valid JSON in the format:\n\`\`\`json\n{\n  "tasks": [\n    {\n      "name": "Task 1",\n      "prompt": "Task 1 description"\n    },\n    {\n      "name": "Task 2",\n      "prompt": "Task 2 description"\n    }\n  ],\n  "system": "Optional system prompt",\n  "modelType": "gpt-4o"\n}\n\`\`\``);
      return stream;
    }

    const validationResult = TaskManagerSchema.safeParse(promptData);

    if (!validationResult.success) {
        stream.markdown(`Validation error: ${JSON.stringify(validationResult.error.errors)}\n\nPlease provide JSON in the format:\n\`\`\`json\n{\n  "tasks": [\n    {\n      "name": "Task 1",\n      "prompt": "Task 1 description"\n    },\n    {\n      "name": "Task 2",\n      "prompt": "Task 2 description"\n    }\n  ],\n  "system": "Optional system prompt",\n  "modelType": "gpt-4o"\n}\n\`\`\``);
        return stream;
    }

    return this._orchestratorService.createTasksAsync(validationResult.data, stream, token);
  }
}
