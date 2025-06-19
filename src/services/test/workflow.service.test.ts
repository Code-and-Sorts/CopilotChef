import 'reflect-metadata';
import * as vscode from 'vscode';
import { WorkflowService } from '@services/workflow.service';
import { WorkflowTaskType } from '@models/workflowTask.model';

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

  const commandRegistrations: Record<string, () => void> = {};

  return {
    ...jest.requireActual('vscode'),
    lm: {
      selectChatModels: jest.fn().mockResolvedValue([mockLanguageModel])
    },
    LanguageModelChatMessage: {
      User: jest.fn().mockImplementation((text) => ({ text, role: 'user' }))
    },
    commands: {
      registerCommand: jest.fn().mockImplementation((command: string, callback: () => void) => {
        commandRegistrations[command] = callback;
        return { dispose: jest.fn() };
      }),
      executeCommand: jest.fn().mockImplementation((command: string) => {
        if (commandRegistrations[command]) {
          return commandRegistrations[command]();
        }
        return undefined;
      })
    }
  };
});

describe('WorkflowService', () => {
  let workflowService: WorkflowService;
  let mockStream: jest.Mocked<vscode.ChatResponseStream>;
  let mockToken: vscode.CancellationToken;

  beforeEach(() => {
    jest.clearAllMocks();

    workflowService = new WorkflowService();

    mockStream = {
      markdown: jest.fn().mockReturnThis(),
      button: jest.fn().mockReturnThis()
    } as unknown as jest.Mocked<vscode.ChatResponseStream>;

    mockToken = {} as vscode.CancellationToken;
  });

  describe('createWorkflowAsync', () => {
    it('should process workflow tasks without approval gates', async () => {
      const data: WorkflowTaskType = {
        system: 'System prompt',
        tasks: [
          { name: 'Task 1', prompt: 'Task 1 prompt' },
          { name: 'Task 2', prompt: 'Task 2 prompt' }
        ],
        modelType: 'gpt-4'
      };

      const result = await workflowService.createWorkflowAsync(data, mockStream, mockToken);

      expect(vscode.lm.selectChatModels).toHaveBeenCalledWith({ vendor: 'copilot', family: 'gpt-4' });
      expect(vscode.LanguageModelChatMessage.User).toHaveBeenCalledTimes(2);
      expect(vscode.LanguageModelChatMessage.User).toHaveBeenCalledWith('<system-prompt>System prompt</system-prompt>\n\nTask 1 prompt');
      expect(vscode.LanguageModelChatMessage.User).toHaveBeenCalledWith('<system-prompt>System prompt</system-prompt>\n\nTask 2 prompt');
      expect(mockStream.markdown).toHaveBeenCalledWith('## 🔄 Running workflow based on JSON input...\n\n');
      expect(mockStream.markdown).toHaveBeenCalledWith('\n\n🌟 **Workflow completed!**\n\n');
      expect(result).toBe(mockStream);
    });

    it('should handle tasks without system prompt', async () => {
      const data: WorkflowTaskType = {
        tasks: [
          { name: 'Task 1', prompt: 'Task 1 prompt' }
        ],
        modelType: 'gpt-4'
      };

      await workflowService.createWorkflowAsync(data, mockStream, mockToken);

      expect(vscode.LanguageModelChatMessage.User).toHaveBeenCalledWith('Task 1 prompt');
    });

    it('should return early when no language model is found', async () => {
      (vscode.lm.selectChatModels as jest.Mock).mockResolvedValueOnce([]);

      const data: WorkflowTaskType = {
        tasks: [{ name: 'Task 1', prompt: 'Task 1 prompt' }],
        modelType: 'gpt-4'
      };

      const result = await workflowService.createWorkflowAsync(data, mockStream, mockToken);

      expect(mockStream.markdown).toHaveBeenCalledWith('I couldn\'t find a suitable language model. Please make sure GitHub Copilot Chat is installed and enabled.');
      expect(result).toBe(mockStream);
    });

    it('should handle approval gates with approval', async () => {
      jest.spyOn(WorkflowService.prototype as any, 'waitForApproval').mockResolvedValue(true);

      const data: WorkflowTaskType = {
        tasks: [
          {
            name: 'Task 1',
            prompt: 'Task 1 prompt',
            approvalGate: {
              isEnabled: true,
              message: 'Approve Task 1?'
            }
          },
          { name: 'Task 2', prompt: 'Task 2 prompt' }
        ],
        modelType: 'gpt-4'
      };

      const result = await workflowService.createWorkflowAsync(data, mockStream, mockToken);

      expect(mockStream.button).toHaveBeenCalledTimes(2);
      expect(mockStream.markdown).toHaveBeenCalledWith(expect.stringContaining('## Approval Required'));
      expect(mockStream.markdown).toHaveBeenCalledWith(expect.stringContaining('Approve Task 1?'));
      expect(mockStream.markdown).toHaveBeenCalledWith('\n\n✅ **Approved** - Continuing workflow');
      expect(result).toBe(mockStream);
    });

    it('should handle approval gates with rejection', async () => {
      jest.spyOn(WorkflowService.prototype as any, 'waitForApproval').mockResolvedValue(false);

      const data: WorkflowTaskType = {
        tasks: [
          {
            name: 'Task 1',
            prompt: 'Task 1 prompt',
            approvalGate: {
              isEnabled: true
            }
          },
          { name: 'Task 2', prompt: 'Task 2 prompt' }
        ],
        modelType: 'gpt-4'
      };

      const result = await workflowService.createWorkflowAsync(data, mockStream, mockToken);

      expect(mockStream.button).toHaveBeenCalledTimes(2);
      expect(mockStream.markdown).toHaveBeenCalledWith(expect.stringContaining('## Approval Required'));
      expect(mockStream.markdown).toHaveBeenCalledWith('\n\n❌ **Rejected** - Stopping workflow');
      expect(result).toBe(mockStream);
    });
  });
});
