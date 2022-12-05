import Mailjet, { SendEmailV3_1 } from "node-mailjet";
import { mailjetParams } from "../../constants/mailjet";

export const sendEmail = (body: SendEmailV3_1.IBody) => {
  const mailer = new Mailjet(mailjetParams);
  return mailer.post("send", { version: "v3.1" }).request({ ...body });
};
