import 'reflect-metadata';
import * as vscode from 'vscode';
import { TaskManagerService } from '@services/taskManager.service';
import { TaskManagerType } from '@models/taskManager.model';

jest.mock('vscode', () => {
  const mockLanguageModelResponse = {
    text: (async function* () {
      yield 'Task response';
      yield ' continues here';
    })()
  };

  const mockLanguageModel = {
    sendRequest: jest.fn().mockResolvedValue(mockLanguageModelResponse)
  };

  return {
    ...jest.requireActual('vscode'),
    lm: {
      selectChatModels: jest.fn().mockResolvedValue([mockLanguageModel])
    },
    LanguageModelChatMessage: {
      User: jest.fn().mockImplementation((text) => ({ text, role: 'user' }))
    }
  };
});

describe('TaskManagerService', () => {
  let taskManagerService: TaskManagerService;
  let mockStream: jest.Mocked<vscode.ChatResponseStream>;
  let mockToken: vscode.CancellationToken;

  beforeEach(() => {
    jest.clearAllMocks();

    taskManagerService = new TaskManagerService();

    mockStream = {
      markdown: jest.fn().mockReturnThis()
    } as unknown as jest.Mocked<vscode.ChatResponseStream>;

    mockToken = {} as vscode.CancellationToken;
  });

  describe('createTasksAsync', () => {
    it('should process tasks successfully', async () => {
      const data: TaskManagerType = {
        system: 'System prompt',
        tasks: [
          { name: 'Task 1', prompt: 'Task 1 prompt' },
          { name: 'Task 2', prompt: 'Task 2 prompt' }
        ],
        modelType: 'gpt-4'
      };

      const result = await taskManagerService.createTasksAsync(data, mockStream, mockToken);

      expect(vscode.lm.selectChatModels).toHaveBeenCalledWith({ vendor: 'copilot', family: 'gpt-4' });
      expect(vscode.LanguageModelChatMessage.User).toHaveBeenCalledTimes(2);
      expect(vscode.LanguageModelChatMessage.User).toHaveBeenCalledWith('<system-prompt>System prompt</system-prompt>\n\nTask 1 prompt');
      expect(vscode.LanguageModelChatMessage.User).toHaveBeenCalledWith('<system-prompt>System prompt</system-prompt>\n\nTask 2 prompt');
      expect(mockStream.markdown).toHaveBeenCalledWith('## 🔄 Running multiple agents for tasks based on XML input...\n\n');
      expect(mockStream.markdown).toHaveBeenCalledWith('## 🔄 Task Results\n\n');
      expect(mockStream.markdown).toHaveBeenCalledWith(expect.stringContaining('### Task 1'));
      expect(mockStream.markdown).toHaveBeenCalledWith(expect.stringContaining('### Task 2'));
      expect(result).toBe(mockStream);
    });

    it('should handle tasks without system prompt', async () => {
      const data: TaskManagerType = {
        tasks: [
          { name: 'Task 1', prompt: 'Task 1 prompt' }
        ],
        modelType: 'gpt-4'
      };

      await taskManagerService.createTasksAsync(data, mockStream, mockToken);

      expect(vscode.LanguageModelChatMessage.User).toHaveBeenCalledWith('Task 1 prompt');
    });

    it('should return early when no language model is found', async () => {
      (vscode.lm.selectChatModels as jest.Mock).mockResolvedValueOnce([]);

      const data: TaskManagerType = {
        tasks: [{ name: 'Task 1', prompt: 'Task 1 prompt' }],
        modelType: 'gpt-4'
      };

      const result = await taskManagerService.createTasksAsync(data, mockStream, mockToken);

      expect(mockStream.markdown).toHaveBeenCalledWith("I couldn't find a suitable language model. Please make sure GitHub Copilot Chat is installed and enabled.");
      expect(result).toBe(mockStream);
    });

    it('should return early when no tasks are provided', async () => {
      const data: TaskManagerType = {
        tasks: [],
        modelType: 'gpt-4'
      };

      const result = await taskManagerService.createTasksAsync(data, mockStream, mockToken);

      expect(mockStream.markdown).toHaveBeenCalledWith('No tasks were provided in the XML. Please include at least one task.');
      expect(result).toBe(mockStream);
    });

    it('should handle errors in task execution', async () => {
      const mockError = new Error('Task execution failed');

      const errorModel = {
        sendRequest: jest.fn().mockRejectedValue(mockError)
      };

      (vscode.lm.selectChatModels as jest.Mock).mockResolvedValueOnce([errorModel]);

      const data: TaskManagerType = {
        tasks: [{ name: 'Task 1', prompt: 'Task 1 prompt' }],
        modelType: 'gpt-4'
      };

      await taskManagerService.createTasksAsync(data, mockStream, mockToken);

      expect(mockStream.markdown).toHaveBeenCalledWith(expect.stringContaining('Error: Task execution failed'));
    });
  });
});
