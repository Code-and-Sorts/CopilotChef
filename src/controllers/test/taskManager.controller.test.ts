import 'reflect-metadata';
import * as vscode from 'vscode';
import { TaskManagerController } from '@controllers/taskManager.controller';
import { TaskManagerService } from '@services/taskManager.service';
import { TaskManagerSchema } from '@models/taskManager.model';

jest.mock('@services/taskManager.service');
jest.mock('@models/taskManager.model');

describe('TaskManagerController', () => {
  let taskManagerController: TaskManagerController;
  let mockTaskManagerService: jest.Mocked<TaskManagerService>;
  let mockRequest: vscode.ChatRequest;
  let mockStream: vscode.ChatResponseStream;
  let mockToken: vscode.CancellationToken;

  beforeEach(() => {
    jest.clearAllMocks();

    mockTaskManagerService = {
      createTasksAsync: jest.fn(),
    } as unknown as jest.Mocked<TaskManagerService>;

    taskManagerController = new TaskManagerController(
      mockTaskManagerService
    );

    mockRequest = { prompt: 'test prompt' } as vscode.ChatRequest;
    mockStream = {
      markdown: jest.fn().mockReturnThis(),
    } as unknown as jest.Mocked<vscode.ChatResponseStream>;
    mockToken = {} as vscode.CancellationToken;
  });

  describe('createTasksAsync', () => {
    it('should return validation error when task manager schema validation fails', async () => {
      const mockValidationError = { success: false, error: { errors: [{ message: 'Validation failed' }] } };
      jest.spyOn(TaskManagerSchema, 'safeParse').mockReturnValue(mockValidationError as any);

      const result = await taskManagerController.createTasksAsync(
        mockRequest,
        mockStream,
        mockToken
      );

      expect(TaskManagerSchema.safeParse).toHaveBeenCalledWith(mockRequest.prompt);
      expect(mockStream.markdown).toHaveBeenCalledWith(
        expect.stringContaining('Validation error:')
      );
      expect(result).toBe(mockStream);
      expect(mockTaskManagerService.createTasksAsync).not.toHaveBeenCalled();
    });

    it('should successfully create tasks when validation passes', async () => {
      const mockTaskManagerData = {
        tasks: [{ name: 'Task 1', prompt: 'Do something' }]
      };
      const mockValidationSuccess = {
        success: true,
        data: mockTaskManagerData
      };
      jest.spyOn(TaskManagerSchema, 'safeParse').mockReturnValue(mockValidationSuccess as any);

      const mockServiceResult = mockStream;
      mockTaskManagerService.createTasksAsync.mockResolvedValue(mockServiceResult);

      const result = await taskManagerController.createTasksAsync(
        mockRequest,
        mockStream,
        mockToken
      );

      expect(TaskManagerSchema.safeParse).toHaveBeenCalledWith(mockRequest.prompt);
      expect(mockTaskManagerService.createTasksAsync).toHaveBeenCalledWith(
        mockTaskManagerData,
        mockStream,
        mockToken
      );
      expect(result).toBe(mockServiceResult);
    });
  });
});
