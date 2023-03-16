import dotenv from "dotenv";
dotenv.config();

// Redis config
export const REDIS_HOST = process.env.REDIS_HOST;
export const REDIS_USERNAME = process.env.REDIS_USERNAME;
export const REDIS_PORT = parseInt(process.env.REDIS_PORT as string);
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

// Discord config
export const DISCORD_BOT_TOKEN =
    process.env.NODE_ENV === "developer"
        ? process.env.DISCORD_BOT_TOKEN_DEV
        : process.env.DISCORD_BOT_TOKEN;

export const FIREBASE_CREDS = process.env
    .FIREBASE_SERVICE_ACCOUNT_KEY as string;
