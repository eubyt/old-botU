import { AuditLogEvent, Client } from "discord.js";
import { DiscordArgsOf, DiscordOn } from "../../types";
import { Event } from "../eventCreator";

class EventGuildMemberTimeout extends Event<"memberBanUpdate"> {
  constructor(client: Client) {
    super(client);
  }

  @DiscordOn({ event: "guildMemberUpdate" })
  async registerEvent([oldMember, member]: DiscordArgsOf<"guildMemberUpdate">) {
    if (
      member.communicationDisabledUntil === oldMember.communicationDisabledUntil
    )
      return;

    const possibleTimeout = await member.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.MemberUpdate,
    });
    const auditLogEntryTimeout = possibleTimeout.entries.first();
    const checkTimeout = auditLogEntryTimeout?.target?.id === member.user.id;

    if (
      checkTimeout &&
      Date.now() - auditLogEntryTimeout.createdTimestamp < 5000 &&
      (member.communicationDisabledUntil ||
        oldMember.communicationDisabledUntil)
    ) {
      const expirationDate =
        member.communicationDisabledUntilTimestamp ??
        oldMember.communicationDisabledUntilTimestamp ??
        0;

      this.emit({
        event: member.communicationDisabledUntil ? "timeout" : "untimeout",
        guildId: member.guild.id,
        user: member.user,
        staff: auditLogEntryTimeout.executor,
        reason: auditLogEntryTimeout.reason ?? "Sem motivo",
        expiration: expirationDate / 1000,
      });
    }
  }
}

export { EventGuildMemberTimeout };
