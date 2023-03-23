import { Client } from "discord.js";
import { GetGuildData } from "../../guildData";
import { DiscordArgsOf, DiscordOn } from "../../types";
import { Event } from "../eventCreator";

class EventGuildMemberAdd extends Event<"memberGuildUpdate"> {
    constructor(client: Client) {
        super(client);
    }

    @DiscordOn({ event: "guildMemberAdd" })
    async registerEvent([member]: DiscordArgsOf<"guildMemberAdd">) {
        const dataGuild = await GetGuildData(member.guild.id, this.client);

        if (!dataGuild) {
            console.error("Guild data not found!");
            return;
        }

        const invite = await dataGuild.getInviteNewUse();

        this.emit({
            event: "join",
            guildId: member.guild.id,
            user: member.user,
            invite: invite ?? null,
            joinedAt: member.joinedAt,
        });
    }
}

export { EventGuildMemberAdd };
