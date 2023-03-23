import { Client } from "discord.js";
import { GetGuildData } from "../../guildData";
import { EVENT_RESPONSE } from "../../types";
import { Color } from "../../utils/color";

function LoggerBanRegister(
    client: Client,
    data: EVENT_RESPONSE["memberBanUpdate"]
) {
    const dataGuild = GetGuildData(data.guildId, client);

    if (!dataGuild) {
        console.error("Guild data not found!");
        return;
    }

    const logChannel = dataGuild.getLoggerChannels().banLog;
    if (!logChannel) return;

    let embed: {
        embeds: any[];
    } = {
        embeds: [
            {
                title: "",
                description: "",
                timestamp: new Date().toISOString(),
                color: Color.EMBED_TRANSPARENT,
                fields: [
                    {
                        name: "> ID",
                        value:
                            "```swift\n" +
                            `User = ${data.user?.id}\n` +
                            `${data.staff ? `Staff = ${data.staff.id}` : ""}` +
                            "```",
                    },
                ],
                author: {
                    name: data.user?.tag,
                    icon_url: data.user?.displayAvatarURL() ?? undefined,
                },
            },
        ],
    };

    switch (data.event) {
        case "ban":
            embed.embeds[0].title = "User Banned";
            embed.embeds[0].description = `O usuário ${data.user?.tag} foi banido do servidor.`;
            embed.embeds[0].fields.push(
                {
                    name: "> Motivo",
                    value: `- ${data.reason}`,
                },
                {
                    name: "> Staff",
                    value: `<@${data.staff?.id}>`,
                }
            );
            break;
        case "unban":
            embed.embeds[0].title = "Desbanimento registrado";
            embed.embeds[0].description = `O usuário ${data.user?.tag} foi desbanido do servidor.`;
            embed.embeds[0].fields.push(
                {
                    name: "> Motivo do banimento",
                    value: `- ${data.reason}`,
                },
                {
                    name: "> Staff",
                    value: `<@${data.staff?.id}>`,
                }
            );
            break;
        case "timeout":
            embed.embeds[0].title = "Banimento temporário registrado";
            embed.embeds[0].description = `O usuário ${data.user?.tag} foi banido do servidor.`;
            embed.embeds[0].fields.push(
                {
                    name: "> Motivo do banimento",
                    value: `- ${data.reason}`,
                },
                {
                    name: "> Tempo",
                    value: `<t:${(data.expiration ?? 0).toFixed(0)}> (<t:${(
                        data.expiration ?? 0
                    ).toFixed(0)}:R>)`,
                },
                {
                    name: "> Staff",
                    value: `<@${data.staff?.id}>`,
                }
            );
            break;
        case "untimeout":
            embed.embeds[0].title = "Desbanimento temporário registrado";
            embed.embeds[0].description = `O usuário ${data.user?.tag} foi desbanido do servidor.`;
            embed.embeds[0].fields.push(
                {
                    name: "> Staff",
                    value: `<@${data.staff?.id}>`,
                },
                {
                    name: "> Tempo",
                    value: `<t:${(data.expiration ?? 0).toFixed(0)}> (<t:${(
                        data.expiration ?? 0
                    ).toFixed(0)}:R>)`,
                }
            );
        default:
            return;
    }

    logChannel.send(embed);
}

export { LoggerBanRegister };
