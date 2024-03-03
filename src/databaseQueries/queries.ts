import { PoolClient} from "../databaseService";
import { Workflow, WorkflowRes } from "./declaration";
import databaseService from "../utils/database";

/**
 * Store Workflow record
 */
const storeWorkflowRecord = async(
    pgClient: PoolClient,
    workflow: Workflow
): Promise<void> => {
    const query = `INSERT INTO workflows
        (id,user_email,script,runOnce,datetime)
        VALUES ($1, $2, $3, $4, $5);`;
    const parameters = [
        workflow.id,
        workflow.user_email,
        workflow.script,
        workflow.runOnce,
        workflow.datetime
    ];

    await databaseService.queryByClient(pgClient,query,parameters);
}

/**
 * Workflow Transaction
 */
export const insertWorkflowTx = async(
    workflow: Workflow
): Promise<void> => {
    const trx = async (client: PoolClient) => {
        await storeWorkflowRecord(client,workflow);
    }
    await databaseService.transaction(trx);
}

/**
 * Get Workflow
 */
export const getWorkflow = async(
    id: string
): Promise<WorkflowRes | undefined> => {
    const query = 'Select * from workflows where id = $1';
    const params = [id];

    const result = await databaseService.query(query, params);

    return result.rows[0];
}

/**
 * Get workflows by email
 */
export const getWorkflowsByEmail = async(
    user_email: string
): Promise<WorkflowRes []> => {
    const query = 'Select * from workflows where user_email = $1';
    const params = [user_email];

    const result = await databaseService.query(query, params);

    return result.rows;
}

/**
 * Get all workflows
 */
export const getWorkflows = async(): Promise<WorkflowRes[]> => {
    const query = 'Select * from workflows';
    const result = await databaseService.query(query, []);

    return result.rows;
}

/**
 * Update logs in worlflow
 */
export const updateWorkflowLogs = async( logs:string, workflow_id:string) : Promise<void> => {
    const query = `UPDATE workflows SET logs = $1 where id = $2`;
    const params = [logs, workflow_id];

    await databaseService.query(query,params);
}

/**
 * Update Stop status in worlflow
 */
export const updateWorkflowStop = async( stop:boolean, workflow_id:string) : Promise<void> => {
    const query = `UPDATE workflows SET stop = $1 where id = $2`;
    const params = [stop, workflow_id];

    await databaseService.query(query,params);
}