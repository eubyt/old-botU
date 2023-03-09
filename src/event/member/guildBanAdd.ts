import { AuditLogEvent, Client } from "discord.js";
import { DiscordArgsOf, DiscordOn } from "../../types";
import { Event } from "../eventCreator";

class EventGuildBanAdd extends Event<"memberBanUpdate"> {
  constructor(client: Client) {
    super(client);
  }

  @DiscordOn({ event: "guildBanAdd" })
  async registerEvent([ban]: DiscordArgsOf<"guildBanAdd">) {
    const auditLog = await ban.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.MemberBanAdd,
    });
    const auditLogEntry = auditLog.entries.first();
    const check = auditLogEntry?.target?.id === ban.user.id;

    this.emit({
      event: "ban",
      guildId: ban.guild.id,
      user: ban.user,
      staff: check ? auditLogEntry?.executor : null,
      reason: ban.reason ?? "Sem motivo",
    });
  }
}

export { EventGuildBanAdd };
