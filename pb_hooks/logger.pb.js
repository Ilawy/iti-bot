/// <reference path="./types.d.ts" />

routerAdd("POST", "/logger", e=>{
    if(!e.hasSuperuserAuth())return e.json(401, {
        message: "UNAUTHORIZED"
    })

    const query = e.request.url.query()
    if(!query.has("message")){
        return e.json(400, {
            message: "`message` is required"
        })
    }
    if(!query.has("level")){
        return e.json(400, {
            message: "`level` is required"
        })
    }
    const message = query.get("message");
    const level = query.get("level")
    const logger = $app.logger()
    .with("from", "http")
    switch(level){
        case "INFO":
            logger.info(message);
            break;
        case "WARN":
            logger.warn(message);
            break;
        case "ERROR":
            logger.error(message);
            break;
        default:
            return e.json(400, {
                message: `invalid level type "${level}"`
            })
    }
    
    return e.json(200, {})
})