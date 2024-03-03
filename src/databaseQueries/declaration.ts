export type Scheduler = {
    id: string;
    user_email: string;
    user_id: string;
    script: string;
    runOnce: boolean;
    cron_expr: string;
}