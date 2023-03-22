import { Client } from "discord.js";
import { getGuildData } from "../../guildData";
import { EVENT_RESPONSE } from "../../types";

function InviteTrackRegister(
    client: Client,
    data: EVENT_RESPONSE["inviteUpdate"]
) {
    const dataGuild = getGuildData(data.guildId, client);

    if (!dataGuild) {
        console.error("Guild data not found!");
        return;
    }

    // Update invite data
    dataGuild.loadingInvites();
}

export { InviteTrackRegister };
