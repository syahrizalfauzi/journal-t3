import { t } from "../trpc";
import { newUserValidators } from "../../validators/user";
import passwordEncryptor from "../../utils/passwordEncryptor";

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
          profile: { select: { email: true } },
        },
      });

      return { message: `User '${user.username}' succesfully created` };
    }),
});
