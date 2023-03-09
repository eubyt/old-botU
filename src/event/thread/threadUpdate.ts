import { AuditLogEvent, ChannelType, Client } from "discord.js";
import { DiscordArgsOf, DiscordOn } from "../../types";
import { Event } from "../eventCreator";

class EventThreadUpdate extends Event<"threadStateUpdate"> {
  constructor(client: Client) {
    super(client);
  }

  @DiscordOn({ event: "threadUpdate" })
  async registerEvent([oldThread, newThread]: DiscordArgsOf<"threadUpdate">) {
    const isPublic = (type: ChannelType) =>
      type === ChannelType.PublicThread ? "public_thread" : "private_thread";
    const author = newThread.guild.members.cache.get(newThread.ownerId ?? "");

    if (!newThread.parentId || !author) {
      return;
    }

    const auditLog = await newThread.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.ThreadUpdate,
    });
    const auditLogEntry = auditLog.entries.first();
    const check =
      auditLogEntry?.target.id === newThread.id &&
      auditLogEntry?.target.ownerId !== newThread.ownerId;

    this.emit({
      event: "update",
      guildId: newThread.guild.id,
      thread: {
        id: newThread.id,
        name: newThread.name,
        type: isPublic(newThread.type),
        archived: newThread.archived ?? false,
        locked: newThread.locked ?? false,
        autoArchiveDuration: newThread.autoArchiveDuration ?? 0,
        rateLimitPerUser: newThread.rateLimitPerUser ?? 0,
        createdTimestamp: (newThread.createdTimestamp ?? 0) / 1000,
      },
      oldThread: {
        id: oldThread.id,
        name: oldThread.name,
        type: isPublic(oldThread.type),
        archived: oldThread.archived ?? false,
        locked: oldThread.locked ?? false,
        autoArchiveDuration: oldThread.autoArchiveDuration ?? 0,
        rateLimitPerUser: oldThread.rateLimitPerUser ?? 0,
        createdTimestamp: (oldThread.createdTimestamp ?? 0) / 1000,
      },
      author,
      staff: check ? auditLogEntry?.executor : null,
      channel: {
        id: newThread.parentId,
        name: newThread.parent?.name ?? "Unknown",
      },
    });
  }
}

export { EventThreadUpdate };
