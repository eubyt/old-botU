import { Client } from "discord.js";
import { getGuildData } from "../../guildData";
import { EVENT_RESPONSE } from "../../types";
import { Color } from "../../utils/color";

async function LoggerMemberGuildRegister(
    client: Client,
    data: EVENT_RESPONSE["memberGuildUpdate"]
) {
    const dataGuild = getGuildData(data.guildId, client);
    const guild = client.guilds.cache.get(data.guildId);
    if (!guild) {
        console.error("Guild not found!");
        return;
    }

    if (!dataGuild) {
        console.error("Guild data not found!");
        return;
    }

    const logChannel = dataGuild.getLoggerChannels().memberJoinLeaveLog;
    if (!logChannel) return;

    let embed: {
        embeds: any[];
    } = {
        embeds: [
            {
                title: "Member Log",
                description: "",
                timestamp: new Date().toISOString(),
                color: Color.EMBED_TRANSPARENT,
                author: {
                    name: data.user.tag,
                    icon_url: data.user.avatarURL() || undefined,
                },
                fields: Array(),
            },
        ],
    };

    switch (data.event) {
        case "join":
            const user = await guild.members.fetch(data.user.id);
            const flags = (await data.user.fetchFlags()).toArray();

            embed.embeds[0].title = "Member Joined";
            embed.embeds[0].description = `<@${data.user.id}> entrou no servidor e foi convidado por <@${data.invite?.user?.id}>.`;
            embed.embeds[0].timestamp = user.joinedAt?.toISOString();
            embed.embeds[0].thumbnail = {
                url: data.user.avatarURL() || undefined,
            };

            embed.embeds[0].fields.push(
                {
                    name: "> ID",
                    value:
                        "```swift\n" +
                        `User = ${data.user.id}\n` +
                        `Invite = ${data.invite?.id}\n` +
                        `Channel = ${data.invite?.channelId}` +
                        "```",
                },
                {
                    name: "Invite Code",
                    value: `${data.invite?.code ?? "Nenhum"}`,
                    inline: true,
                },
                {
                    name: "Usos",
                    value: `${data.invite?.uses ?? "Nenhum"}`,
                    inline: true,
                },
                {
                    name: "> Usuário criado em",
                    value: `<t:${(data.user.createdTimestamp / 1000).toFixed(
                        0
                    )}> (<t:${(data.user.createdTimestamp / 1000).toFixed(
                        0
                    )}:R>)`,
                },
                {
                    name: "> Canal de Entrada",
                    value: `<#${data.invite?.channelId}>`,
                }
            );

            if (flags.length > 0) {
                embed.embeds[0].fields.push({
                    name: "> Flags",
                    value: "```swift\n" + flags.join("\n") + "```",
                });
            }

            break;
        case "kick":
            embed.embeds[0].title = "Member Kicked";
            embed.embeds[0].description = `${data.user.tag} foi expulso do servidor por ${data.staff?.tag}.`;
            embed.embeds[0].thumbnail = {
                url: data.user.avatarURL() || undefined,
            };
            embed.embeds[0].fields.push(
                {
                    name: "> ID",
                    value: "```swift\n" + `User = ${data.user.id}` + "```",
                },
                {
                    name: "> Usuário criado em",
                    value: `<t:${(data.user.createdTimestamp / 1000).toFixed(
                        0
                    )}>`,
                }
            );
            break;
        case "leave":
            embed.embeds[0].title = "Member Left";
            embed.embeds[0].description = `${data.user.tag} saiu do servidor.`;
            embed.embeds[0].thumbnail = {
                url: data.user.avatarURL() || undefined,
            };
            embed.embeds[0].fields.push(
                {
                    name: "> ID",
                    value: "```swift\n" + `User = ${data.user.id}` + "```",
                },
                {
                    name: "> Usuário criado em",
                    value: `<t:${(data.user.createdTimestamp / 1000).toFixed(
                        0
                    )}>`,
                },
                {
                    name: "> Membro desde",
                    value: `<t:${(data.joinedAt!.getTime() / 1000).toFixed(
                        0
                    )}>`,
                }
            );
            break;
        case "update":
            if (!data.oldUser) return;
            const guildMember = await guild.members.fetch(data.user.id);
            const oldGuildMember = await guild.members.fetch(data.oldUser.id);

            embed.embeds[0].title = "Member Updated";
            embed.embeds[0].thumbnail = {
                url: data.user.avatarURL() || undefined,
            };
            embed.embeds[0].fields.push({
                name: "> ID",
                value: "```swift\n" + `User = ${data.user.id}` + "```",
            });

            if (guildMember.nickname !== oldGuildMember.nickname) {
                embed.embeds[0].description = `${data.user.tag} alterou seu nickname.`;
                embed.embeds[0].fields.push(
                    {
                        name: "> Nickname",
                        value:
                            "``" + `${guildMember.nickname ?? "Nenhum"}` + "``",
                    },
                    {
                        name: "> Nickname Antigo",
                        value:
                            "``" +
                            `${oldGuildMember.nickname ?? "Nenhum"}` +
                            "``",
                    }
                );
            }

            if (
                guildMember.roles.cache.size !== oldGuildMember.roles.cache.size
            ) {
                embed.embeds[0].description = `${data.user.tag} alterou seus cargos.`;

                const rolesAdded = guildMember.roles.cache.filter(
                    (role) => !oldGuildMember.roles.cache.has(role.id)
                );
                const rolesRemoved = oldGuildMember.roles.cache.filter(
                    (role) => !guildMember.roles.cache.has(role.id)
                );

                if (rolesAdded.size > 0) {
                    embed.embeds[0].fields.push({
                        name: "> Cargos Adicionados",
                        value:
                            "```diff\n" +
                            `+ ${rolesAdded
                                .map((r) => `${r.name} (${r.id})`)
                                .join("\n+ ")}` +
                            "```",
                    });
                }

                if (rolesRemoved.size > 0) {
                    embed.embeds[0].fields.push({
                        name: "> Cargos Removidos",
                        value:
                            "```diff\n" +
                            `- ${rolesRemoved
                                .map((r) => `${r.name} (${r.id})`)
                                .join("\n- ")}` +
                            "```",
                    });
                }
            }

            if (data.user.username !== data.oldUser.username) {
                embed.embeds[0].description = `${data.user.tag} alterou seu username.`;
                embed.embeds[0].fields.push(
                    {
                        name: "> Username",
                        value: "``" + `${data.user.username}` + "``",
                    },
                    {
                        name: "> Username Antigo",
                        value: "``" + `${data.oldUser.username}` + "``",
                    }
                );
            }

            if (data.user.discriminator !== data.oldUser.discriminator) {
                embed.embeds[0].description = `${data.user.tag} alterou seu discriminator.`;
                embed.embeds[0].fields.push(
                    {
                        name: "> Discriminator",
                        value: "``" + `${data.user.discriminator}` + "``",
                    },
                    {
                        name: "> Discriminator Antigo",
                        value: "``" + `${data.oldUser.discriminator}` + "``",
                    }
                );
            }

            if (data.user.avatar !== data.oldUser.avatar) {
                embed.embeds[0].description = `${data.user.tag} alterou seu avatar.`;
                embed.embeds[0].image = {
                    url: data.user.avatarURL() || undefined,
                };

                if (data.oldUser.avatar) {
                    embed.embeds[0].thumbnail = {
                        url: data.oldUser.avatarURL() || undefined,
                    };
                }
            }

            break;
    }

    logChannel.send(embed);
}

export { LoggerMemberGuildRegister };
