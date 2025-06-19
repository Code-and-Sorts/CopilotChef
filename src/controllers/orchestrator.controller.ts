import 'reflect-metadata';
import * as vscode from 'vscode';
import { inject, injectable } from 'inversify';
import { OrchestratorService } from '@services/orchestrator.service';
import { OrchestratorSchema } from '@models/orchestrator.model';
import { TaskManagerSchema } from '@models/taskManager.model';
import { TaskManagerService } from '@services/taskManager.service';

@injectable()
export class OrchestratorController {
  constructor(
    @inject(OrchestratorService) private readonly _orchestratorService: OrchestratorService,
    @inject(TaskManagerService) private readonly _taskManagerService: TaskManagerService,
  ) {}

  async createOrchestratorAsync(
    request: vscode.ChatRequest,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken,
  ) {
    let promptData;
    try {
      promptData = JSON.parse(request.prompt);
    } catch (error) {
      stream.markdown(`Error parsing JSON: ${error instanceof Error ? error.message : String(error)}\n\nPlease provide your input as text or in JSON format:\n\`\`\`json\n{\n  "prompt": "Your prompt here",\n  "modelType": "gpt-4o"\n}\n\`\`\`\nOr simply type your request after the /orchestrator command.`);
      return stream;
    }

    const validationResult = OrchestratorSchema.safeParse(promptData);

    if (!validationResult.success) {
        stream.markdown(`Validation error: ${JSON.stringify(validationResult.error.errors)}\n\nPlease provide your input as text or in JSON format:\n\`\`\`json\n{\n  "prompt": "Your prompt here",\n  "modelType": "gpt-4o"\n}\n\`\`\`\nOr simply type your request after the /orchestrator command.`);
        return stream;
    }

    const orchestratorResult = await this._orchestratorService.createOrchestratorAsync(validationResult.data, stream, token);

    const taskManagerValidationResult = TaskManagerSchema.safeParse(orchestratorResult);

    if (!taskManagerValidationResult.success) {
        stream.markdown(`Validation error: ${JSON.stringify(taskManagerValidationResult.error.errors)}\n\nThe orchestrator didn't return a valid task format. Please try again with a more specific request.`);
        return stream;
    }

    return this._taskManagerService.createTasksAsync(taskManagerValidationResult.data, stream, token);
  }
}
