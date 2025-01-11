/// <reference path="../.local/data/types.d.ts" />


//@ts-check


routerAdd("POST", "/mailer", e=>{
    /**
     * 
     * @param {string} message 
     * @param {number} code 
     * @returns 
     */
    const err = (message, code = 401)=>e.json(code, {message})
    if(!e.hasSuperuserAuth()){
        return e.json(401, {
            message: `UNAUTHORIZED`
        })
    }
    if(!e.request || !e.request.url){
        const error = new Error("cannot access request")
        $app.logger().error(error.stack || error.message)
        return e.json(500, {
            message: error.message
        })
    }

    /**@type {{subject?: string; to?: string[]; body?: string}} */
    const result = new DynamicModel({
        subject: "",
        body: "",
        to: [],
    })

    e.bindBody(result)

    console.log(JSON.stringify(result));
    

    if(!result.subject)return err("subject is required");
    if(!result.body)return err("body is required");
    if(!result.to || result.to.length === 0)return err("at least on reciver is required");
    

    try{
        // @ts-ignore not all arguments are required
        $app.newMailClient().send({
            from: {
                address: "mma7200@aol.com",
                name: "ITIan - noreply"
            },
            subject: result.subject,
            html: result.body,
            to: result.to.map(address=>({address})),
        })
    }catch(e){
        console.log(e);
        
    }
})