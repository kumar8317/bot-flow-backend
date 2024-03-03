import dotenv from "dotenv";
dotenv.config();
import { Options, ServerApp } from "../server-lib";
import config from "config";
import workflowRouting from "./apis/workflows";

const serverName = "Server";

const serverPort: number = config.get(`${serverName}.port`);

const expressOptions: Options = {
  serverName,
  enableGlobalRateLimiter: config.get(`${serverName}.enableGlobalRateLimit`),
  port: serverPort,
  cors: { disable: true },
  securityHeaders: {
    disableAll: true,
  },
};
// Initialize Server Object
const apiServer = new ServerApp(expressOptions);

apiServer.applyRoutes("/api", workflowRouting );

const initServer = async (): Promise<void> => {
  await apiServer.initalise();
};

const closeServer = async (): Promise<void> => {
  await apiServer.closeServer();
};

export { initServer, closeServer };