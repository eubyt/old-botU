import { Client } from "discord.js";
import { GetGuildData } from "../../guildData";
import { EVENT_RESPONSE } from "../../types";

function PublicLoggerBanRegister(
    client: Client,
    data: EVENT_RESPONSE["memberBanUpdate"]
) {
    const dataGuild = GetGuildData(data.guildId, client);

    if (!dataGuild) {
        console.error("Guild data not found!");
        return;
    }

    const logChannel = dataGuild.getLoggerChannels().banLog_public;
    if (!logChannel) return;

    let embed: {
        embeds: any[];
    } = {
        embeds: [
            {
                description: "",
                timestamp: new Date().toISOString(),
                color: 0x00ff00,
                fields: [
                    {
                        name: "Membro",
                        value: "``" + data.user?.tag + "``",
                    },
                ],
                author: {
                    name: data.user?.tag,
                    icon_url: data.user?.displayAvatarURL() ?? undefined,
                },
                footer: {
                    text: `ID do usuário: ${data.user?.id}`,
                },
            },
        ],
    };

    switch (data.event) {
        case "ban":
            embed.embeds[0].description = `O membro <@${data.user?.id}> foi banido do servidor.`;
            embed.embeds[0].fields.push({
                name: "Motivo",
                value: "``" + data.reason + "``",
            });
            break;
        case "unban":
            embed.embeds[0].description = `O membro <@${data.user?.id}> foi desbanido do servidor.`;
            embed.embeds[0].fields.push({
                name: "Motivo do banimento",
                value: "``" + data.reason + "``",
            });
            break;
        case "timeout":
            embed.embeds[0].description = `O usuário <@${data.user?.id}> foi banido temporariamente do servidor.`;
            embed.embeds[0].fields.push(
                {
                    name: "Motivo",
                    value: "``" + data.reason + "``",
                },
                {
                    name: "Tempo de banimento",
                    value: `<t:${(data.expiration ?? 0).toFixed(0)}> (<t:${(
                        data.expiration ?? 0
                    ).toFixed(0)}:R>)`,
                }
            );
            break;
        case "untimeout":
            embed.embeds[0].description = `O membro ${data.user} foi desbanido do servidor.`;
            embed.embeds[0].fields.push({
                name: "Tempo de banimento",
                value: `<t:${(data.expiration ?? 0).toFixed(0)}> (<t:${(
                    data.expiration ?? 0
                ).toFixed(0)}:R>)`,
            });
        default:
            return;
    }

    logChannel.send(embed);
}

export { PublicLoggerBanRegister };
