import { Client } from "discord.js";
import { getGuildData } from "../../guildData";
import { Twitch } from "../../utils/twitch";
import { sendMessageToChannel } from "./messageUtil";

let STREAMS_ONLINE: string[] = [];

function NotificationsCheck(client: Client, guildId: string) {
    const dataGuild = getGuildData(guildId, client);

    if (!dataGuild) {
        console.error("Guild data not found!");
        return;
    }

    const twitchData = dataGuild.getNotification("twitch") as any[];
    if (!twitchData) return;

    twitchData.forEach(async (x) => {
        const twitch = new Twitch(x.twitchId);
        const stream = await twitch.CheckStreamerOnline();
        if (stream.streamer_online && !STREAMS_ONLINE.includes(x.twitchId)) {
            STREAMS_ONLINE.push(x.twitchId);
            sendMessageToChannel(client, guildId, x.channelId, x.templateId, {
                id: stream.id,
                userName: stream.user_name,
                link: `https://twitch.tv/${stream.user_name}`,
                title: stream.title,
                game: stream.game_name,
            });
        } else {
            STREAMS_ONLINE.splice(STREAMS_ONLINE.indexOf(x.twitchId), 1);
        }
    });
}

export { NotificationsCheck };
