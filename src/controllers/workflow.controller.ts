import { WorkflowTaskSchema } from '@models/workflowTask.model';
import { WorkflowService } from '@services/workflow.service';
import { workflowXmlFormat } from '@constants/workflow.constant';
import { inject, injectable } from 'inversify';
import * as vscode from 'vscode';

@injectable()
export class WorkflowController {
    constructor(
        @inject(WorkflowService) private readonly _workflowService: WorkflowService,
      ) {}

    async createWorkflowAsync(
        request: vscode.ChatRequest,
        stream: vscode.ChatResponseStream,
        token: vscode.CancellationToken,
    ): Promise<vscode.ChatResponseStream> {
        const validationResult = WorkflowTaskSchema.safeParse(request.prompt);

        if (!validationResult.success) {
            stream.markdown(`Validation error: ${validationResult.error.message}\n\nPlease provide XML in the format:\n${workflowXmlFormat}`);
            return stream;
        }

        return this._workflowService.createWorkflowAsync(validationResult.data, stream, token);
    }
}
