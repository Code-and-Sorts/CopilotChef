import 'reflect-metadata';
import { Container } from 'inversify';
import { TaskManagerController } from '@controllers/taskManager.controller';
import { TaskManagerService } from '@services/taskManager.service';
import { OrchestratorController } from '@controllers/orchestrator.controller';
import { OrchestratorService } from '@services/orchestrator.service';
import { WorkflowController } from '@controllers/workflow.controller';
import { WorkflowService } from '@services/workflow.service';

const container = new Container();
container.bind<TaskManagerController>(TaskManagerController).toSelf();
container.bind<TaskManagerService>(TaskManagerService).toSelf();
container.bind<OrchestratorController>(OrchestratorController).toSelf();
container.bind<OrchestratorService>(OrchestratorService).toSelf();
container.bind<WorkflowController>(WorkflowController).toSelf();
container.bind<WorkflowService>(WorkflowService).toSelf();

export default container;
