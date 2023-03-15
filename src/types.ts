import {
    ButtonStyle,
    ClientEvents,
    ComponentEmojiResolvable,
    GuildMember,
    User,
} from "discord.js";
import "reflect-metadata";
import { Color } from "./utils/color";

export type ModelGuildData = {
    name: string;
    id: string;
    channelLog: {
        [key: string]: string;
    };
    config: {
        [key: string]: any;
    };
    templateMessage: MessageData[] | null;
    channelMessage:
        | {
              channelId: string;
              messageId: string;
              templateId: string;
          }[]
        | null;
    createdAt: Date;
    updatedAt: Date;
};

export type MessageData = {
    id: string;
    content?: string;
    ephemeral?: boolean;
    embeds?: {
        title?: string;
        description?: string;
        timestamp?: string;
        color?: keyof typeof Color | number;
    }[];
    components?: {
        type: "button" | "select";
        color?: keyof typeof ButtonStyle;
        label: string;
        emoji?: ComponentEmojiResolvable;
        customId: string;
        options?: {
            label: string;
            description: string;
            value: string;
            emoji?: string;
        }[];
    }[];
};

export type PresenceType = "memberCount" | "simple";
export type DiscordArgsOf<K extends keyof ClientEvents> = ClientEvents[K];
export type ChannelTypeText =
    | "text"
    | "voice"
    | "category"
    | "news"
    | "store"
    | "forum"
    | "unknown";

export function DiscordOn(data: {
    event: keyof ClientEvents;
    guildId?: string;
}) {
    return function (target: any, key: string) {
        Reflect.defineMetadata("discord:on", data, target, key);
    };
}

export interface DiscordEvent {
    registerEvent(args: any[]): void;
    addCallback(callback: Function): void;
}

type Channel = {
    id: string;
    name: string;
    type: ChannelTypeText;
    topic?: string;
    rateLimitPerUser?: number;
    nsfw?: boolean;
    category: {
        id: string;
        name: string;
    };
    time?: Date;
    createdTimestamp: number;
};

type Thread = {
    id: string;
    name: string;
    type: "public_thread" | "private_thread";
    archived: boolean;
    autoArchiveDuration: number;
    locked: boolean;
    rateLimitPerUser: number;
    createdTimestamp: number;
};

export interface EVENT_RESPONSE {
    presenceUpdate: {
        activity: "none" | "twitch";
        guildId: string;
        user: User;
    };
    interactionUpdate: {
        event: "addRole" | "switchRole" | "sendMessage";
        args: string[];
        guildId: string;
        user: User;
        reply: Function | null;
    };
    memberBanUpdate: {
        event: "ban" | "unban" | "timeout" | "untimeout";
        guildId: string;
        user: User | null;
        staff?: User | null;
        expiration?: number;
        reason: string;
    };
    inviteUpdate: {
        event: "create" | "delete" | "update";
        guildId: string;
        user: User | null;
        invite: {
            id: string;
            channel: string | null;
            code: string;
            uses: number;
        } | null;
    };
    memberGuildUpdate: {
        event: "join" | "leave" | "update" | "kick";
        guildId: string;
        user: User;
        oldUser?: User;
        staff?: User | null;
        joinedAt: Date | null;
        invite: {
            id: string;
            code: string;
            uses: number;
            user: User | null;
            channelId: string;
        } | null;
    };
    messageStateUpdate: {
        event: "create" | "delete" | "update" | "pin" | "unpin";
        guildId: string;
        message: {
            id: string;
            content: string[];
            channel: string;
            createdTimestamp: number;
        };
        oldMessage?: {
            id: string;
            content: string[];
            channel: string;
            createdTimestamp: number;
        };
        staff?: User | null;
        author: User;
    };
    channelStateUpdate: {
        event: "create" | "delete" | "update";
        guildId: string;
        permissionsChange?: any[];
        staff?: User | null;
        channel: Channel;
        oldChannel?: Channel;
    };
    threadStateUpdate: {
        event: "create" | "delete" | "update";
        guildId: string;
        thread: Thread;
        oldThread?: Thread;
        channel: {
            id: string;
            name: string;
        };
        staff?: User | null;
        author: GuildMember;
    };
    voiceStateUpdate: {
        event: "leave" | "join" | "switch" | "mute" | "deaf" | "stream";
        guildId: string;
        user: User;
        staff?: User | null;
        voiceChannel: {
            id: string;
            name: string;
            muted?: boolean;
            deafened?: boolean;
            streaming?: boolean;
        };
        oldVoiceChannel?: {
            id: string;
            name: string;
        };
    };
}
