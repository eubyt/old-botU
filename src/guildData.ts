import {
    ChannelType,
    Client,
    PrivateThreadChannel,
    PublicThreadChannel,
    TextChannel,
    User,
} from "discord.js";
import { getFirestore } from "firebase-admin/firestore";
import { firebaseApp } from "./main";
import { sendMessageToChannel } from "./modules/messages/messageUtil";
import { ModelGuildData } from "./types";

const cacheData = new Map<string, GuildData>();

class GuildData {
    private invites = new Array<{
        id: string;
        code: string;
        uses: number;
        user: User | null;
        channelId: string;
    }>();

    public NOTIFICATIONS = new Array();

    private documentGuild: ModelGuildData = {
        name: "",
        id: "",
        channelLog: {
            messageLog: "1083013796110549082",
            channelLog: "1083016535553089546",
            threadLog: "1083016962872971284",
            voiceLog: "1083017397558055032",
            memberJoinLeaveLog: "1083012305412964412",
            memberJoinLeaveLog_public: "",
            banLog: "1083017865994706985",
            banLog_public: "1083401204278763572",
        },
        config: {
            notifications: {},
            security: {
                protectChannelVoice: false,
                antiDiscordInvite: false,
            },
            autorole: {
                memberGuildAddRole: null,
                twitchSteamerRole: null,
            },
        },
        templateMessage: [],
        channelMessage: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    constructor(guildId: string, readonly client: Client) {
        this.client = client;

        this.documentGuild.name =
            client.guilds.cache.get(guildId)?.name ?? "Null";
        this.documentGuild.id = guildId;

        this.loadingInvites();
        this.loadingDocument();
    }

    async loadingDocument() {
        const db = getFirestore(firebaseApp);

        const doc = await db
            .collection("guilds")
            .doc(this.documentGuild.id)
            .get();

        if (!doc.exists) {
            // Create guild in database
            db.collection("guilds")
                .doc(this.documentGuild.id)
                .set(this.documentGuild);
            console.log(
                this.documentGuild.id,
                "not found in database, created!"
            );
        } else {
            // Check old data
            const data = doc.data() as typeof this.documentGuild;
            if (
                Object.keys(data).length !==
                Object.keys(this.documentGuild).length
            ) {
                console.log(this.documentGuild.id, "has old data, updating...");

                /// TODO: Refactor this
                Object.keys(this.documentGuild).forEach((key) => {
                    if (data[key as keyof typeof this.documentGuild]) {
                        this.documentGuild[
                            key as keyof typeof this.documentGuild
                        ] = data[key as keyof typeof this.documentGuild] as any;
                    }
                });

                this.documentGuild.updatedAt = new Date();
                this.uploadDocument();
            } else {
                this.documentGuild = data;
                console.log(this.documentGuild.id, "found in database!");

                // sendMessageToChannel(
                //     this.client,
                //     this.documentGuild.id,
                //     "1064082148765732947",
                //     "selfRole"
                // );
            }
        }
    }

    async uploadDocument() {
        const db = getFirestore(firebaseApp);
        const doc = db.collection("guilds").doc(this.documentGuild.id);

        this.documentGuild.updatedAt = new Date();
        await doc.set(this.documentGuild);
    }

    async loadingInvites() {
        const guild = this.client.guilds.cache.get(this.documentGuild.id);
        if (!guild) return;

        const guildInvites = await guild.invites.fetch();

        this.invites = guildInvites.map((invite) => ({
            id: invite.inviterId ?? "null",
            code: invite.code,
            uses: invite.uses ?? 0,
            user: invite.inviter,
            channelId: invite.channelId ?? "null",
        }));
    }

    async getInviteNewUse() {
        const oldInvites = this.invites;
        await this.loadingInvites(); // Load new invites

        const invite = this.invites.find((newInvite) => {
            const oldInvite = oldInvites.find(
                (oldInvite) => oldInvite.code === newInvite.code
            );

            if (!oldInvite) return null;
            return newInvite.uses > oldInvite.uses;
        });

        return invite;
    }

    getInvites() {
        return this.invites;
    }

    getMessageTemplate(id: string) {
        return (
            this.documentGuild.templateMessage?.find(
                (template) => template.id === id
            ) ?? null
        );
    }

    getTemplateToChannel(templateId: string) {
        return (
            this.documentGuild.channelMessage?.find(
                (template) => template.templateId === templateId
            ) ?? null
        );
    }

    async removeTemplateToChannel(templateId: string, channelId: string) {
        if (!this.documentGuild.channelMessage) return;

        const index = this.documentGuild.channelMessage.findIndex(
            (template) =>
                template.templateId === templateId &&
                template.channelId === channelId
        );

        if (index === -1) return;

        this.documentGuild.channelMessage.splice(index, 1);
        await this.uploadDocument();
    }

    addTemplateToChannel(
        templateId: string,
        channelId: string,
        messageId: string
    ) {
        if (!this.documentGuild.channelMessage) {
            this.documentGuild.channelMessage = [];
        }

        this.documentGuild.channelMessage?.push({
            templateId,
            channelId,
            messageId,
        });

        this.uploadDocument();
    }

    getNotification(type: "twitch") {
        try {
            return this.documentGuild.config.notifications[type];
        } catch (e) {
            return null;
        }
    }

    private getChannel(id: string) {
        const channel = this.client.channels.cache.get(id);

        if (!channel) {
            console.error("Log channel not found!");
            return null;
        }

        if (
            channel.type === ChannelType.GuildText ||
            channel.type === ChannelType.PublicThread ||
            channel.type === ChannelType.PrivateThread
        )
            return channel;
        else {
            return null;
        }
    }

    getLoggerChannels(): {
        [key: string]:
            | TextChannel
            | PrivateThreadChannel
            | PublicThreadChannel<boolean>
            | null;
    } {
        return Object.keys(this.documentGuild.channelLog)
            .map((key) => {
                const channel = this.getChannel(
                    this.documentGuild.channelLog[
                        key as keyof typeof this.documentGuild.channelLog
                    ]
                );
                return { [key]: channel };
            })
            .reduce((a, b) => ({ ...a, ...b }));
    }

    getOptions() {
        return this.documentGuild.config;
    }
}

function getGuildData(guildId: string, client: Client) {
    if (cacheData.has(guildId)) {
        return cacheData.get(guildId);
    }

    const guildData = new GuildData(guildId, client);
    cacheData.set(guildId, guildData);
    return guildData;
}

function removeGuildData(guildId: string) {
    cacheData.delete(guildId);
}

export { getGuildData, removeGuildData };
