import { Client } from "discord.js";
import { getGuildData } from "../../guildData";
import { EVENT_RESPONSE } from "../../types";
import { Color } from "../../utils/color";

function LoggerThreadRegister(
    client: Client,
    data: EVENT_RESPONSE["threadStateUpdate"]
) {
    const dataGuild = getGuildData(data.guildId, client);

    if (!dataGuild) {
        console.error("Guild data not found!");
        return;
    }

    const logChannel = dataGuild.getLoggerChannels().threadLog;

    let embed: {
        embeds: any[];
    } = {
        embeds: [
            {
                title: "Thread Log",
                description: "",
                timestamp: new Date().toISOString(),
                color: Color.EMBED_TRANSPARENT,
                author: {
                    name: data.author.user.tag,
                    icon_url: data.author.user.avatarURL() || undefined,
                },
                fields: [
                    {
                        name: "> ID",
                        value:
                            "```swift\n" +
                            `Thread = ${data.thread.id}\n` +
                            `User = ${data.author.id}\n` +
                            `Channel = ${data.channel.id}\n` +
                            "```",
                    },
                    {
                        name: "> Canal",
                        value: `<#${data.channel.id}>`,
                    },
                    {
                        name: "> Type",
                        value: `- ${data.thread.type}`,
                    },
                    {
                        name: "> Criado em",
                        value: `<t:${(
                            data.thread.createdTimestamp ?? 0
                        ).toFixed(0)}>`,
                    },
                ],
            },
        ],
    };

    if (data.staff !== null) {
        embed.embeds[0].fields.push({
            name: "> Staff",
            value: `<@${data.staff?.id}>`,
        });
    }

    if (!logChannel) return;

    switch (data.event) {
        case "create":
            embed.embeds[0].title = "Thread Created";
            embed.embeds[0].description = `Thread <#${data.thread.id}> criada por <@${data.author.id}>.`;
            break;
        case "delete":
            embed.embeds[0].title = "Thread Deleted";
            embed.embeds[0].description = `Thread <#${data.thread.id}> de <@${data.author.id}> foi deletada.`;
            break;
        case "update":
            embed.embeds[0].title = "Thread Updated";
            embed.embeds[0].description = `Thread <#${data.thread.id}> de <@${data.author.id}> foi atualizada.`;
            if (data.oldThread?.name !== data.thread.name) {
                embed.embeds[0].fields.push(
                    {
                        name: "Nome",
                        value: data.thread.name,
                        inline: true,
                    },
                    {
                        name: "Nome Antigo",
                        value: data.oldThread?.name,
                        inline: true,
                    }
                );
            } else if (data.oldThread?.archived !== data.thread.archived) {
                embed.embeds[0].fields.push(
                    {
                        name: "Arquivado",
                        value: data.thread.archived ? "Sim" : "Não",
                        inline: true,
                    },
                    {
                        name: "Arquivado Antigo",
                        value: data.oldThread?.archived ? "Sim" : "Não",
                        inline: true,
                    }
                );
            } else if (data.oldThread?.locked !== data.thread.locked) {
                embed.embeds[0].fields.push(
                    {
                        name: "Trancado",
                        value: data.thread.locked ? "Sim" : "Não",
                        inline: true,
                    },
                    {
                        name: "Trancado Antigo",
                        value: data.oldThread?.locked ? "Sim" : "Não",
                        inline: true,
                    }
                );
            } else if (
                data.oldThread?.autoArchiveDuration !==
                data.thread.autoArchiveDuration
            ) {
                embed.embeds[0].fields.push(
                    {
                        name: "Auto-Arquivar",
                        value: `${data.thread.autoArchiveDuration} seconds`,
                        inline: true,
                    },
                    {
                        name: "Auto-Arquivar Antigo",
                        value: `${data.oldThread?.autoArchiveDuration} seconds`,
                        inline: true,
                    }
                );
            } else if (
                data.oldThread?.rateLimitPerUser !==
                data.thread.rateLimitPerUser
            ) {
                embed.embeds[0].fields.push(
                    {
                        name: "Limite de Mensagens",
                        value: `${data.thread.rateLimitPerUser} seconds`,
                        inline: true,
                    },
                    {
                        name: "Limite de Mensagens Antigo",
                        value: `${data.oldThread?.rateLimitPerUser} seconds`,
                        inline: true,
                    }
                );
            }

            break;
    }

    logChannel.send(embed);
}

export { LoggerThreadRegister };
