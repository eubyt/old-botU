import { AuditLogEvent, Client } from "discord.js";
import { DiscordArgsOf, DiscordOn } from "../../types";
import { splitMessage } from "../../utils/tools";
import { Event } from "../eventCreator";

class EventMessageCreate extends Event<"messageStateUpdate"> {
    constructor(client: Client) {
        super(client);
    }

    @DiscordOn({ event: "messageCreate" })
    async registerEvent([message]: DiscordArgsOf<"messageCreate">) {
        if (!message.author || !message.guild) return;

        this.emit({
            event: "create",
            guildId: message.guildId || "",
            message: {
                id: message.id,
                content: splitMessage(message.content || "null"),
                channel: message.channel.id,
                createdTimestamp: message.createdTimestamp / 1000,
            },
            staff: null,
            author: message.author,
        });
    }
}

export { EventMessageCreate };
