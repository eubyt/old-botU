import { DiscordEvent, EVENT_RESPONSE } from "../types";
import { Client } from "discord.js";

class Event<T extends keyof EVENT_RESPONSE> implements DiscordEvent {
    client: Client;
    listCallback:
        | ((client: Client, data: EVENT_RESPONSE[T]) => void)[]
        | undefined = [];

    constructor(client: Client) {
        this.client = client;
    }

    addCallback(cb: (client: Client, data: EVENT_RESPONSE[T]) => void) {
        if (!this.listCallback) {
            this.listCallback = [];
        }

        console.log(`[EVENT] ${cb.name} added`);
        this.listCallback.push(cb);
    }

    emit(data: EVENT_RESPONSE[T]) {
        if (!this.listCallback) {
            return;
        }
        this.listCallback.forEach((cb) => cb(this.client, data));
    }

    registerEvent(args: any[]): void {}
}

export { Event };
