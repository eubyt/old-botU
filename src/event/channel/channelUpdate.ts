import {
  Client,
  ChannelType,
  Channel,
  CategoryChannel,
  TextChannel,
  AuditLogEvent,
} from "discord.js";
import { DiscordArgsOf, DiscordOn, EVENT_RESPONSE } from "../../types";
import { bitfieldToArray, typeChannelText } from "../../utils/tools";
import { Event } from "../eventCreator";

class EventChannelUpdate extends Event<"channelStateUpdate"> {
  constructor(client: Client) {
    super(client);
  }

  @DiscordOn({ event: "channelUpdate" })
  async registerEvent([oldChannel, channel]: DiscordArgsOf<"channelUpdate">) {
    if (channel.isDMBased() || oldChannel.isDMBased()) return;

    const auditLog = await channel.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.ChannelUpdate,
    });
    const auditLogEntry = auditLog.entries.first();
    if (!auditLogEntry) return null;

    let response: EVENT_RESPONSE["channelStateUpdate"] = {
      event: "update",
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
      oldChannel: {
        id: oldChannel.id,
        name: oldChannel.name,
        type: typeChannelText(oldChannel.type),
        category: {
          id: oldChannel.parent?.id ?? "null",
          name: oldChannel.parent?.name ?? "uncategorized",
        },
        createdTimestamp: channel.createdTimestamp / 1000,
      },
    };

    if (
      channel.isTextBased() &&
      !channel.isVoiceBased() &&
      oldChannel.isTextBased() &&
      !oldChannel.isVoiceBased()
    ) {
      response.channel.rateLimitPerUser = channel.rateLimitPerUser ?? 0;
      response.channel.topic = channel.topic ?? "null";
      response.channel.nsfw = channel.nsfw ?? false;
      if (response.oldChannel) {
        response.oldChannel.rateLimitPerUser = oldChannel.rateLimitPerUser ?? 0;
        response.oldChannel.topic = oldChannel.topic ?? "null";
        response.oldChannel.nsfw = oldChannel.nsfw ?? false;
      }
    }

    if (oldChannel.permissionOverwrites !== channel.permissionOverwrites) {
      const newPermissions = channel.permissionOverwrites.cache;
      const oldPermissions = oldChannel.permissionOverwrites.cache;

      response.permissionsChange = newPermissions
        .map((newPermission) => {
          const allow = bitfieldToArray(newPermission.allow.bitfield).filter(
            (permission) => {
              const oldPermission = oldPermissions.get(newPermission.id);
              if (!oldPermission) return true;
              const old = bitfieldToArray(oldPermission.allow.bitfield);
              return !old.includes(permission);
            }
          );

          const deny = bitfieldToArray(newPermission.deny.bitfield).filter(
            (permission) => {
              const oldPermission = oldPermissions.get(newPermission.id);
              if (!oldPermission) return true;
              const old = bitfieldToArray(oldPermission.deny.bitfield);
              return !old.includes(permission);
            }
          );

          return {
            id: newPermission.id,
            type: newPermission.type,
            allow,
            deny,
          };
        })
        .filter(
          (permission) =>
            permission.allow.length > 0 || permission.deny.length > 0
        );
    }

    this.emit(response);
  }
}

export { EventChannelUpdate };
