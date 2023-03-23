import Axios from "axios";

export class Twitch {
    constructor(readonly user_id: string) {
        this.user_id = user_id;
    }

    private async twitchCreateTokenAccess() {
        try {
            const response = await Axios.post(
                "https://id.twitch.tv/oauth2/token",
                {
                    client_id: process.env.TTV_CLIENT_ID,
                    client_secret: process.env.TTV_CLIENT_SECRET,
                    grant_type: "client_credentials",
                }
            );
            return response.data.access_token;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async CheckStreamerOnline() {
        try {
            const response = await Axios.get(
                `https://api.twitch.tv/helix/streams?user_id=${this.user_id}`,
                {
                    headers: {
                        "Client-ID": process.env.TTV_CLIENT_ID,
                        Authorization: `Bearer ${await this.twitchCreateTokenAccess()}`,
                    },
                }
            );
            if (response.data.data.length > 0) {
                const { id, user_name, game_name, started_at, title } =
                    response.data.data[0];
                return {
                    streamer_online: true,
                    user_name,
                    game_name,
                    started_at,
                    title,
                    id,
                };
            }
            return {
                streamer_online: false,
            };
        } catch (error) {
            console.error(error);
            return {
                streamer_online: false,
                user_name: null,
                game_name: null,
                started_at: null,
                title: null,
                id: null,
            };
        }
    }
}
