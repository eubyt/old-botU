import { Client } from "discord.js";
import { GetGuildData } from "../../guildData";
import { EVENT_RESPONSE } from "../../types";
import { Color } from "../../utils/color";

function LoggerMessageRegister(
    client: Client,
    data: EVENT_RESPONSE["messageStateUpdate"]
) {
    const dataGuild = GetGuildData(data.guildId, client);

    if (!dataGuild) {
        console.error("Guild data not found!");
        return;
    }

    const logChannel = dataGuild.getLoggerChannels().messageLog;

    let embed: {
        embeds: any[];
    } = {
        embeds: [
            {
                title: "Message Log",
                description: "",
                timestamp: new Date().toISOString(),
                color: Color.EMBED_TRANSPARENT,
                author: {
                    name: data.author.tag,
                    icon_url: data.author.avatarURL() || undefined,
                },
                fields: [
                    {
                        name: "> ID",
                        value:
                            "```swift\n" +
                            `Channel = ${data.message.channel}\n` +
                            `Message = ${data.message.id}\n` +
                            `User = ${data.author.id}` +
                            "```",
                    },
                    {
                        name: "> Criado em",
                        value: `<t:${(
                            data.message.createdTimestamp ?? 0
                        ).toFixed(0)}>`,
                    },
                ],
            },
        ],
    };

    if (!logChannel) return;

    if (data.staff !== null) {
        embed.embeds[0].fields.push({
            name: "> Staff",
            value: `<@${data.staff?.id}>`,
        });
    }

    switch (data.event) {
        case "delete":
            embed.embeds[0].title = "Message Deleted";
            embed.embeds[0].description = `Mensagem deletada no canal <#${data.message.channel}>.`;
            embed.embeds[0].fields.push(
                ...data.message.content.map((content, index) => {
                    return {
                        name: `${index === 0 ? "> Content" : "\u200b"}`,
                        value: content,
                    };
                })
            );
            break;
        case "pin":
            embed.embeds[0].title = "Message Pinned";
            embed.embeds[0].description = `Mensagem fixada no canal <#${data.message.channel}>.`;
            embed.embeds[0].fields.push(
                ...data.message.content.map((content, index) => {
                    return {
                        name: `${index === 0 ? "> Content" : "\u200b"}`,
                        value: content,
                    };
                })
            );
            break;
        case "unpin":
            embed.embeds[0].title = "Message Unpinned";
            embed.embeds[0].description = `Mensagem desfixada no canal <#${data.message.channel}>.`;
            embed.embeds[0].fields.push(
                ...data.message.content.map((content, index) => {
                    return {
                        name: `${index === 0 ? "> Content" : "\u200b"}`,
                        value: content,
                    };
                })
            );
            break;
        case "update":
            embed.embeds[0].title = "Message Updated";
            embed.embeds[0].description = `Mensagem editada no canal <#${data.message.channel}>.`;
            embed.embeds[0].fields.push(
                ...data.message.content.map((content, index) => {
                    return {
                        name: `${index === 0 ? "> Content" : "\u200b"}`,
                        value: content,
                    };
                })
            );
            embed.embeds[0].timestamp = undefined;
            if (data.oldMessage === null) return;
            embed.embeds.push({
                timestamp: new Date().toISOString(),
                fields:
                    data.oldMessage?.content.map((content, index) => {
                        return {
                            name: index === 0 ? "> Old Content" : "\u200b",
                            value: content,
                        };
                    }) || [],
            });
            break;
        default:
            return;
    }

    logChannel.send(embed);
}

export { LoggerMessageRegister };
