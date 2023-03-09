import { AuditLogEvent, ChannelType, Client } from "discord.js";
import { DiscordArgsOf, DiscordOn } from "../../types";
import { Event } from "../eventCreator";

class EventThreadCreate extends Event<"threadStateUpdate"> {
  constructor(client: Client) {
    super(client);
  }

  @DiscordOn({ event: "threadCreate" })
  registerEvent([thread]: DiscordArgsOf<"threadCreate">) {
    const isPublic = thread.type === ChannelType.PublicThread;
    const author = thread.guild.members.cache.get(thread.ownerId ?? "");

    if (!thread.parentId || !author) {
      return;
    }

    this.emit({
      event: "create",
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
      author,
      channel: {
        id: thread.parentId,
        name: thread.parent?.name ?? "Unknown",
      },
    });
  }
}

export { EventThreadCreate };
