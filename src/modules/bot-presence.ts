import { ActivityType, Client } from "discord.js";
import { PresenceType } from "../types";

function PresenceEdit(client: Client, type: PresenceType) {
    let text = "";
    const listSimple = [
        "A.B.C",
        "eubitos",
        "euclides",
        "eubot",
        "euby",
        "eubyt",
        "para eubyttttee",
        "AHHH, AAA GUERRAA",
        "daydreamer",
    ];

    switch (type) {
        case "memberCount":
            const memberCount = client.guilds.cache.reduce(
                (acc, guild) => acc + guild.members.cache.size,
                0
            );
            text = `${memberCount} pessoa(s) em ${client.guilds.cache.size} servidor(es)`;
            break;
        case "simple":
            text = listSimple[Math.floor(Math.random() * listSimple.length)];
            break;
    }

    client.user?.setPresence({
        activities: [
            {
                name: text,
                type: ActivityType.Listening,
            },
        ],
        status: "online",
    });

    console.log("Presence updated! new text:", text);
}

export { PresenceEdit };
