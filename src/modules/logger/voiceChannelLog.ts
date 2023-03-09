import { Client } from "discord.js";
import { getGuildData } from "../../guildData";
import { EVENT_RESPONSE } from "../../types";

async function LoggerVoiceRegister(
  client: Client,
  data: EVENT_RESPONSE["voiceStateUpdate"]
) {
  const dataGuild = await getGuildData(data.guildId, client);

  if (!dataGuild) {
    console.error("Guild data not found!");
    return;
  }

  const logChannel = dataGuild.getLoggerChannels().voiceLog;

  let embed = {
    embeds: [
      {
        title: "Voice Channel Log",
        description: "",
        timestamp: new Date().toISOString(),
        color: 0x495156,
        author: {
          name: data.user.tag,
          icon_url: data.user.avatarURL() || undefined,
        },
        fields: [
          {
            name: "> ID",
            value:
              "```swift\n" +
              `Channel = ${data.voiceChannel.id}\n` +
              `${
                data.oldVoiceChannel
                  ? `Old_Channel = ${data.oldVoiceChannel.id}\n`
                  : ""
              }` +
              `User = ${data.user.id}` +
              "```",
          },
        ],
      },
    ],
  };

  if (data.staff) {
    embed.embeds[0].fields.push({
      name: "> Staff",
      value: `<@${data.staff?.id}>`,
    });
  }

  if (!logChannel) return;

  switch (data.event) {
    case "join":
      embed.embeds[0].title = "User Joined Voice Channel";
      embed.embeds[0].description = `<@${data.user.id}> entrou no canal <#${data.voiceChannel.id}>.`;
      break;
    case "leave":
      embed.embeds[0].title = "User Left Voice Channel";
      embed.embeds[0].description = `<@${data.user.id}> saiu do canal <#${data.voiceChannel.id}>.`;
      break;
    case "switch":
      embed.embeds[0].title = "User Switched Voice Channel";
      embed.embeds[0].description = `<@${data.user.id}> saiu do canal <#${data.oldVoiceChannel?.id}> e entrou no canal <#${data.voiceChannel.id}>.`;
      break;
    case "mute":
      embed.embeds[0].title = `User ${
        data.voiceChannel.muted ? "Muted" : "Unmuted"
      }`;
      embed.embeds[0].description = `<@${data.user.id}> está ${
        data.voiceChannel.muted ? "mutado" : "desmutado"
      } no canal <#${data.voiceChannel.id}>.`;
      break;
    case "deaf":
      embed.embeds[0].title = `User ${
        data.voiceChannel.deafened ? "Deafened" : "Undeafened"
      }`;
      embed.embeds[0].description = `<@${data.user.id}> está com o áudio ${
        data.voiceChannel.deafened ? "desligado" : "ligado"
      } no canal <#${data.voiceChannel.id}>.`;

      break;
    case "stream":
      embed.embeds[0].title = "User Streaming";
      embed.embeds[0].description = `<@${data.user.id}> está ${
        data.voiceChannel.streaming ? "transmitindo" : "parou de transmitir"
      } no canal <#${data.voiceChannel.id}>.`;
      break;
    default:
      return;
  }

  logChannel.send(embed);
}

export { LoggerVoiceRegister };
