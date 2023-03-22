import { Client } from "discord.js";
import { getGuildData } from "../../guildData";
import { EVENT_RESPONSE } from "../../types";
import { Color } from "../../utils/color";
import { sendMessageToChannel } from "../messages/messageUtil";

async function FuncModuleRegister(
    client: Client,
    data: EVENT_RESPONSE["interactionUpdate"]
) {
    const dataGuild = getGuildData(data.guildId, client);

    if (!data.reply) return;

    if (!dataGuild) {
        console.error("Guild data not found!");
        return;
    }

    const guild = client.guilds.cache.get(data.guildId);

    if (!guild) {
        console.error("Guild not found!");
        return;
    }

    const member = guild.members.cache.get(data.user.id);

    if (!member) {
        console.error("Member not found!");
        return;
    }

    let embed = {
        embeds: [
            {
                title: "Null",
                description: "Null",
                timestamp: new Date().toISOString(),
                color: Color.EMBED_TRANSPARENT,
                fields: Array(),
            },
        ],
        ephemeral: true,
    };

    switch (data.event) {
        case "sendMessage":
            sendMessageToChannel(
                client,
                data.guildId,
                data.reply,
                data.args[0]
            );
            break;
        case "addRole":
            data.args.forEach((roleId) => member.roles.add(roleId));
            embed.embeds[0].title = "Adicionando cargos!";
            embed.embeds[0].description = "Cargos adicionados com sucesso!";
            embed.embeds[0].fields = [
                {
                    name: "\u200b",
                    value: data.args
                        .map((roleId) => `<@&${roleId}>`)
                        .join("\n"),
                },
            ];
            break;
        case "switchRole":
            const removeRole = data.args.filter((roleId) =>
                member.roles.cache.has(roleId)
            );
            const addRole = data.args.filter(
                (roleId) => !member.roles.cache.has(roleId)
            );

            removeRole.forEach((roleId) => member.roles.remove(roleId));
            addRole.forEach((roleId) => member.roles.add(roleId));

            embed.embeds[0].title = "Atualizando cargos!";
            embed.embeds[0].description = "Cargos atualizados com sucesso!";
            if (removeRole.length > 0) {
                embed.embeds[0].fields.push({
                    name: "Removido(s)",
                    value: removeRole
                        .map((roleId) => `<@&${roleId}>`)
                        .join("\n"),
                });
            }

            if (addRole.length > 0) {
                embed.embeds[0].fields.push({
                    name: "Adicionado(s)",
                    value: addRole.map((roleId) => `<@&${roleId}>`).join("\n"),
                });
                break;
            }
    }

    if (data.event !== "sendMessage") await data.reply(embed);
}

export { FuncModuleRegister };
