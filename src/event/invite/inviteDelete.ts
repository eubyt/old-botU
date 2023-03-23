import { Client } from "discord.js";
import { DiscordArgsOf, DiscordOn } from "../../types";
import { Event } from "../eventCreator";

class EventInviteDelete extends Event<"inviteUpdate"> {
    constructor(client: Client) {
        super(client);
    }

    @DiscordOn({ event: "inviteDelete" })
    async registerEvent([invite]: DiscordArgsOf<"inviteDelete">) {
        this.emit({
            event: "delete",
            guildId: invite.guild?.id ?? "",
            user: invite.inviter,
            invite: {
                id: invite.inviterId ?? "",
                channel: invite.channelId,
                code: invite.code,
                uses: invite.uses ?? 0,
            },
        });
    }
}

export { EventInviteDelete };
