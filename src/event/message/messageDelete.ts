import { AuditLogEvent, Client } from "discord.js";
import { DiscordArgsOf, DiscordOn } from "../../types";
import { splitMessage } from "../../utils/tools";
import { Event } from "../eventCreator";

class EventMessageDelete extends Event<"messageStateUpdate"> {
  constructor(client: Client) {
    super(client);
  }

  @DiscordOn({ event: "messageDelete" })
  async registerEvent([message]: DiscordArgsOf<"messageDelete">) {
    if (!message.author || !message.guild) return;

    const auditLog = await message.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.MessageDelete,
    });
    const auditLogEntry = auditLog.entries.first();
    const check = auditLogEntry?.target?.id === message.author.id;

    this.emit({
      event: "delete",
      guildId: message.guildId || "",
      message: {
        id: message.id,
        content: splitMessage(message.content || "null"),
        channel: message.channel.id,
        createdTimestamp: message.createdTimestamp / 1000,
      },
      staff: check ? auditLogEntry?.executor ?? null : null,
      author: message.author,
    });
  }
}

export { EventMessageDelete };
