import { Client } from "discord.js";
import { DiscordArgsOf, DiscordOn, EVENT_RESPONSE } from "../../types";
import { typeChannelText } from "../../utils/tools";
import { Event } from "../eventCreator";

class EventChannelPinsUpdate extends Event<"channelStateUpdate"> {
  constructor(client: Client) {
    super(client);
  }

  @DiscordOn({ event: "channelPinsUpdate" })
  registerEvent([channel, time]: DiscordArgsOf<"channelPinsUpdate">) {
    if (channel.isDMBased()) return;

    this.emit({
      event: "update",
      guildId: channel.guild.id,
      channel: {
        id: channel.id,
        name: channel.name,
        type: typeChannelText(channel.type),
        createdTimestamp: (channel.createdTimestamp ?? 0) / 1000,
        category: {
          id: channel.parent?.id ?? "null",
          name: channel.parent?.name ?? "uncategorized",
        },
        time,
      },
    });
  }
}

export { EventChannelPinsUpdate };
