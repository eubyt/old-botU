import { ActivityType, AuditLogEvent, Client } from "discord.js";
import { DiscordArgsOf, DiscordOn } from "../../types";
import { Event } from "../eventCreator";

class EventPresenceUpdate extends Event<"presenceUpdate"> {
    constructor(client: Client) {
        super(client);
    }

    @DiscordOn({ event: "presenceUpdate" })
    async registerEvent([
        oldPresence,
        presence,
    ]: DiscordArgsOf<"presenceUpdate">) {
        const twitch = presence.activities.find(
            (activity) =>
                activity.type === ActivityType.Streaming &&
                activity.name === "Twitch"
        );

        if (!presence.user || !presence.guild || presence.user.bot) return;

        if (twitch) {
            this.emit({
                activity: "twitch",
                guildId: presence.guild.id,
                user: presence.user,
            });
        } else {
            this.emit({
                activity: "none",
                guildId: presence.guild.id,
                user: presence.user,
            });
        }
    }
}

export { EventPresenceUpdate };
