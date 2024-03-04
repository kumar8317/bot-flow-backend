import cron from "node-cron";
import {
  Workflow,
  getWorkflow,
  getWorkflows,
  updateWorkflowLogs,
  workflowLog,
} from "../databaseQueries";
import * as Logger from "../utils/logger";
import { generateCronexpression } from "../utils/helper";
import { runInNewContext } from "vm";
import puppeteer from "puppeteer";
import { chromium } from "playwright";

const logger = Logger.default("Crons");

const cronJobMap: Map<string, cron.ScheduledTask> = new Map();

export const createCronJob = async (workflow: Workflow): Promise<void> => {
  try {
    logger.info("running cron jobs");
    //const datetime = new Date(Number(workflow.datetime) * 1000);
    //const cronExpression = generateCronexpression(workflow.runOnce, datetime);
    const cronExpression = workflow.datetime
    logger.info(`expression:${cronExpression}`);
    // Create a cron job for the workflow
    const cronJob = cron.schedule(cronExpression, async () => {
      try {
        const scriptContent = workflow.script;
        logger.info(`script:${scriptContent}`);

        const result = await runInNewContext(scriptContent, {
          require: require,
          console: console,
          chromium: chromium,
        });

        logger.info(`Result- ${result}`);

        //Update workflow logs
        logger.info(`workflow id:${workflow.id}`);
        const flow = await getWorkflow(workflow.id);
        if(flow){
          const logs:workflowLog = JSON.parse(flow.logs);
          const date = Date.now();
          const newLogs = {
            [date]: {
              error: false,
              msg: "",
            },
          };
          if (logs) {
            logs.push(newLogs);
            await updateWorkflowLogs(JSON.stringify(logs), workflow.id);
          } else {
            await updateWorkflowLogs(JSON.stringify([newLogs]), workflow.id);
          }
        }
        
      } catch (error) {
        logger.error(
          `Error executing script for workflow with ID:${workflow.id} - error- ${error}`
        );

        const flow = await getWorkflow(workflow.id);
        if (flow) {
          const logs:workflowLog = JSON.parse(flow.logs);
          const date = Date.now();
          const newLogs = {
            [date]: {
              error: true,
              msg: error,
            },
          };
          if (logs) {
            logs.push(newLogs);
            await updateWorkflowLogs(JSON.stringify(logs), workflow.id);
          } else {
            await updateWorkflowLogs(JSON.stringify([newLogs]), workflow.id);
          }
        }
      }
    });
    cronJobMap.set(workflow.id, cronJob);
  } catch (error) {
    logger.error(`Error creating cron jobs:${error}`);
  }
};

export const runJobs  = async() => {
  try {
    const getallWorkflows = await getWorkflows();

    getallWorkflows.forEach(async (workflow)=>{
      if(!workflow.stop){
        await createCronJob(workflow);
      }
      
    })

  } catch (error) {
    logger.error(`Error running jobs:${error}`);
  }
}


export const stopCronJob = (workflowId: string): void => {
  const cronJob = cronJobMap.get(workflowId);
  if (cronJob) {
    cronJob.stop();
    cronJobMap.delete(workflowId); // Remove the cron job instance from the map
    logger.info(`Stopped cron job for workflow with ID: ${workflowId}`);
  } else {
    logger.warn(`No cron job found for workflow with ID: ${workflowId}`);
  }
};