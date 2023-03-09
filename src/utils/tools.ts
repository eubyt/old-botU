import { ChannelType, Client, Guild, PermissionsBitField } from "discord.js";
import { ChannelTypeText } from "../types";

export async function fixMessage(content: string) {
  content = content.replace(/```/g, "");
  content = content.replace(/\s\s+/g, " ");
  content = content.trim();
  return content;
}

export function splitMessage(content: string) {
  const array = [];
  while (content.length > 800) {
    const index = content.lastIndexOf(" ", 800);
    array.push(content.slice(0, index));
    content = content.slice(index);
  }
  array.push(content);
  return array;
}

export function fixMention(guild: Guild, idRole: string) {
  if (guild.roles.everyone.id === idRole) return "@everyone";
  if (guild.roles.cache.get(idRole)) return `<@&${idRole}>`;
  return idRole;
}

export function typeChannelText(type: ChannelType): ChannelTypeText {
  switch (ChannelType[type]) {
    case "GuildText":
      return "text";
    case "GuildVoice":
      return "voice";
    case "GuildCategory":
      return "category";
    case "GuildNews":
      return "news";
    case "GuildForum":
      return "forum";
    default:
      return "unknown";
  }
}

//Convert bitfield to array of permissions
export function bitfieldToArray(bitfield: bigint) {
  const permissions = [];
  for (const [perm, value] of Object.entries(PermissionsBitField.Flags)) {
    if (bitfield & value) permissions.push(perm);
  }
  return permissions;
}
