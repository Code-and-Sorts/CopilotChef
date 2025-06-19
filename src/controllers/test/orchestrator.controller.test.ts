import 'reflect-metadata';
import * as vscode from 'vscode';
import { OrchestratorController } from '@controllers/orchestrator.controller';
import { OrchestratorService } from '@services/orchestrator.service';
import { TaskManagerService } from '@services/taskManager.service';
import { OrchestratorSchema } from '@models/orchestrator.model';
import { TaskManagerSchema } from '@models/taskManager.model';

jest.mock('@services/orchestrator.service');
jest.mock('@services/taskManager.service');
jest.mock('@models/orchestrator.model');
jest.mock('@models/taskManager.model');

describe('OrchestratorController', () => {
  let orchestratorController: OrchestratorController;
  let mockOrchestratorService: jest.Mocked<OrchestratorService>;
  let mockTaskManagerService: jest.Mocked<TaskManagerService>;
  let mockRequest: vscode.ChatRequest;
  let mockStream: vscode.ChatResponseStream;
  let mockToken: vscode.CancellationToken;
  let mockParsedPrompt: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockOrchestratorService = {
      createOrchestratorAsync: jest.fn(),
    } as unknown as jest.Mocked<OrchestratorService>;

    mockTaskManagerService = {
      createTasksAsync: jest.fn(),
    } as unknown as jest.Mocked<TaskManagerService>;

    orchestratorController = new OrchestratorController(
      mockOrchestratorService,
      mockTaskManagerService
    );

    mockParsedPrompt = { prompt: 'test prompt' };
    mockRequest = { prompt: JSON.stringify(mockParsedPrompt) } as vscode.ChatRequest;
    mockStream = {
      markdown: jest.fn().mockReturnThis(),
    } as unknown as jest.Mocked<vscode.ChatResponseStream>;
    mockToken = {} as vscode.CancellationToken;
  });

  describe('createOrchestratorAsync', () => {
    it('should return validation error when orchestrator schema validation fails', async () => {
      const mockValidationError = { success: false, error: { errors: [{ message: 'Validation failed' }] } };
      jest.spyOn(OrchestratorSchema, 'safeParse').mockReturnValue(mockValidationError as any);

      const result = await orchestratorController.createOrchestratorAsync(
        mockRequest,
        mockStream,
        mockToken
      );

      expect(OrchestratorSchema.safeParse).toHaveBeenCalledWith(mockParsedPrompt);
      expect(mockStream.markdown).toHaveBeenCalledWith(
        expect.stringContaining('Validation error:')
      );
      expect(result).toBe(mockStream);
      expect(mockOrchestratorService.createOrchestratorAsync).not.toHaveBeenCalled();
    });

    it('should return validation error when task manager schema validation fails', async () => {
      const mockOrchestratorValidationSuccess = {
        success: true,
        data: { prompt: 'valid prompt' }
      };
      jest.spyOn(OrchestratorSchema, 'safeParse').mockReturnValue(mockOrchestratorValidationSuccess as any);

      const mockOrchestratorResult = '```json\n{\n  "tasks": [\n    {\n      "name": "Task 1",\n      "prompt": "Do something"\n    }\n  ]\n}\n```';
      mockOrchestratorService.createOrchestratorAsync.mockResolvedValue(mockOrchestratorResult);

      const mockTaskManagerValidationError = {
        success: false,
        error: { message: 'Task validation failed', errors: [{ message: 'Task validation failed' }] }
      };
      jest.spyOn(TaskManagerSchema, 'safeParse').mockReturnValue(mockTaskManagerValidationError as any);

      const result = await orchestratorController.createOrchestratorAsync(
        mockRequest,
        mockStream,
        mockToken
      );

      expect(OrchestratorSchema.safeParse).toHaveBeenCalledWith(mockParsedPrompt);
      expect(mockOrchestratorService.createOrchestratorAsync).toHaveBeenCalledWith(
        mockOrchestratorValidationSuccess.data,
        mockStream,
        mockToken
      );
      expect(TaskManagerSchema.safeParse).toHaveBeenCalledWith(mockOrchestratorResult);
      expect(mockStream.markdown).toHaveBeenCalledWith(
        expect.stringContaining('Validation error:')
      );
      expect(result).toBe(mockStream);
      expect(mockTaskManagerService.createTasksAsync).not.toHaveBeenCalled();
    });

    it('should successfully create orchestrator and tasks when all validations pass', async () => {
      const mockOrchestratorData = { prompt: 'valid prompt' };
      const mockOrchestratorValidationSuccess = {
        success: true,
        data: mockOrchestratorData
      };
      jest.spyOn(OrchestratorSchema, 'safeParse').mockReturnValue(mockOrchestratorValidationSuccess as any);

      const mockOrchestratorResult = '```json\n{\n  "tasks": [\n    {\n      "name": "Task 1",\n      "prompt": "Do something"\n    }\n  ]\n}\n```';
      mockOrchestratorService.createOrchestratorAsync.mockResolvedValue(mockOrchestratorResult);

      const mockTaskManagerData = {
        tasks: [{ name: 'Task 1', prompt: 'Do something' }]
      };
      const mockTaskManagerValidationSuccess = {
        success: true,
        data: mockTaskManagerData
      };
      jest.spyOn(TaskManagerSchema, 'safeParse').mockReturnValue(mockTaskManagerValidationSuccess as any);

      const mockTaskManagerResult = mockStream;
      mockTaskManagerService.createTasksAsync.mockResolvedValue(mockTaskManagerResult);

      const result = await orchestratorController.createOrchestratorAsync(
        mockRequest,
        mockStream,
        mockToken
      );

      expect(OrchestratorSchema.safeParse).toHaveBeenCalledWith(mockParsedPrompt);
      expect(mockOrchestratorService.createOrchestratorAsync).toHaveBeenCalledWith(
        mockOrchestratorData,
        mockStream,
        mockToken
      );
      expect(TaskManagerSchema.safeParse).toHaveBeenCalledWith(mockOrchestratorResult);
      expect(mockTaskManagerService.createTasksAsync).toHaveBeenCalledWith(
        mockTaskManagerData,
        mockStream,
        mockToken
      );
      expect(result).toBe(mockTaskManagerResult);
    });

    it('should handle JSON parse errors', async () => {
      const invalidJsonRequest = { prompt: 'invalid json' } as vscode.ChatRequest;

      const result = await orchestratorController.createOrchestratorAsync(
        invalidJsonRequest,
        mockStream,
        mockToken
      );

      expect(mockStream.markdown).toHaveBeenCalledWith(
        expect.stringContaining('Error parsing JSON:')
      );
      expect(result).toBe(mockStream);
      expect(OrchestratorSchema.safeParse).not.toHaveBeenCalled();
    });
  });
});
