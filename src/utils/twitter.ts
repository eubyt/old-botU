import Twit from "twit";

export class Twitter {
    T: Twit;

    constructor(
        consumer_key: string,
        consumer_secret: string,
        access_token: string,
        access_token_secret: string
    ) {
        this.T = new Twit({
            consumer_key,
            consumer_secret,
            access_token,
            access_token_secret,
        });

        this.T.get("account/verify_credentials", {
            include_entities: false,
            skip_status: true,
            include_email: false,
        });
    }

    async PublicTweet(tweet: string) {
        await this.T.post("statuses/update", { status: tweet }, (err, res) => {
            if (err) {
                throw err;
            }
            console.log("Tweet publicado com sucesso");
        });
    }

    UpdateBio(bio: string) {
        this.T.post("account/update_profile", {
            description: bio,
        });
    }

    Logout() {
        this.T.get("account/end_session", (err, res) => {
            if (err) {
                throw err;
            }
            console.log("Sessão finalizada com sucesso");
        });
    }
}
