import { Client, Guild } from "discord.js";
import { GetGuildData } from "../../guildData";
import { EVENT_RESPONSE } from "../../types";

function RemoveAllTwitchRole(client: Client, guildId: string) {
    const dataGuild = GetGuildData(guildId, client);
    const guild = client.guilds.cache.get(guildId);

    if (!dataGuild || !guild) {
        console.error("Guild data not found!");
        return;
    }

    const config = dataGuild.getOptions().autorole.twitchSteamerRole;
    if (!config || config === "") return;

    const role = guild.roles.cache.get(config);

    if (!role) {
        console.error("Role not found!", guild.id);
        return;
    }

    guild.members.cache.forEach((member) => member.roles.remove(role));
}

async function TwitchOnAddRole(
    client: Client,
    data: EVENT_RESPONSE["presenceUpdate"]
) {
    const dataGuild = GetGuildData(data.guildId, client);
    const guild = client.guilds.cache.get(data.guildId);

    if (!dataGuild || !guild) {
        console.error("Guild data not found!");
        return;
    }

    const config = dataGuild.getOptions().autorole.twitchSteamerRole;
    if (!config || config === "") return;

    const role = await guild.roles.fetch(config);
    const member = guild.members.cache.get(data.user.id);

    if (!member) {
        console.error("Member not found!");
        return;
    }

    if (!role) {
        console.error("Role not found!", data.guildId);
        return;
    }

    switch (data.activity) {
        case "twitch":
            member.roles.add(role);
            break;
        default:
            member.roles.remove(role);
    }
}

export { TwitchOnAddRole, RemoveAllTwitchRole };
