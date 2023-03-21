import { Client } from "discord.js";
import { getGuildData } from "../../guildData";
import { DiscordArgsOf, DiscordOn } from "../../types";
import { Event } from "../eventCreator";

class EventInviteCreate extends Event<"inviteUpdate"> {
  constructor(client: Client) {
    super(client);
  }

  @DiscordOn({ event: "inviteCreate" })
  async registerEvent([invite]: DiscordArgsOf<"inviteCreate">) {
    this.emit({
      event: "create",
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

export { EventInviteCreate };
