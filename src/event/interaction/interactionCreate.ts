import { ChannelType, Client, TextBasedChannel } from "discord.js";
import { DiscordArgsOf, DiscordOn } from "../../types";
import { Event } from "../eventCreator";

class EventInteractionCreate extends Event<"interactionUpdate"> {
    constructor(client: Client) {
        super(client);
    }

    getFunc(customId: any) {
        const func = customId.split("(")[0];
        const args = customId.split("(")[1].split(")")[0].split(",");

        return {
            func,
            args,
        };
    }

    @DiscordOn({ event: "interactionCreate" })
    registerEvent([interaction]: DiscordArgsOf<"interactionCreate">) {
        let customId = null;
        let reply = null;
        let value = null;

        if (interaction.isButton()) {
            customId = interaction.customId;
            reply = async (obj: any) => await interaction.reply(obj);
        } else if (interaction.isStringSelectMenu()) {
            customId = interaction.customId;
            value = interaction.values;
            reply = async (obj: any) => await interaction.reply(obj);
        }

        if (customId) {
            const { func, args } = this.getFunc(customId);
            this.emit({
                event: func,
                args: value ? value : args,
                guildId: interaction.guildId as string,
                user: interaction.user,
                reply,
            });
        }
    }
}

export { EventInteractionCreate };
