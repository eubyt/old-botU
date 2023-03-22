import Bull from "bull";
import { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } from "./environment";

const SETTINGS: Bull.QueueOptions = {
  redis: {
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
  },
  settings: {
    lockDuration: 12000000,
    lockRenewTime: 600000,
    maxStalledCount: 0,
  },
};

export const queueSendMessage = new Bull("discord_sendMessage", SETTINGS);
