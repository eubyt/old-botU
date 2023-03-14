import { ChannelType, Client } from "discord.js";
import { getGuildData } from "../../guildData";
import { EVENT_RESPONSE } from "../../types";

function AntiInviteRegister(
    client: Client,
    data: EVENT_RESPONSE["messageStateUpdate"]
) {
    const dataGuild = getGuildData(data.guildId, client);
    if (!dataGuild) {
        console.error("Guild data not found!");
        return;
    }

    const config = dataGuild.getOptions().security.antiDiscordInvite;
    if (!config) return;

    const message = data.message.content.join(" ");
    const inviteRegex =
        /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/.+[a-z]/gi;
    const invite = message.replaceAll(" ", "").match(inviteRegex);

    if (!invite) return;

    const guild = client.guilds.cache.get(data.guildId);
    if (!guild) return;

    const member = guild.members.cache.get(data.author.id);
    if (!member) return;

    const channel = guild.channels.cache.get(data.message.channel);
    if (!channel || channel.type !== ChannelType.GuildText) return;

    channel.messages.fetch(data.message.id).then((msg) => {
        msg.delete();
        member.timeout(10, "Discord invite link");
    });
}

export { AntiInviteRegister };
