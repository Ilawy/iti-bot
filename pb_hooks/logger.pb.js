/// <reference path="./types.d.ts" />
//@ts-check
routerAdd("POST", "/logger", (e) => {
  
  if (!e.hasSuperuserAuth()) {
    return e.json(401, {
      message: "UNAUTHORIZED",
    });
  }
  if(!e?.request?.url){
    return e.json(500, {
      message: `Cannot reach request, this should never happen`
    })
  }
  const query = e.request.url.query();
  
  
  
  if (!query.has("message")) {
    return e.json(400, {
      message: "`message` is required",
    });
  }
  if (!query.has("level")) {
    return e.json(400, {
      message: "`level` is required",
    });
  }
  const message = query.get("message");
  const level = query.get("level");
  let logger = $app.logger()
    .with("from", "http");
    if(query.has("meta")){
      const meta = JSON.parse(query.get("meta"));
      // logger = logger.withGroup("meta")
      for(const key of Object.keys(meta)){
        logger = logger.with(key, meta[key])

      }
    }
    switch (level) {
    case "INFO":
      logger.info(message);
      break;
    case "WARN":
      logger.warn(message);
      break;
    case "ERROR":
      console.log(query.get("meta"));
      
      logger.error(message);
      break;
    default:
      return e.json(400, {
        message: `invalid level type "${level}"`,
      });
  }

  return e.json(200, {});
});
