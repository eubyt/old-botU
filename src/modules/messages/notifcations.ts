import { Client } from "discord.js";
import { getGuildData } from "../../guildData";
import { Twitch } from "../../utils/twitch";
import { Twitter } from "../../utils/twitter";
import { sendMessageToChannel } from "./messageUtil";

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
        if (!stream.streamer_online)
            dataGuild.NOTIFICATIONS.splice(
                dataGuild.NOTIFICATIONS.indexOf(x.twitchId),
                1
            );

        if (
            stream.streamer_online &&
            !dataGuild.NOTIFICATIONS.includes(x.twitchId)
        ) {
            dataGuild.NOTIFICATIONS.push(x.twitchId);
            sendMessageToChannel(
                client,
                guildId,
                x.channelId,
                x.templateId,
                {
                    id: stream.id,
                    userName: stream.user_name,
                    link: `https://twitch.tv/${stream.user_name}`,
                    title: stream.title,
                    game: stream.game_name,
                },
                true
            );

            if (x.twitter) {
                const twitter = new Twitter(
                    x.twitter.consumer_key,
                    x.twitter.consumer_secret,
                    x.twitter.access_token_key,
                    x.twitter.access_token_secret
                );

                await twitter.PublicTweet(
                    x.twitter.content
                        .replace(
                            "{link}",
                            `https://twitch.tv/${stream.user_name}`
                        )
                        .replace("{title}", stream.title)
                        .replace("{game}", stream.game_name)
                        .replace("{id}", stream.id)
                        .replace(/\\n/g, "\n")
                );

                twitter.Logout();
            }
        }
    });
}

export { NotificationsCheck };
