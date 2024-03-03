import cron from "node-cron";
import { Workflow, getWorkflows } from "../databaseQueries";
import * as Logger from "../utils/logger";
import { generateCronexpression } from "../utils/helper";
import { runInNewContext } from "vm";
import puppeteer from "puppeteer";

const logger = Logger.default("Crons");

export const createCronJob = async (workflow: Workflow): Promise<void> => {
  try {
    logger.info("running cron jobs");
    const datetime = new Date(Number(workflow.datetime) * 1000);
    const cronExpression = generateCronexpression(workflow.runOnce, datetime);
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
      } catch (error) {
        logger.error(
          `Error executing script for workflow with ID:${workflow.id} - error- ${error}`
        );
      }
    });
  } catch (error) {
    logger.error(`Error creating cron jobs:${error}`);
  }
};
