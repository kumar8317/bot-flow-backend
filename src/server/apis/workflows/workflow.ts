import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import multer from 'multer';
import { handleErrorResponse, Route, sendDataResponse } from "../../../server-lib";
import * as Logger from '../../../utils/logger';
import { Workflow, getWorkflow, getWorkflows, getWorkflowsByEmail, insertWorkflowTx, updateWorkflowStop } from "../../../databaseQueries";
import { createCronJob, stopCronJob } from "../../../services/cron";

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
                await createCronJob(workflow)
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

                const workflowsResponse = await getWorkflows();
                const workflows = workflowsResponse.map((worflow)=>{
                    return {
                        ...worflow,
                        logs: JSON.parse(worflow.logs)
                    }
                })
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

export const updateWorkflow:Route = {
    isRoute: true,
    path: "/workflow/:id/update",
    method: "post",
    handlers: [ 
        async( req: Request, res: Response): Promise<void> =>{
            try {
                logger.debug("Request body", JSON.stringify(req.body));
                const { id} = req.params;
                const {stop, datetime} = req.body
                
                if(stop){
                    stopCronJob(id);
                }
                
                await updateWorkflowStop({
                    updateBy: {
                        id
                    },
                    updateFiedls: {
                        stop: req.body.stop as boolean,
                        runOnce: req.body.runOnce as boolean,
                        datetime: req.body.datetime as string,
                    }
                });

                const workflow = await getWorkflow(id);
                if(workflow){
                    if(datetime){
                        stopCronJob(id);
                        createCronJob({
                            id: workflow.id,
                            user_email: workflow.user_email,
                            script: workflow.script,
                            datetime: workflow.datetime,
                            runOnce: workflow.runOnce
                        });         
                    }
                } 
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