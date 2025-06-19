import 'reflect-metadata';
import * as vscode from 'vscode';
import { OrchestratorService } from '@services/orchestrator.service';
import { OrchestratorType } from '@models/orchestrator.model';

jest.mock('vscode', () => {
  const mockLanguageModelResponse = {
    text: (async function* () {
      yield 'Task 1 response';
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

describe('OrchestratorService', () => {
  let orchestratorService: OrchestratorService;
  let mockStream: jest.Mocked<vscode.ChatResponseStream>;
  let mockToken: vscode.CancellationToken;

  beforeEach(() => {
    jest.clearAllMocks();

    orchestratorService = new OrchestratorService();

    mockStream = {
      markdown: jest.fn().mockReturnThis()
    } as unknown as jest.Mocked<vscode.ChatResponseStream>;

    mockToken = {} as vscode.CancellationToken;
  });

  describe('createOrchestratorAsync', () => {
    it('should create orchestrator tasks successfully', async () => {
      const data: OrchestratorType = {
        prompt: 'Test prompt',
        modelType: 'gpt-4'
      };

      const result = await orchestratorService.createOrchestratorAsync(data, mockStream, mockToken);

      expect(vscode.lm.selectChatModels).toHaveBeenCalledWith({ vendor: 'copilot', family: 'gpt-4' });
      expect(vscode.LanguageModelChatMessage.User).toHaveBeenCalled();
      expect(mockStream.markdown).toHaveBeenCalledWith('## 🔄 Generating tasks...\n\n');
      expect(mockStream.markdown).toHaveBeenCalledWith('## 🔄 Task Results\n\n');
      expect(mockStream.markdown).toHaveBeenCalledWith('Task 1 response');
      expect(mockStream.markdown).toHaveBeenCalledWith(' continues here');
      expect(result).toBe('Task 1 response continues here');
    });

    it('should throw error when no language model is found', async () => {
      (vscode.lm.selectChatModels as jest.Mock).mockResolvedValueOnce([]);

      const data: OrchestratorType = {
        prompt: 'Test prompt',
        modelType: 'gpt-4'
      };

      await expect(orchestratorService.createOrchestratorAsync(data, mockStream, mockToken))
        .rejects.toThrow('No suitable language model found');

      expect(mockStream.markdown).toHaveBeenCalledWith("I couldn't find a suitable language model. Please make sure GitHub Copilot Chat is installed and enabled.");
    });
  });
});
