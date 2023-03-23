import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    Client,
    StringSelectMenuBuilder,
} from "discord.js";
import { GetGuildData } from "../../guildData";
import { Color } from "../../utils/color";

function convert(content: string, args: any) {
    for (const key in args) {
        content = content.replace(new RegExp(`{${key}}`, "g"), args[key]);
    }
    return content.replace(/\\n/g, "\n");
}

async function sendMessageToChannel(
    client: Client,
    guildId: string,
    channelId: string | Function,
    idMessage: string,
    args = {},
    noSave = false
) {
    const dataGuild = GetGuildData(guildId, client);

    if (!dataGuild) {
        console.error("Guild data not found!");
        return;
    }

    const messageData = structuredClone(
        dataGuild.getMessageTemplate(idMessage)
    );

    if (!messageData) return;

    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
        console.error("Guild not found!");
        return;
    }

    const checkExist = dataGuild.getTemplateToChannel(idMessage);

    let messageCreator: any = {};

    if (messageData.content)
        messageCreator.content = convert(messageData.content, args);

    if (messageData.ephemeral) messageCreator.ephemeral = true;

    if (messageData.embeds) {
        messageData.embeds.forEach((embed) => {
            if (embed.title) embed.title = convert(embed.title, args);
            if (embed.description)
                embed.description = convert(embed.description, args);
            if (embed.color) {
                embed.color = Color[embed.color as keyof typeof Color];
            }
        });

        messageCreator.embeds = messageData.embeds as any;
    }

    if (messageData.components) {
        const actionRow = new ActionRowBuilder();

        messageData.components.forEach((component) => {
            switch (component.type) {
                case "button":
                    const button = new ButtonBuilder()
                        .setStyle(
                            ButtonStyle[
                                (component.color as keyof typeof ButtonStyle) ??
                                    "Primary"
                            ]
                        )
                        .setLabel(component.label)
                        .setCustomId(component.customId);

                    if (component.emoji) {
                        button.setEmoji(component.emoji);
                    }

                    actionRow.addComponents(button);
                    break;
                case "select":
                    actionRow.addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId(component.customId)
                            .setPlaceholder(component.label)
                            .addOptions(component.options as any)
                    );
            }
        });

        messageCreator.components = [actionRow as any];
    }

    if (typeof channelId !== "function") {
        const channel = guild.channels.cache.get(channelId);

        if (!channel) {
            await dataGuild.removeTemplateToChannel(idMessage, channelId);
            console.error("Channel not found!");
            return;
        }

        if (
            channel.type === ChannelType.GuildText ||
            channel.type === ChannelType.PublicThread ||
            channel.type === ChannelType.PrivateThread
        ) {
            let message;

            if (checkExist)
                message = await channel.messages.fetch(checkExist.messageId);

            if (checkExist && message) {
                message.edit(messageCreator);
            } else {
                // Remove old message if exist
                if (checkExist)
                    await dataGuild.removeTemplateToChannel(
                        idMessage,
                        channelId
                    );

                // Send message and save it
                channel.send(messageCreator).then((message) => {
                    if (noSave) return;
                    dataGuild.addTemplateToChannel(
                        idMessage,
                        message.channelId,
                        message.id
                    );
                });
            }
        }
    } else {
        channelId(messageCreator);
    }
}

export { sendMessageToChannel };
