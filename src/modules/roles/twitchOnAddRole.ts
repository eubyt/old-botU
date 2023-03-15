import { Client } from "discord.js";
import { getGuildData } from "../../guildData";
import { EVENT_RESPONSE } from "../../types";

function TwitchOnAddRole(
    client: Client,
    data: EVENT_RESPONSE["presenceUpdate"]
) {
    const dataGuild = getGuildData(data.guildId, client);
    const guild = client.guilds.cache.get(data.guildId);

    if (!dataGuild) {
        console.error("Guild data not found!");
        return;
    }

    const config = dataGuild.getOptions().autorole.twitchSteamerRole;
    if (!config || config === "") return;

    const role = guild?.roles.cache.get(config);
    const member = guild?.members.cache.get(data.user.id);

    if (!role || !member) {
        console.error("Role or member not found!");
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

export { TwitchOnAddRole };
