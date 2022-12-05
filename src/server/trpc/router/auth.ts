import { t } from "../trpc";
import {
  changePasswordValidator,
  newUserValidator,
  resetPasswordValidator,
} from "../../validators/user";
import passwordEncryptor from "../../utils/passwordEncryptor";
import { TRPCError } from "@trpc/server";
import { authGuard } from "../middlewares/authGuard";
import { compareSync } from "bcrypt";
import mutationError from "../../utils/mutationError";
import { z } from "zod";
import { sendEmail } from "../../utils/sendEmail";
import { sign, verify } from "jsonwebtoken";
import { env } from "../../../env/server.mjs";
import { sender } from "../../../constants/mailjet";
import { getBaseUrl } from "../../../utils/trpc";

const notFoundMessage = "User not found";

export const authRouter = t.router({
  // sendTestEmail: t.procedure.mutation(async () => {
  //   const mailer = new Mailjet({
  //     apiKey: "62b8157559c3f915d69e3452e5af65ce",
  //     apiSecret: "6b839c7ec4f063802781034dfb411a75",
  //   });

  //   const data: SendEmailV3_1.IBody = {
  //     Messages: [
  //       {
  //         From: {
  //           Email: "journalt3@gmail.com",
  //           Name: "Journal Support",
  //         },
  //         To: [
  //           {
  //             Email: "syahrizalfauzi16@gmail.com",
  //             Name: "Muhammad Syahrizal",
  //           },
  //         ],
  //         Subject: "Greetings from Mailjet.",
  //         TextPart: "My first Mailjet email",
  //         HTMLPart:
  //           "<h3>Dear passenger 1, welcome to <a href='https://www.mailjet.com/'>Mailjet</a>!</h3><br />May the delivery force be with you!",
  //         CustomID: "AppGettingStartedTest",
  //       },
  //     ],
  //   };

  //   const request = await mailer
  //     .post("send", { version: "v3.1" })
  //     .request({ ...data });

  //   console.log(request);

  //   return "oke lah";
  // }),
  register: t.procedure
    .input(newUserValidator)
    .mutation(async ({ input, ctx }) => {
      const expertise = input.profile.expertise.replace(/\s/g, "").split(",");
      const keywords = input.profile.keywords?.replace(/\s/g, "").split(",");
      //For some reason, zod refine is not running
      let errorEmail = false;
      try {
        const user = await ctx.prisma.user.create({
          data: {
            ...input,
            password: passwordEncryptor(input.password),
            profile: {
              create: { ...input.profile, expertise, keywords },
            },
          },
          select: {
            id: true,
            username: true,
            profile: { select: { email: true } },
          },
        });

        const verificationToken = sign(user.id, env.VERIFICATION_TOKEN_SECRET);

        try {
          await sendEmail({
            Messages: [
              {
                From: sender,
                To: [{ Email: input.profile.email }],
                Subject: "Verify Account",
                HTMLPart: `<h3>Verify Account</h3>
              <p>Click this link to verify your account with the username of ${
                user.username
              }</p>
              <a href="${getBaseUrl()}/auth/verify/${verificationToken}">Verify</a>`,
              },
            ],
          });

          return `User '${user.username}' successfully created, please check your email for verification`;
        } catch (e) {
          errorEmail = true;
        }
      } catch (e) {
        if (errorEmail)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to send email, please try again later",
          });
        throw mutationError(e);
      }
    }),

  user: t.procedure.use(authGuard()).query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        username: true,
        password: false,
        role: true,
        isActivated: true,
        createdAt: true,
        profile: true,
      },
    });

    if (!user)
      throw new TRPCError({ code: "NOT_FOUND", message: notFoundMessage });

    return user;
  }),
  changePassword: t.procedure
    .use(authGuard())
    .input(changePasswordValidator)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
      });

      if (!user)
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      if (!compareSync(input.oldPassword, user.password))
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Incorrect password",
        });
      if (input.oldPassword === input.newPassword)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Old and new password can't be same",
        });

      try {
        await ctx.prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            password: passwordEncryptor(input.newPassword),
          },
        });

        return "Password changed successfully";
      } catch (e) {
        throw mutationError(e, notFoundMessage);
      }
    }),
  sendVerificationEmail: t.procedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          username: input,
        },
        select: {
          id: true,
          username: true,
          profile: { select: { email: true } },
        },
      });

      if (!user || !user.profile)
        throw new TRPCError({ code: "NOT_FOUND", message: notFoundMessage });

      const verificationToken = sign(user.id, env.VERIFICATION_TOKEN_SECRET);

      try {
        await sendEmail({
          Messages: [
            {
              From: sender,
              To: [{ Email: user.profile.email }],
              Subject: "Verify Account",
              HTMLPart: `<h3>Verify Account</h3>
              <p>Click this link to verify your account with the username of ${
                user.username
              }</p>
              <a href="${getBaseUrl()}/auth/verify/${verificationToken}">Verify</a>`,
            },
          ],
        });

        return `Verification email sent to ${input}`;
      } catch (e) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send email, please try again later",
        });
      }
    }),
  verify: t.procedure.input(z.string()).mutation(async ({ input, ctx }) => {
    const userId = verify(input, env.VERIFICATION_TOKEN_SECRET) as string;

    if (!userId)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid token",
      });

    try {
      await ctx.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          isActivated: true,
        },
      });

      return "Account verified successfully, you may now log in";
    } catch (e) {
      throw mutationError(e, notFoundMessage);
    }
  }),
  sendForgotPasswordEmail: t.procedure
    .input(z.string().email())
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.prisma.profile.findUnique({
        where: { email: input },
        select: { user: { select: { id: true, username: true } } },
      });

      if (!profile)
        throw new TRPCError({ code: "NOT_FOUND", message: notFoundMessage });

      const passwordToken = sign(profile.user.id, env.PASSWORD_TOKEN_SECRET);

      try {
        await sendEmail({
          Messages: [
            {
              From: sender,
              To: [{ Email: input }],
              Subject: "Reset Password",
              HTMLPart: `<h3>Reset Password</h3><br /><a href="${getBaseUrl()}/auth/resetpassword/${passwordToken}">Click here to reset your password</a>`,
            },
          ],
        });

        return "Email sent successfully, please check your inbox";
      } catch (e) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send email, please try again later",
        });
      }
    }),
  checkForgotPasswordToken: t.procedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      try {
        const userId = verify(input, env.PASSWORD_TOKEN_SECRET) as string;

        if (!userId)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid token",
          });

        const user = await ctx.prisma.user.findUnique({
          where: {
            id: userId,
          },
          select: {
            id: true,
          },
        });

        if (!user)
          throw new TRPCError({ code: "NOT_FOUND", message: notFoundMessage });

        return "Token is valid";
      } catch (e) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid token",
        });
      }
    }),
  resetPassword: t.procedure
    .input(resetPasswordValidator)
    .mutation(async ({ ctx, input }) => {
      const userId = verify(input.token, env.PASSWORD_TOKEN_SECRET) as string;

      if (!userId)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid token",
        });

      const user = await ctx.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });

      if (!user)
        throw new TRPCError({ code: "NOT_FOUND", message: notFoundMessage });

      try {
        await ctx.prisma.user.update({
          where: { id: user.id },
          data: { password: passwordEncryptor(input.password) },
        });

        return "Password reset successfully";
      } catch (e) {
        throw mutationError(e, notFoundMessage);
      }
    }),
});
