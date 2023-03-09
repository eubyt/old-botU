import { Client } from "discord.js";
import { getGuildData } from "../../guildData";
import { EVENT_RESPONSE } from "../../types";

// Spam Voice Muted
const spamVoiceMuted = new Array<{
  user: string;
  guild: string;
  time: number;
  count: number;
}>();

async function VoiceSecurityRegister(
  client: Client,
  data: EVENT_RESPONSE["voiceStateUpdate"]
) {
  const dataGuild = await getGuildData(data.guildId, client);
  if (!dataGuild) {
    console.error("Guild data not found!");
    return;
  }

  // Clear spamVoiceMuted
  spamVoiceMuted.forEach((x) => {
    if (Date.now() - x.time > 10000) {
      spamVoiceMuted.splice(spamVoiceMuted.indexOf(x), 1);
    }
  });

  if (data.event !== "mute" || data.voiceChannel.muted !== true) return;

  const spamVoiceMutedData = spamVoiceMuted.find(
    (x) => x.user === data.user.id && x.guild === data.guildId
  );

  if (spamVoiceMutedData) {
    if (Date.now() - spamVoiceMutedData.time < 3000) {
      spamVoiceMutedData.count++;
      spamVoiceMutedData.time = Date.now();

      spamVoiceMuted[spamVoiceMuted.indexOf(spamVoiceMutedData)] =
        spamVoiceMutedData;

      if (spamVoiceMutedData.count >= 3) {
        // Desconectar
        const guild = client.guilds.cache.get(data.guildId);
        if (!guild) return;
        const member = guild.members.cache.get(data.user.id);
        if (!member) return;
        member.voice.disconnect("Spam voice muted");
        try {
          member.timeout(10, "Spam voice muted");
        } catch (error) {}
        spamVoiceMuted.splice(spamVoiceMuted.indexOf(spamVoiceMutedData), 1);
      }
    } else {
      spamVoiceMuted.splice(spamVoiceMuted.indexOf(spamVoiceMutedData), 1);
    }
  } else {
    spamVoiceMuted.push({
      user: data.user.id,
      guild: data.guildId,
      time: Date.now(),
      count: 1,
    });
  }
}

export { VoiceSecurityRegister };
