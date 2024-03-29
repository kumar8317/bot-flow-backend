import dotenv from "dotenv";
dotenv.config();
import Logger from "./utils/logger";
import { closeDbConnectionPool, initDbConnectionPool } from "./utils/database";
import { closeServer, initServer } from "./server";
import { runJobs } from "./services/cron";

const logger = Logger("INDEX");

const gracefulShutdown = async () => {
    try {
      logger.warn("Shutting down the application");
      await closeDbConnectionPool();
      await closeServer();
    } catch (e) {
      logger.fatal(
        "Could not shutdown gracefully, error while shutting down!",
        e
      );
    } finally {
      process.exit(0);
    }
};

const bootUp = async() => {
    try {
        await initDbConnectionPool();
        await initServer();

        await runJobs();
    } catch (e) {
        logger.fatal("Error while booting up, shutting down!", e);
        await gracefulShutdown();
    }
}

process.on("SIGTERM", gracefulShutdown);

bootUp();