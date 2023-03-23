import { Client } from "discord.js";
import { GetGuildData } from "../../guildData";
import { EVENT_RESPONSE } from "../../types";

function MemberGuildAddRoleRegister(
    client: Client,
    data: EVENT_RESPONSE["memberGuildUpdate"]
) {
    const dataGuild = GetGuildData(data.guildId, client);
    const guild = client.guilds.cache.get(data.guildId);

    if (!dataGuild) {
        console.error("Guild data not found!");
        return;
    }

    const config = dataGuild.getOptions().autorole.memberGuildAddRole;
    if (!config || config === "") return;

    const role = guild?.roles.cache.get(config);
    const member = guild?.members.cache.get(data.user.id);

    if (!role || !member) {
        console.error("Role or member not found!");
        return;
    }

    member.roles.add(role);
}

export { MemberGuildAddRoleRegister };
