import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import discord from "./discord";
import { FIREBASE_CREDS } from "./environment";

const FIREBASE_CREDS_JSON = JSON.parse(FIREBASE_CREDS);
export const firebaseApp = initializeApp({
  credential: cert({
    projectId: FIREBASE_CREDS_JSON.project_id,
    clientEmail: FIREBASE_CREDS_JSON.client_email,
    privateKey: FIREBASE_CREDS_JSON.private_key,
  }),
});

const db = getFirestore(firebaseApp);

const { start } = discord;
start();
