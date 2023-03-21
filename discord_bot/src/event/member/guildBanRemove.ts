import { AuditLogEvent, Client } from "discord.js";
import { DiscordArgsOf, DiscordOn } from "../../types";
import { Event } from "../eventCreator";

class EventGuildBanRemove extends Event<"memberBanUpdate"> {
  constructor(client: Client) {
    super(client);
  }

  @DiscordOn({ event: "guildBanRemove" })
  async registerEvent([ban]: DiscordArgsOf<"guildBanRemove">) {
    const auditLog = await ban.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.MemberBanRemove,
    });
    const auditLogEntry = auditLog.entries.first();
    const check = auditLogEntry?.target?.id === ban.user.id;

    this.emit({
      event: "unban",
      guildId: ban.guild.id,
      user: ban.user,
      staff: check ? auditLogEntry?.executor : null,
      reason: ban.reason ?? "Sem motivo",
    });
  }
}

export { EventGuildBanRemove };
