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

const logger = Logger.default("Crons");

export const createCronJob = async (workflow: Workflow): Promise<void> => {
  try {
    logger.info("running cron jobs");
    //const datetime = new Date(Number(workflow.datetime) * 1000);
    //const cronExpression = generateCronexpression(workflow.runOnce, datetime);
    const cronExpression = workflow.datetime
    logger.info(`expression:${cronExpression}`);
    // Create a cron job for the workflow
    cron.schedule(cronExpression, async () => {
      try {
        const scriptContent = workflow.script;
        logger.info(`script:${scriptContent}`);

        const result = await runInNewContext(scriptContent, {
          require: require,
          console: console,
          puppeteer: puppeteer,
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
  } catch (error) {
    logger.error(`Error creating cron jobs:${error}`);
  }
};

export const runJobs  = async() => {
  try {
    const getallWorkflows = await getWorkflows();

    getallWorkflows.forEach(async (workflow)=>{
      await createCronJob(workflow);
    })

  } catch (error) {
    logger.error(`Error running jobs:${error}`);
  }
}
