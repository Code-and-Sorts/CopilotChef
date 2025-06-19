import { WorkflowTaskSchema } from '@models/workflowTask.model';
import { WorkflowService } from '@services/workflow.service';
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
        let promptData;
    try {
      promptData = JSON.parse(request.prompt);
    } catch (error) {
      stream.markdown(`Error parsing JSON: ${error instanceof Error ? error.message : String(error)}\n\nPlease provide JSON in the format:\n\`\`\`json\n{\n  "tasks": [\n    {\n      "name": "Task 1",\n      "prompt": "Task 1 description",\n      "approvalGate": {\n        "isEnabled": true,\n        "message": "Task 1 message"\n      }\n    },\n    {\n      "name": "Task 2",\n      "prompt": "Task 2 description",\n      "approvalGate": {\n        "isEnabled": true,\n        "message": "Task 2 message"\n      }\n    }\n  ],\n  "system": "Optional system prompt"\n}\n\`\`\``);
      return stream;
    }

        const validationResult = WorkflowTaskSchema.safeParse(promptData);

        if (!validationResult.success) {
            stream.markdown(`Validation error: ${JSON.stringify(validationResult.error.errors)}\n\nPlease provide JSON in the format:\n\`\`\`json\n{\n  "tasks": [\n    {\n      "name": "Task 1",\n      "prompt": "Task 1 description",\n      "approvalGate": {\n        "isEnabled": true,\n        "message": "Task 1 message"\n      }\n    },\n    {\n      "name": "Task 2",\n      "prompt": "Task 2 description",\n      "approvalGate": {\n        "isEnabled": true,\n        "message": "Task 2 message"\n      }\n    }\n  ],\n  "system": "Optional system prompt"\n}\n\`\`\``);
            return stream;
        }

        return this._workflowService.createWorkflowAsync(validationResult.data, stream, token);
    }
}
