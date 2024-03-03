export type Workflow = {
  id: string;
  user_email: string;
  script: string;
  runOnce: boolean;
  datetime: string;
};

export type WorkflowRes = {
  id: string;
  user_email: string;
  script: string;
  runOnce: boolean;
  datetime: string;
  logs: string;
  stop: boolean;
};

export type workflowLog = {
  [x: number]: {
    error: boolean;
    msg: unknown;
  };
}[];
