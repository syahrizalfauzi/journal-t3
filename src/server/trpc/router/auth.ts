import { t } from "../trpc";
import { newUserValidators, userValidators } from "../../validators/user";
import passwordEncryptor from "../../utils/passwordEncryptor";

export const authRouter = t.router({
  user: t.procedure.query(({ ctx }) => {
    return { message: ctx.session ? "HALLO SIR" : "u r normie" };
  }),
  register: t.procedure
    .input(newUserValidators.merge(userValidators))
    .mutation(async ({ input, ctx }) => {
      const expertise = input.profile.expertise.replace(/\s/g, "").split(",");
      const keywords = input.profile.keywords?.replace(/\s/g, "").split(",");

      console.log("Got register input", {
        input,
        expertise,
        keywords,
      });

      console.log("delaying lol");
      await new Promise<void>((res) => setTimeout(() => res(), 1000));

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

      //Does not set cookie because account needs to be activated
      return { message: `User '${user.username}' succesfully created` };
    }),
});
