import { Client, GatewayIntentBits, Events, Partials } from "discord.js";
import { DISCORD_BOT_TOKEN } from "./environment";
import { getGuildData } from "./guildData";
import { DiscordEvent } from "./types";
import {
    EventChannelCreate,
    EventChannelDelete,
    EventChannelPinsUpdate,
    EventChannelUpdate,
    EventGuildBanAdd,
    EventGuildBanRemove,
    EventGuildMemberAdd,
    EventGuildMemberRemove,
    EventGuildMemberTimeout,
    EventInviteCreate,
    EventInviteDelete,
    EventMessageDelete,
    EventMessageUpdate,
    EventThreadCreate,
    EventThreadDelete,
    EventThreadUpdate,
    EventVoiceStateUpdate,
} from "./event";
import {
    InviteTrackRegister,
    LoggerBanRegister,
    LoggerChannelRegister,
    LoggerMemberGuildRegister,
    LoggerMessageRegister,
    LoggerThreadRegister,
    LoggerVoiceRegister,
    MemberGuildAddRoleRegister,
    PresenceEdit,
    PublicLoggerBanRegister,
    PublicLoggerMemberGuildRegister,
    VoiceSecurityRegister,
} from "./modules";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildScheduledEvents,
        GatewayIntentBits.GuildVoiceStates,
    ],
    partials: [
        Partials.User,
        Partials.Channel,
        Partials.GuildMember,
        Partials.Message,
        Partials.Reaction,
        Partials.GuildScheduledEvent,
        Partials.ThreadMember,
    ],
});

// Configs
const BOT_DISCORD_PRESENCE_INTERVAL = 60;

function registerOnDiscord(eventClass: DiscordEvent) {
    const data = Reflect.getMetadata("discord:on", eventClass, "registerEvent");

    if (!data) {
        throw new Error("Invalid event");
    }

    client.on(data.event, (...args: any[]) => {
        eventClass.registerEvent([...args]);
    });
}

function registerEvent(
    eventClass: DiscordEvent,
    callback: Function[] | Function
) {
    if (Array.isArray(callback)) {
        callback.forEach((c) => eventClass.addCallback(c));
    } else {
        eventClass.addCallback(callback);
    }
    registerOnDiscord(eventClass);
}

client.once(Events.ClientReady, () => {
    console.log("Discord bot is ready!");

    client.guilds.cache.forEach((guild) => {
        console.log(`Guild: ${guild.name} (${guild.id})`);
        getGuildData(guild.id, client);
    });

    // Register Voice Event
    registerEvent(new EventVoiceStateUpdate(client), [
        LoggerVoiceRegister,
        VoiceSecurityRegister,
    ]);

    // Thread Event
    registerEvent(new EventThreadDelete(client), LoggerThreadRegister);
    registerEvent(new EventThreadCreate(client), LoggerThreadRegister);
    registerEvent(new EventThreadUpdate(client), LoggerThreadRegister);

    // Register Channel Event
    registerEvent(new EventChannelCreate(client), LoggerChannelRegister);
    registerEvent(new EventChannelDelete(client), LoggerChannelRegister);
    registerEvent(new EventChannelUpdate(client), LoggerChannelRegister);
    registerEvent(new EventChannelPinsUpdate(client), LoggerChannelRegister);

    // Register Message Event
    registerEvent(new EventMessageUpdate(client), LoggerMessageRegister);
    registerEvent(new EventMessageDelete(client), LoggerMessageRegister);

    // Join and Leave Guild
    registerEvent(new EventGuildMemberAdd(client), [
        LoggerMemberGuildRegister,
        MemberGuildAddRoleRegister,
        PublicLoggerMemberGuildRegister,
    ]);
    registerEvent(new EventGuildMemberRemove(client), [
        LoggerMemberGuildRegister,
        PublicLoggerMemberGuildRegister,
    ]);

    // Register Invite Event
    registerEvent(new EventInviteCreate(client), InviteTrackRegister);
    registerEvent(new EventInviteDelete(client), InviteTrackRegister);

    // Register Ban Event
    registerEvent(new EventGuildBanAdd(client), [
        LoggerBanRegister,
        PublicLoggerBanRegister,
    ]);
    registerEvent(new EventGuildBanRemove(client), [
        LoggerBanRegister,
        PublicLoggerBanRegister,
    ]);
    registerEvent(new EventGuildMemberTimeout(client), [
        LoggerBanRegister,
        PublicLoggerBanRegister,
    ]);
});

async function start() {
    await client.login(DISCORD_BOT_TOKEN);

    // Discord Presence
    setInterval(
        () => PresenceEdit(client, "simple"),
        BOT_DISCORD_PRESENCE_INTERVAL * 1000
    );
}

export default {
    start,
};
