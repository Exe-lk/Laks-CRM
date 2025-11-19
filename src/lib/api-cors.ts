export function applyCors(req:any, res:any){
    res.setHeader("Access-Control-Allow-Origin", "https://www.laksdentagency.co.uk");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");

    if(req.method === "OPTIONS"){
        res.status(200).end();
        return true;
    }
    return false;
}