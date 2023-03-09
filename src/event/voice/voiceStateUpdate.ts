import { AuditLogEvent, Client } from "discord.js";
import { DiscordArgsOf, DiscordOn } from "../../types";
import { Event } from "../eventCreator";

class EventVoiceStateUpdate extends Event<"voiceStateUpdate"> {
  constructor(client: Client) {
    super(client);
  }

  @DiscordOn({ event: "voiceStateUpdate" })
  async registerEvent([oldState, newState]: DiscordArgsOf<"voiceStateUpdate">) {
    if (oldState.channel && !newState.channel) {
      if (!oldState.member) {
        throw new Error("Invalid oldState");
      }

      this.emit({
        event: "leave",
        guildId: oldState.guild.id,
        user: oldState.member.user,
        voiceChannel: {
          id: oldState.channel.id,
          name: oldState.channel.name,
        },
      });
      return;
    }

    if (!oldState.channel && newState.channel) {
      if (!newState.member) {
        throw new Error("Invalid newState");
      }

      this.emit({
        event: "join",
        guildId: newState.guild.id,
        user: newState.member.user,
        voiceChannel: {
          id: newState.channel.id,
          name: newState.channel.name,
        },
      });
      return;
    }

    if (
      oldState.channel &&
      newState.channel &&
      oldState.channel.id !== newState.channel.id
    ) {
      if (!newState.member) {
        throw new Error("Invalid newState");
      }

      const auditLog = await newState.guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MemberMove,
      });

      const auditLogEntry = auditLog.entries.first();
      const check = auditLogEntry?.target?.id === newState.member.user.id;

      this.emit({
        event: "switch",
        guildId: newState.guild.id,
        user: newState.member.user,
        staff: check ? auditLogEntry?.executor : null,
        voiceChannel: {
          id: newState.channel.id,
          name: newState.channel.name,
        },
        oldVoiceChannel: {
          id: oldState.channel.id,
          name: oldState.channel.name,
        },
      });
      return;
    }

    if (
      oldState.mute !== newState.mute &&
      oldState.channel &&
      newState.channel
    ) {
      if (!newState.member) {
        throw new Error("Invalid newState");
      }

      const auditLog = await newState.guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MemberUpdate,
      });

      const auditLogEntry = auditLog.entries.first();
      const check =
        auditLogEntry?.target?.id === newState.member.user.id &&
        !newState.selfMute &&
        !oldState.selfMute;

      console.log(newState.selfMute);

      this.emit({
        event: "mute",
        guildId: newState.guild.id,
        user: newState.member.user,
        staff: check ? auditLogEntry?.executor : null,
        voiceChannel: {
          id: newState.channel.id,
          name: newState.channel.name,
          muted: newState.mute ?? false,
        },
      });
      return;
    }

    if (
      oldState.deaf !== newState.deaf &&
      oldState.channel &&
      newState.channel
    ) {
      if (!newState.member) {
        throw new Error("Invalid newState");
      }

      const auditLog = await newState.guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MemberUpdate,
      });

      const auditLogEntry = auditLog.entries.first();
      const check =
        auditLogEntry?.target?.id === newState.member.user.id &&
        !newState.selfDeaf &&
        !oldState.selfDeaf;

      this.emit({
        event: "deaf",
        guildId: newState.guild.id,
        user: newState.member.user,
        staff: check ? auditLogEntry?.executor : null,
        voiceChannel: {
          id: newState.channel.id,
          name: newState.channel.name,
          deafened: newState.deaf ?? false,
        },
      });
      return;
    }

    if (
      oldState.streaming !== newState.streaming &&
      oldState.channel &&
      newState.channel
    ) {
      if (!newState.member) {
        throw new Error("Invalid newState");
      }

      this.emit({
        event: "stream",
        guildId: newState.guild.id,
        user: newState.member.user,
        voiceChannel: {
          id: newState.channel.id,
          name: newState.channel.name,
          streaming: newState.streaming ?? false,
        },
      });
      return;
    }
  }
}

export { EventVoiceStateUpdate };
