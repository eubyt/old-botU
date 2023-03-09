import { Client } from "discord.js";
import { getGuildData } from "../../guildData";
import { EVENT_RESPONSE } from "../../types";

async function InviteTrackRegister(
  client: Client,
  data: EVENT_RESPONSE["inviteUpdate"]
) {
  const dataGuild = await getGuildData(data.guildId, client);

  if (!dataGuild) {
    console.error("Guild data not found!");
    return;
  }

  // Update invite data
  dataGuild.loadingInvites();
  console.log(data, "Invite data updated!");
}

export { InviteTrackRegister };
