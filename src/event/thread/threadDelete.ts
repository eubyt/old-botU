import { AuditLogEvent, ChannelType, Client } from "discord.js";
import { DiscordArgsOf, DiscordOn } from "../../types";
import { Event } from "../eventCreator";

class EventThreadDelete extends Event<"threadStateUpdate"> {
  constructor(client: Client) {
    super(client);
  }

  @DiscordOn({ event: "threadDelete" })
  async registerEvent([thread]: DiscordArgsOf<"threadDelete">) {
    const isPublic = thread.type === ChannelType.PublicThread;
    const author = thread.guild.members.cache.get(thread.ownerId ?? "");

    if (!thread.parentId || !author) {
      return;
    }

    const auditLog = await thread.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.ThreadDelete,
    });
    const auditLogEntry = auditLog.entries.first();

    this.emit({
      event: "delete",
      guildId: thread.guild.id,
      thread: {
        id: thread.id,
        name: thread.name,
        type: isPublic ? "public_thread" : "private_thread",
        archived: thread.archived ?? false,
        locked: thread.locked ?? false,
        autoArchiveDuration: thread.autoArchiveDuration ?? 0,
        rateLimitPerUser: thread.rateLimitPerUser ?? 0,
        createdTimestamp: (thread.createdTimestamp ?? 0) / 1000,
      },
      author: author,
      staff: auditLogEntry?.executor ?? null,
      channel: {
        id: thread.parentId,
        name: thread.parent?.name ?? "Unknown",
      },
    });
  }
}

export { EventThreadDelete };
