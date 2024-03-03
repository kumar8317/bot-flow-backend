
export const generateCronexpression = (runOnce: boolean, datetime: Date): string => {
    if(runOnce){
        const minute = datetime.getMinutes();
        const hour = datetime.getHours();
        const day = datetime.getDate();
        const month = datetime.getMonth() + 1; // Months are zero-based in JavaScript
        const year = datetime.getFullYear();

        return `${minute} ${hour} ${day} ${month} ? ${year}`;
    }else{
        const minute = datetime.getMinutes();
        const hour = datetime.getHours();

        return `${minute} ${hour} * * *`;
    }
}