import { Routing } from '../../../server-lib';
import { createWorkflow, getAllWorkflows, getWorkflowById, getWorkflowByUserEmail, updateWorkflow } from './workflow';

const workflowRouting: Routing = {
  isRoute: false,
  url: '/v1',
  childRoutes: [
    createWorkflow,
    getWorkflowById,
    getWorkflowByUserEmail,
    getAllWorkflows,
    updateWorkflow
  ],
};

export default workflowRouting;