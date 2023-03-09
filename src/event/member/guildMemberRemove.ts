import { AuditLogEvent, Client } from "discord.js";
import { getGuildData } from "../../guildData";
import { DiscordArgsOf, DiscordOn } from "../../types";
import { Event } from "../eventCreator";

class EventGuildMemberRemove extends Event<"memberGuildUpdate"> {
  constructor(client: Client) {
    super(client);
  }

  @DiscordOn({ event: "guildMemberRemove" })
  async registerEvent([member]: DiscordArgsOf<"guildMemberRemove">) {
    const dataGuild = await getGuildData(member.guild.id, this.client);

    if (!dataGuild) {
      console.error("Guild data not found!");
      return;
    }

    const auditLog = await member.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.MemberKick,
    });
    const auditLogEntry = auditLog.entries.first();
    const check = auditLogEntry?.target?.id === member.user.id;

    this.emit({
      event: check ? "kick" : "leave",
      guildId: member.guild.id,
      staff: check ? auditLogEntry?.executor : null,
      user: member.user,
      joinedAt: member.joinedAt,
      invite: null,
    });
  }
}

export { EventGuildMemberRemove };
