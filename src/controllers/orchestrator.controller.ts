import 'reflect-metadata';
import * as vscode from 'vscode';
import { inject, injectable } from 'inversify';
import { OrchestratorService } from '@services/orchestrator.service';
import { OrchestratorSchema } from '@models/orchestrator.model';
import { TaskManagerSchema } from '@models/taskManager.model';
import { TaskManagerService } from '@services/taskManager.service';
import { orchestratorXmlFormat } from '@constants/orchestrator.constant';
import { taskManagerXmlFormat } from '@constants/taskManager.constant';

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
    const validationResult = OrchestratorSchema.safeParse(request.prompt);

    if (!validationResult.success) {
        stream.markdown(`Validation error: ${validationResult.error.message}\n\nPlease provide XML in the format:\n${orchestratorXmlFormat}`);
        return stream;
    }

    const orchestratorResult = await this._orchestratorService.createOrchestratorAsync(validationResult.data, stream, token);

    const taskManagerValidationResult = TaskManagerSchema.safeParse(orchestratorResult);

    if (!taskManagerValidationResult.success) {
        stream.markdown(`Validation error: ${taskManagerValidationResult.error.message}\n\nPlease provide XML in the format:\n${taskManagerXmlFormat}`);
        return stream;
    }

    return this._taskManagerService.createTasksAsync(taskManagerValidationResult.data, stream, token);
  }
}
