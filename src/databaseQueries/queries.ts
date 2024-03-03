import { PoolClient, QueryFunction } from "../databaseService";
import { Scheduler } from "./declaration";
import databaseService from "../utils/database";
import config from 'config';

/**
 * Store Scheduler record
 */
const storeScheuleRecord = async(
    pgClient: PoolClient,
    scheduler: Scheduler
): Promise<void> => {
    const query = `INSERT INTO schedulers
        (id,user_email,user_id,script,runOnce,cron_expr)
        VALUES ($1, $2, $3, $4, $5, $6);`;
    const parameters = [
        scheduler.id,
        scheduler.user_email,
        scheduler.user_id,
        scheduler.script,
        scheduler.runOnce,
        scheduler.cron_expr
    ];

    await databaseService.queryByClient(pgClient,query,parameters);
}

/**
 * Scheduler Transaction
 */
export const insertScheulerTx = async(
    scheuler: Scheduler
): Promise<void> => {
    const trx = async (client: PoolClient) => {
        await storeScheuleRecord(client,scheuler);
    }
    await databaseService.transaction(trx);
}

/**
 * Get Scheduler
 */
export const getScheduler = async(
    id: string
): Promise<Scheduler | undefined> => {
    const query = 'Select * from schedulers where id = $1';
    const params = [id];

    const result = await databaseService.query(query, params);

    return result.rows[0];
}

/**
 * Get schedulers by email
 */
export const getSchedulersByEmail = async(
    user_email: string
): Promise<Scheduler []> => {
    const query = 'Select * from schedulers where user_email = $1';
    const params = [user_email];

    const result = await databaseService.query(query, params);

    return result.rows;
}

/**
 * Get all schedulers
 */
export const getSchedulers = async(): Promise<Scheduler []> => {
    const query = 'Select * from schedulers';
    const result = await databaseService.query(query, []);
    
    return result.rows;
}