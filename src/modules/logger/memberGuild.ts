import { Client, PrivateThreadChannel, PublicThreadChannel } from "discord.js";
import { getGuildData } from "../../guildData";
import { EVENT_RESPONSE } from "../../types";

async function LoggerMemberGuildRegister(
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
        color: 0x495156,
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
          value: `<t:${(data.user.createdTimestamp / 1000).toFixed(0)}> (<t:${(
            data.user.createdTimestamp / 1000
          ).toFixed(0)}:R>)`,
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
          value: `<t:${(data.user.createdTimestamp / 1000).toFixed(0)}>`,
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
          value: `<t:${(data.user.createdTimestamp / 1000).toFixed(0)}>`,
        },
        {
          name: "> Membro desde",
          value: `<t:${(data.joinedAt!.getTime() / 1000).toFixed(0)}>`,
        }
      );
      break;
  }

  logChannel.send(embed);
}

export { LoggerMemberGuildRegister };
