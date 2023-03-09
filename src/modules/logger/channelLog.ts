import { channel } from "diagnostics_channel";
import {
  Client,
  MessageCreateOptions,
  MessagePayload,
  OverwriteType,
} from "discord.js";
import { getGuildData } from "../../guildData";
import { EVENT_RESPONSE } from "../../types";
import { fixMention } from "../../utils/tools";

async function LoggerChannelRegister(
  client: Client,
  data: EVENT_RESPONSE["channelStateUpdate"]
) {
  const dataGuild = await getGuildData(data.guildId, client);

  if (!dataGuild) {
    console.error("Guild data not found!");
    return;
  }

  const logChannel = dataGuild.getLoggerChannels().channelLog;

  console.log(data);

  let embed: {
    embeds: any[];
  } = {
    embeds: [
      {
        title: "",
        description: "",
        timestamp: new Date().toISOString(),
        color: 0x495156,
        fields: [
          {
            name: "> ID",
            value:
              "```swift\n" +
              `Channel = ${data.channel.id}\n` +
              `Category = ${data.channel.category.id}\n` +
              `${data.staff ? `User = ${data.staff.id}` : ""}` +
              "```",
          },
          {
            name: "> Nome",
            value: `- ${data.channel.name}`,
          },
          {
            name: "> Type",
            value: `- ${data.channel.type}`,
          },
          {
            name: "> Categoria",
            value: `- ${data.channel.category.name}`,
          },
          {
            name: "> Criado em",
            value: `<t:${(data.channel.createdTimestamp ?? 0).toFixed(0)}>`,
          },
        ],
      },
    ],
  };

  if (data.staff) {
    embed.embeds[0].author = {
      name: `${data.staff.tag}`,
      icon_url: data.staff.displayAvatarURL(),
    };
  }

  if (!logChannel) return;

  switch (data.event) {
    case "create":
      embed.embeds[0].title = "Channel Created";
      embed.embeds[0].description = `Um novo canal foi criado no servidor! <#${data.channel.id}>.`;
      break;
    case "delete":
      embed.embeds[0].title = "Channel Deleted";
      embed.embeds[0].description = `Um canal foi deletado do servidor!`;
      break;
    case "update":
      embed.embeds[0].title = "Channel Updated";
      embed.embeds[0].description = `Um canal foi atualizado no servidor! <#${data.channel.id}>.`;
      embed.embeds[0].fields = [embed.embeds[0].fields[0]];

      if (!data.oldChannel) return;

      if (data.channel.time) {
        embed.embeds[0].fields.push({
          name: "> Pinned at",
          value: `<t:${(data.channel.time.getTime() / 1000).toFixed(0)}>`,
        });
      }

      if (data.channel.name !== data.oldChannel.name) {
        embed.embeds[0].fields.push(
          {
            name: "Nome antigo",
            value: `${data.oldChannel.name}`,
            inline: true,
          },
          {
            name: "Nome atual",
            value: `${data.channel.name}`,
            inline: true,
          }
        );
      }

      if (data.channel.type !== data.oldChannel.type) {
        embed.embeds[0].fields.push(
          {
            name: "Old Type",
            value: `${data.oldChannel.type}`,
            inline: true,
          },
          {
            name: "New Type",
            value: `${data.channel.type}`,
            inline: true,
          }
        );
      }

      if (data.channel.category.id !== data.oldChannel.category.id) {
        embed.embeds[0].fields.push(
          {
            name: "Old Category",
            value: `${data.oldChannel.category.name} (${data.oldChannel.category.id})`,
            inline: true,
          },
          {
            name: "New Category",
            value: `${data.channel.category.name} (${data.channel.category.id})`,
            inline: true,
          }
        );
      }

      if (data.channel.topic !== data.oldChannel.topic) {
        embed.embeds[0].fields.push(
          {
            name: "> Old Topic",
            value: `- ${data.oldChannel.topic || "None"}`,
          },
          {
            name: "> New Topic",
            value: `- ${data.channel.topic}`,
          }
        );
      }

      if (data.channel.rateLimitPerUser !== data.oldChannel.rateLimitPerUser) {
        embed.embeds[0].fields.push(
          {
            name: "Old Rate Limit",
            value: `${data.oldChannel.rateLimitPerUser} seconds`,
            inline: true,
          },
          {
            name: "New Rate Limit",
            value: `${data.channel.rateLimitPerUser} seconds`,
            inline: true,
          }
        );
      }

      if (data.channel.nsfw !== data.oldChannel.nsfw) {
        embed.embeds[0].fields.push(
          {
            name: "Old NSFW",
            value: `${data.oldChannel.nsfw}`,
            inline: true,
          },
          {
            name: "New NSFW",
            value: `${data.channel.nsfw}`,
            inline: true,
          }
        );
      }

      if (data.permissionsChange) {
        const permissions = data.permissionsChange.map((permission) => {
          let value = "";
          const guild = client.guilds.cache.get(data.guildId);
          if (!guild) return;

          value += "**Permissões alteradas de:**\n";
          value += `${
            permission.type === OverwriteType.Role
              ? fixMention(guild, permission.id)
              : `<@${permission.id}>`
          } (${permission.id})\n\n`;

          value += "**Canal:**\n";
          value += `<#${data.channel.id}> (${data.channel.id})\n\n`;

          if (permission.allow.length > 0) {
            value += "**Permissões concedidas:**\n";
            value +=
              "```diff\n" +
              permission.allow
                .map((permission: string) => {
                  return `+ ${permission}`;
                })
                .join("\n") +
              "```\n";
          }

          if (permission.deny.length > 0) {
            value += "**Permissões negadas:**\n";
            value +=
              "```diff\n" +
              permission.deny
                .map((permission: string) => {
                  return `- ${permission}`;
                })
                .join("\n") +
              "```\n";
          }

          return {
            name: "\u200b",
            value,
          };
        }) as {
          name: string;
          value: string;
        }[];

        if (permissions) {
          embed.embeds[0].fields = embed.embeds[0].fields.concat(permissions);
        }
      }
  }

  logChannel.send(embed);
}

export { LoggerChannelRegister };
