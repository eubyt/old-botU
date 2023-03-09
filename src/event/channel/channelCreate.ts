import { AuditLogEvent, Client } from "discord.js";
import { DiscordArgsOf, DiscordOn } from "../../types";
import { typeChannelText } from "../../utils/tools";
import { Event } from "../eventCreator";

class EventChannelCreate extends Event<"channelStateUpdate"> {
  constructor(client: Client) {
    super(client);
  }

  @DiscordOn({ event: "channelCreate" })
  async registerEvent([channel]: DiscordArgsOf<"channelCreate">) {
    const auditLog = await channel.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.ChannelCreate,
    });
    const auditLogEntry = auditLog.entries.first();
    if (!auditLogEntry) return null;

    this.emit({
      event: "create",
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

export { EventChannelCreate };
