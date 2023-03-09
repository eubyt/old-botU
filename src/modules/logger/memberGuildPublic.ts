import { Client } from "discord.js";
import { getGuildData } from "../../guildData";
import { EVENT_RESPONSE } from "../../types";

async function PublicLoggerMemberGuildRegister(
  client: Client,
  data: EVENT_RESPONSE["memberGuildUpdate"]
) {
  const dataGuild = await getGuildData(data.guildId, client);
  const guild = client.guilds.cache.get(data.guildId);
  if (!guild) {
    console.error("Guild not found!");
    return;
  }

  if (!dataGuild) {
    console.error("Guild data not found!");
    return;
  }

  const publicLogChannel =
    dataGuild.getLoggerChannels().memberJoinLeaveLog_public;

  if (!publicLogChannel) return;

  let embed: {
    embeds: any[];
  } = {
    embeds: [
      {
        description: "",
        timestamp: new Date().toISOString(),
        color: 0x00ff00,
        author: {
          name: data.user.tag,
          icon_url: data.user.avatarURL() || undefined,
        },
        fields: [
          {
            name: "ID do usuário",
            value: data.user.id,
          },
          {
            name: "Criação da conta",
            value: `<t:${(data.user.createdTimestamp / 1000).toFixed(
              0
            )}> (<t:${(data.user.createdTimestamp / 1000).toFixed(0)}:R>)`,
          },
        ],
      },
    ],
  };

  if (data.event === "leave" || data.event === "kick") {
    embed.embeds[0].fields.push({
      name: "Membro desde",
      value: `<t:${(data.joinedAt!.getTime() / 1000).toFixed(0)}> (<t:${(
        data.joinedAt!.getTime() / 1000
      ).toFixed(0)}:R>)`,
    });
  }

  switch (data.event) {
    case "join":
      embed.embeds[0].description =
        "``" + data.user.tag + "`` entrou no servidor!";
      break;
    case "leave":
      embed.embeds[0].description =
        "``" + data.user.tag + "`` saiu do servidor!";
      break;
    case "kick":
      embed.embeds[0].description =
        "``" + data.user.tag + "`` saiu do servidor!";
  }

  publicLogChannel.send(embed);
}

export { PublicLoggerMemberGuildRegister };
