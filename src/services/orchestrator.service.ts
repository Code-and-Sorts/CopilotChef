import * as vscode from 'vscode';
import { OrchestratorType } from '@models/orchestrator.model';

export class OrchestratorService {
  async createOrchestratorAsync(
    data: OrchestratorType,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken,
  ): Promise<string> {
    const { prompt, modelType } = data;

    const [model] = await vscode.lm.selectChatModels({ vendor: 'copilot', family: modelType });
    if (!model) {
        stream.markdown("I couldn't find a suitable language model. Please make sure GitHub Copilot Chat is installed and enabled.");
        throw new Error('No suitable language model found');
    }

    const taskPrompt = `
    Analyze this task and break it down into distinct tasks. Each task should be a single independent step that can be completed by a single agent.
    If the task it not clear or you are unable to break down the task into distinct tasks, return a single task.
    Add a system prompt to the tasks that describes the task and the tools that can be used to complete the task.

    Task: ${prompt}

    Return your response as valid JSON in this format:
    {
      "system": "A system prompt that describes the task and tools",
      "tasks": [
        {
          "name": "Task 1 name",
          "prompt": "Task 1 detailed description"
        },
        {
          "name": "Task 2 name",
          "prompt": "Task 2 detailed description"
        }
      ]
    }`;

    const messages = [];

    stream.markdown('## 🔄 Generating tasks...\n\n');

    messages.push(vscode.LanguageModelChatMessage.User(taskPrompt));

    const response = await model.sendRequest(messages, {}, token);

    stream.markdown('## 🔄 Task Results\n\n');

    let resultString = '';
    for await (const fragment of response.text) {
        stream.markdown(fragment);
        resultString += fragment;
    }

    return resultString;
  }
}
