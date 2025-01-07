class Logger {
    constructor(private topic: string) {
    }
    // deno-lint-ignore require-await
    async info(message: string) {
        console.log(message);
    }

    get log(){
        return this.info.bind(this)
    }

    async warning(message: string | Error) {
        console.warn("[WARN]", message.toString());
        try {
            await fetch(`https://ntfy.sh/${this.topic}`, {
                method: "POST",
                body: message.toString(),
                headers: {
                    "Title": "ITI Bot Warning",
                    "Priority": "high",
                    "Tags": "warning,skull",
                },
            });
        } catch {}
    }

    async error(message: string | Error){
        console.error(message.toString());
        try {
            await fetch(`https://ntfy.sh/${this.topic}`, {
                method: "POST",
                body: message.toString(),
                headers: {
                    "Title": "ITI Bot Error",
                    "Priority": "urgent",
                    "Tags": "warning,skull",
                },
            });
        } catch {}
    }
}

if(!Deno.env.has("NTFY_TOPIC")){
    throw new Error("ENV variable is required (NTFY_TOPIC)")
}

export const logger = new Logger(Deno.env.get("NTFY_TOPIC")!)