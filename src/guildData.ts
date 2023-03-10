import {
    Client,
    PrivateThreadChannel,
    PublicThreadChannel,
    User,
} from "discord.js";
import { getFirestore } from "firebase-admin/firestore";
import { firebaseApp } from "./main";

const cacheData = new Map<string, GuildData>();

class GuildData {
    private invites = new Array<{
        id: string;
        code: string;
        uses: number;
        user: User | null;
        channelId: string;
    }>();

    private documentGuild = {
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
            security: {
                protectChannelVoice: true,
                antiDiscordInvite: true,
            },
            autorole: {
                memberGuildAddRole: null,
            },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    constructor(guildId: string, public readonly client: Client) {
        this.client = client;

        this.documentGuild.name =
            client.guilds.cache.get(guildId)?.name ?? "Null";
        this.documentGuild.id = guildId;

        this.loadingInvites();

        const db = getFirestore(firebaseApp);

        db.collection("guilds")
            .doc(guildId)
            .get()
            .then((doc) => {
                if (!doc.exists) {
                    // Create guild in database
                    db.collection("guilds")
                        .doc(guildId)
                        .set(this.documentGuild);
                    console.log(guildId, "not found in database, created!");
                } else {
                    // Check old data
                    const data = doc.data() as typeof this.documentGuild;
                    if (
                        Object.keys(data).length !==
                        Object.keys(this.documentGuild).length
                    ) {
                        console.log(guildId, "has old data, updating...");

                        /// TODO: Refactor this
                        Object.keys(this.documentGuild).forEach((key) => {
                            if (data[key as keyof typeof this.documentGuild]) {
                                this.documentGuild[
                                    key as keyof typeof this.documentGuild
                                ] = data[
                                    key as keyof typeof this.documentGuild
                                ] as any;
                            }
                        });

                        this.documentGuild.updatedAt = new Date();
                        this.uploadDocument();
                    } else {
                        this.documentGuild = data;
                        console.log(guildId, "found in database!");
                    }
                }
            });
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

        console.log(oldInvites, this.invites);

        const invite = this.invites.find((newInvite) => {
            const oldInvite = oldInvites.find(
                (oldInvite) => oldInvite.code === newInvite.code
            );

            if (!oldInvite) return null;
            return newInvite.uses > oldInvite.uses;
        });

        return invite;
    }

    private getChannel(id: string) {
        const channel = this.client.channels.cache.get(id);

        if (!channel) {
            console.error("Log channel not found!");
            return null;
        }

        if (!channel.isThread() || !channel.isTextBased()) return null;
        if (channel.isDMBased()) return null;

        return channel;
    }

    getLoggerChannels(): {
        [key: string]:
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

async function getGuildData(guildId: string, client: Client) {
    if (cacheData.has(guildId)) {
        return cacheData.get(guildId);
    }

    const guildData = new GuildData(guildId, client);
    cacheData.set(guildId, guildData);
    return guildData;
}

export { getGuildData };
