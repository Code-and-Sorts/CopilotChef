import { injectable } from 'inversify';
import * as vscode from 'vscode';
import { WorkflowTaskType } from '@models/workflowTask.model';

@injectable()
export class WorkflowService {
    private approvalResolver: ((value: boolean) => void) | null = null;
    private static commandsRegistered = false;

    constructor() {
        if (!WorkflowService.commandsRegistered) {
            try {
                vscode.commands.registerCommand('workflow.approveTask', () => {
                    if (this.approvalResolver) {
                        this.approvalResolver(true);
                        this.approvalResolver = null;
                    }
                });

                vscode.commands.registerCommand('workflow.rejectTask', () => {
                    if (this.approvalResolver) {
                        this.approvalResolver(false);
                        this.approvalResolver = null;
                    }
                });

                WorkflowService.commandsRegistered = true;
            } catch (error) {
                console.log('Commands already registered:', error);
                WorkflowService.commandsRegistered = true;
            }
        }
    }

    async createWorkflowAsync(
        data: WorkflowTaskType,
        stream: vscode.ChatResponseStream,
        token: vscode.CancellationToken,
    ): Promise<vscode.ChatResponseStream> {
        const { system, tasks, modelType } = data;

        const [model] = await vscode.lm.selectChatModels({ vendor: 'copilot', family: modelType });
        if (!model) {
            stream.markdown('I couldn\'t find a suitable language model. Please make sure GitHub Copilot Chat is installed and enabled.');
            return stream;
        }

        stream.markdown('## 🧑‍🍳 Lets start cooking! 🍳\n\n');
        stream.markdown('## 🔄 Running workflow based on JSON input...\n\n');

        for (const task of tasks) {
            const taskIndex = tasks.indexOf(task);
            stream.markdown(`\n\n## Task ${taskIndex + 1}\n\n`);
            stream.markdown(`\n\n## ${task.name}\n\n`);
            const combinedPrompt = system ? `<system-prompt>${system}</system-prompt>\n\n${task.prompt}` : task.prompt;
            const result = await model.sendRequest([vscode.LanguageModelChatMessage.User(combinedPrompt)], {}, token);
            for await (const fragment of result.text) {
                stream.markdown(fragment);
            }

            if (task.approvalGate?.isEnabled) {
                const approvalMessage = task.approvalGate.message ?? `Do you approve the task ${task.name}?`;

                stream.markdown(`\n\n## Approval Required\n\n${approvalMessage}`);

                stream.button({
                    command: 'workflow.approveTask',
                    title: '✅ Yes'
                });

                stream.button({
                    command: 'workflow.rejectTask',
                    title: '❌ No'
                });

                const isApproved = await this.waitForApproval();

                if (isApproved && taskIndex !== tasks.length - 1) {
                    stream.markdown('\n\n✅ **Approved** - Continuing workflow');
                } else {
                    stream.markdown('\n\n❌ **Rejected** - Stopping workflow');
                    return stream;
                }
            }
        }
        stream.markdown('\n\n🌟 **Workflow completed!**\n\n');
        return stream;
    }

    private waitForApproval(): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            this.approvalResolver = resolve;
        });
    }
}
