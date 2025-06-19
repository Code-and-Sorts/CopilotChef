import * as vscode from 'vscode';
import { TaskManagerType } from '@models/taskManager.model';

export class TaskManagerService {
  async createTasksAsync(
    data: TaskManagerType,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken,
  ): Promise<vscode.ChatResponseStream> {
    const { system, tasks, modelType } = data;

    const [model] = await vscode.lm.selectChatModels({ vendor: 'copilot', family: modelType });
    if (!model) {
        stream.markdown("I couldn't find a suitable language model. Please make sure GitHub Copilot Chat is installed and enabled.");
        return stream;
    }

    if (tasks.length === 0) {
        stream.markdown('No tasks were provided in the XML. Please include at least one task.');
        return stream;
    }

    stream.markdown('## 🔄 Running multiple agents for tasks based on XML input...\n\n');

    const agentPromises = tasks.map(async (task) => {
        try {
            const messages = [];
            const prompt = system ? `<system-prompt>${system}</system-prompt>\n\n${task.prompt}` : task.prompt;

            messages.push(vscode.LanguageModelChatMessage.User(prompt));

            const response = await model.sendRequest(messages, {}, token);

            let result = '';
            for await (const fragment of response.text) {
                result += fragment;
            }

            return { name: task.name, prompt: task.prompt, result };
        } catch (error) {
            return {
                name: task.name,
                prompt: task.prompt,
                result: `Error: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    });

    const results = await Promise.all(agentPromises);

    stream.markdown('## 🔄 Task Results\n\n');

    for (const result of results) {
        stream.markdown(`### ${result.name}\n**Prompt:** ${result.prompt}\n\n**Result:**\n${result.result}\n\n`);
    }

    return stream;
  }
}
