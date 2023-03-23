import { Client } from "discord.js";
import { GetGuildData } from "../../guildData";
import { DiscordArgsOf, DiscordOn } from "../../types";
import { Event } from "../eventCreator";

class EventGuildMemberUpdate extends Event<"memberGuildUpdate"> {
    constructor(client: Client) {
        super(client);
    }

    @DiscordOn({ event: "guildMemberUpdate" })
    async registerEvent([
        oldMember,
        member,
    ]: DiscordArgsOf<"guildMemberUpdate">) {
        const dataGuild = await GetGuildData(member.guild.id, this.client);

        if (!dataGuild) {
            console.error("Guild data not found!");
            return;
        }

        const invite = await dataGuild.getInviteNewUse();

        this.emit({
            event: "update",
            guildId: member.guild.id,
            user: member.user,
            oldUser: oldMember.user,
            invite: invite ?? null,
            joinedAt: member.joinedAt,
        });
    }
}

export { EventGuildMemberUpdate };
