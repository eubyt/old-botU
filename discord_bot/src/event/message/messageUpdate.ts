import { AuditLogEvent, Client } from "discord.js";
import { DiscordArgsOf, DiscordOn } from "../../types";
import { splitMessage } from "../../utils/tools";
import { Event } from "../eventCreator";

class EventMessageUpdate extends Event<"messageStateUpdate"> {
  constructor(client: Client) {
    super(client);
  }

  @DiscordOn({ event: "messageUpdate" })
  async registerEvent([
    oldMessage,
    newMessage,
  ]: DiscordArgsOf<"messageUpdate">) {
    if (!newMessage.author || !newMessage.guild) return;

    if (newMessage.pinned || oldMessage.pinned) {
      const auditLog = await newMessage.guild.fetchAuditLogs({
        limit: 1,
        type: newMessage.pinned
          ? AuditLogEvent.MessagePin
          : AuditLogEvent.MessageUnpin,
      });

      const auditLogEntry = auditLog.entries.first();
      const check = auditLogEntry?.target?.id === newMessage.author.id;

      this.emit({
        event: newMessage.pinned ? "pin" : "unpin",
        guildId: newMessage.guild?.id || "null",
        author: newMessage.author || null,
        staff: check ? auditLogEntry?.executor : null,
        message: {
          id: newMessage.id,
          content: splitMessage(newMessage.content || "null"),
          channel: newMessage.channel.id,
          createdTimestamp: newMessage.createdTimestamp / 1000,
        },
      });
      return;
    }

    if (oldMessage.content === newMessage.content) return;

    this.emit({
      event: "update",
      guildId: newMessage.guild?.id || "null",
      message: {
        id: newMessage.id,
        content: splitMessage(newMessage.content || "null"),
        channel: newMessage.channel.id,
        createdTimestamp: newMessage.createdTimestamp / 1000,
      },
      oldMessage: {
        id: oldMessage.id,
        content: splitMessage(oldMessage.content || "null"),
        channel: oldMessage.channel.id,
        createdTimestamp: oldMessage.createdTimestamp / 1000,
      },
      author: newMessage.author,
    });
  }
}

export { EventMessageUpdate };
