import { IClientParams } from "node-mailjet/declarations/client/IClient";
import { env } from "../env/server.mjs";

export const mailjetParams: IClientParams = {
  apiKey: env.MAILER_API_KEY,
  apiSecret: env.MAILER_API_SECRET,
};

export const sender = {
  Email: "journalt3@gmail.com",
  Name: "Journal Support",
};
