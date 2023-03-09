import { AuditLogEvent, Client } from "discord.js";
import { DiscordArgsOf, DiscordOn } from "../../types";
import { typeChannelText } from "../../utils/tools";
import { Event } from "../eventCreator";

class EventChannelDelete extends Event<"channelStateUpdate"> {
  constructor(client: Client) {
    super(client);
  }

  @DiscordOn({ event: "channelDelete" })
  async registerEvent([channel]: DiscordArgsOf<"channelDelete">) {
    if (channel.isDMBased()) return;

    const auditLog = await channel.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.ChannelDelete,
    });
    const auditLogEntry = auditLog.entries.first();
    if (!auditLogEntry) return null;

    this.emit({
      event: "delete",
      guildId: channel.guild.id,
      staff: auditLogEntry.executor ?? null,
      channel: {
        id: channel.id,
        name: channel.name,
        type: typeChannelText(channel.type),
        category: {
          id: channel.parent?.id ?? "null",
          name: channel.parent?.name ?? "uncategorized",
        },
        createdTimestamp: channel.createdTimestamp / 1000,
      },
    });
  }
}

export { EventChannelDelete };
