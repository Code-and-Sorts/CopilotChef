import 'reflect-metadata';
import * as vscode from 'vscode';
import { WorkflowController } from '@controllers/workflow.controller';
import { WorkflowService } from '@services/workflow.service';
import { WorkflowTaskSchema } from '@models/workflowTask.model';

jest.mock('@services/workflow.service');
jest.mock('@models/workflowTask.model');

describe('WorkflowController', () => {
  let workflowController: WorkflowController;
  let mockWorkflowService: jest.Mocked<WorkflowService>;
  let mockRequest: vscode.ChatRequest;
  let mockStream: vscode.ChatResponseStream;
  let mockToken: vscode.CancellationToken;

  beforeEach(() => {
    jest.clearAllMocks();

    mockWorkflowService = {
      createWorkflowAsync: jest.fn(),
    } as unknown as jest.Mocked<WorkflowService>;

    workflowController = new WorkflowController(
      mockWorkflowService
    );

    mockRequest = { prompt: 'test prompt' } as vscode.ChatRequest;
    mockStream = {
      markdown: jest.fn().mockReturnThis(),
      button: jest.fn().mockReturnThis(),
    } as unknown as jest.Mocked<vscode.ChatResponseStream>;
    mockToken = {} as vscode.CancellationToken;
  });

  describe('createWorkflowAsync', () => {
    it('should return validation error when workflow schema validation fails', async () => {
      const mockValidationError = { success: false, error: { errors: [{ message: 'Validation failed' }] } };
      jest.spyOn(WorkflowTaskSchema, 'safeParse').mockReturnValue(mockValidationError as any);

      const result = await workflowController.createWorkflowAsync(
        mockRequest,
        mockStream,
        mockToken
      );

      expect(WorkflowTaskSchema.safeParse).toHaveBeenCalledWith(mockRequest.prompt);
      expect(mockStream.markdown).toHaveBeenCalledWith(
        expect.stringContaining('Validation error:')
      );
      expect(result).toBe(mockStream);
      expect(mockWorkflowService.createWorkflowAsync).not.toHaveBeenCalled();
    });

    it('should successfully create workflow when validation passes', async () => {
      const mockWorkflowData = {
        tasks: [
          {
            name: 'Task 1',
            prompt: 'Do something',
            approvalGate: {
              isEnabled: true,
              message: 'Approve this task?'
            }
          }
        ]
      };
      const mockValidationSuccess = {
        success: true,
        data: mockWorkflowData
      };
      jest.spyOn(WorkflowTaskSchema, 'safeParse').mockReturnValue(mockValidationSuccess as any);

      const mockServiceResult = mockStream;
      mockWorkflowService.createWorkflowAsync.mockResolvedValue(mockServiceResult);

      const result = await workflowController.createWorkflowAsync(
        mockRequest,
        mockStream,
        mockToken
      );

      expect(WorkflowTaskSchema.safeParse).toHaveBeenCalledWith(mockRequest.prompt);
      expect(mockWorkflowService.createWorkflowAsync).toHaveBeenCalledWith(
        mockWorkflowData,
        mockStream,
        mockToken
      );
      expect(result).toBe(mockServiceResult);
    });
  });
});
