import 'reflect-metadata';
import * as vscode from 'vscode';
import { TaskManagerSchema } from '@models/taskManager.model';
import { TaskManagerService } from '@services/taskManager.service';
import { inject, injectable } from 'inversify';
import { taskManagerXmlFormat } from '@constants/taskManager.constant';

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
        stream.markdown(`Validation error: ${validationResult.error.message}\n\nPlease provide XML in the format:\n${taskManagerXmlFormat}`);
        return stream;
    }

    return this._orchestratorService.createTasksAsync(validationResult.data, stream, token);
  }
}
