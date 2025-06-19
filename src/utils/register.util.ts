import container from '@config/inversify.config';
import { WorkflowController } from '@controllers/workflow.controller';
import { OrchestratorController } from '@controllers/orchestrator.controller';
import { TaskManagerController } from '@controllers/taskManager.controller';
import * as vscode from 'vscode';

export enum Commands {
    orchestrator = 'orchestrator',
    taskManager = 'taskManager',
    workflow = 'workflow',
}

export class Participant {
    constructor() {}

    async register(context: vscode.ExtensionContext) {
        const handler: vscode.ChatRequestHandler = async (
            request: vscode.ChatRequest,
            context: vscode.ChatContext,
            stream: vscode.ChatResponseStream,
            token: vscode.CancellationToken
        ) => {
            if (request.command === Commands.taskManager) {
                stream.progress('Processing JSON and orchestrating agents...');
                try {
                    const taskManagerController = container.get(TaskManagerController);
                    return await taskManagerController.createTasksAsync(request, stream, token);
                } catch (err) {
                    if (err instanceof vscode.LanguageModelError) {
                        console.log(err.message, err.code, err.cause);
                        stream.markdown(`I encountered an error: ${err.message}`);
                    } else {
                        console.error(err);
                        stream.markdown(`An unexpected error occurred: ${err instanceof Error ? err.message : String(err)}`);
                    }
                }

                return {};
            } else if (request.command === Commands.orchestrator) {
                stream.progress('Processing input and generating tasks...');
                try {
                    const orchestratorController = container.get(OrchestratorController);
                    return await orchestratorController.createOrchestratorAsync(request, stream, token);
                } catch (err) {
                    if (err instanceof vscode.LanguageModelError) {
                        console.log(err.message, err.code, err.cause);
                        stream.markdown(`I encountered an error: ${err.message}`);
                    } else {
                        console.error(err);
                        stream.markdown(`An unexpected error occurred: ${err instanceof Error ? err.message : String(err)}`);
                    }
                }

                return {};
            } else if (request.command === Commands.workflow) {
                stream.progress('Processing JSON and running workflow...');
                try {
                    const workflowController = container.get(WorkflowController);
                    return await workflowController.createWorkflowAsync(request, stream, token);
                } catch (err) {
                    if (err instanceof vscode.LanguageModelError) {
                        console.log(err.message, err.code, err.cause);
                        stream.markdown(`I encountered an error: ${err.message}`);
                    } else {
                        console.error(err);
                        stream.markdown(`An unexpected error occurred: ${err instanceof Error ? err.message : String(err)}`);
                    }
                }
            } else {
                throw new Error('Invalid command');
            }
        };

        const taskManager = vscode.chat.createChatParticipant('copilot-chef', handler);

        context.subscriptions.push(taskManager);
    }
}
