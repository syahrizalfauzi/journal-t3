import { t } from "../trpc";
import {
  changePasswordValidators,
  newUserValidators,
} from "../../validators/user";
import passwordEncryptor from "../../utils/passwordEncryptor";
import { TRPCError } from "@trpc/server";
import { authGuard } from "../authGuard";
import { compareSync } from "bcrypt";
import mutationError from "../../utils/mutationError";

const notFoundMessage = "User not found";

export const authRouter = t.router({
  register: t.procedure
    .input(newUserValidators)
    .mutation(async ({ input, ctx }) => {
      const expertise = input.profile.expertise.replace(/\s/g, "").split(",");
      const keywords = input.profile.keywords?.replace(/\s/g, "").split(",");

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
        },
      });

      return `User '${user.username}' successfully created`;
    }),
  user: t.procedure.use(authGuard()).query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.session?.user.id },
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
    .input(changePasswordValidators)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          id: ctx.session?.user.id,
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
      } catch (e: any) {
        throw mutationError(e, notFoundMessage);
      }
    }),
});
