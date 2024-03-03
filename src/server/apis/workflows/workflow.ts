import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import multer from 'multer';
import { handleErrorResponse, Route, sendDataResponse } from "../../../server-lib";
import * as Logger from '../../../utils/logger';
import { Workflow, getWorkflow, getWorkflows, getWorkflowsByEmail, insertWorkflowTx } from "../../../databaseQueries";

const logger = Logger.default("Workflow-API");

// Set up Multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export const createWorkflow:Route = {
    isRoute: true,
    path: "/workflow",
    method: "post",
    handlers: [
        upload.single('script'), 
        async( req: Request, res: Response): Promise<void> =>{
            try {
                logger.debug("Request body", JSON.stringify(req.body));
                const { user_email, runOnce, datetime} = req.body;
                const isRunOnce = runOnce.toLowerCase() === 'true';
                const scripFile = req.file
                const script = scripFile ?  scripFile.buffer.toString('utf-8'): '';
                const workflow: Workflow = {
                    id: uuidv4(),
                    user_email,
                    script,
                    runOnce: isRunOnce,
                    datetime
                }

                await insertWorkflowTx(workflow);

                return sendDataResponse(
                    {
                        workflow
                    },
                    res
                )
            } catch (error) {
                logger.fatal("error,", error);
                return handleErrorResponse(<Error> error,res);
            }
        }
    ]
}

export const getAllWorkflows:Route = {
    isRoute: true,
    path: "/workflows",
    method: "get",
    handlers: [
        async( req: Request, res: Response): Promise<void> =>{
            try {

                const workflows = await getWorkflows();

                return sendDataResponse(
                    {
                        workflows
                    },
                    res
                )
            } catch (error) {
                logger.fatal("error,", error);
                return handleErrorResponse(<Error> error,res);
            }
        }
    ]
}

export const getWorkflowById:Route = {
    isRoute: true,
    path: "/workflow/:id",
    method: "get",
    handlers: [
        async( req: Request, res: Response): Promise<void> =>{
            try {
                const {id} = req.params;
                const workflow = await getWorkflow(id)
                return sendDataResponse(
                    {
                        workflow
                    },
                    res
                )
            } catch (error) {
                logger.fatal("error,", error);
                return handleErrorResponse(<Error> error,res);
            }
        }
    ]
}

export const getWorkflowByUserEmail:Route = {
    isRoute: true,
    path: "/user/workflows",
    method: "get",
    handlers: [
        async( req: Request, res: Response): Promise<void> =>{
            try {
                const {user_email} = req.query;
                const workflows = await getWorkflowsByEmail(user_email as string)
                return sendDataResponse(
                    {
                        workflows
                    },
                    res
                )
            } catch (error) {
                logger.fatal("error,", error);
                return handleErrorResponse(<Error> error,res);
            }
        }
    ]
}