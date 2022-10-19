import { t } from "../trpc";
import { authGuard } from "../middlewares/authGuard";
import { createInvitationValidator } from "../../validators/invitation";
import { INVITATION_STATUS } from "../../../constants/numbers";
import mutationError from "../../utils/mutationError";

export const invitationRouter = t.router({
  create: t.procedure
    .use(authGuard(["chief"]))
    .input(createInvitationValidator)
    .mutation(async ({ ctx, input }) => {
      await new Promise<void>((res) => setTimeout(() => res(), 3000));
      try {
        const { user } = await ctx.prisma.invitation.create({
          data: {
            user: { connect: { id: input.reviewerId } },
            status: INVITATION_STATUS.unanswered,
            team: {
              connect: {
                manuscriptId: input.manuscriptId,
              },
            },
          },
          select: {
            user: {
              select: { profile: { select: { name: true } } },
            },
            // user: { select: { profile: { select: { email: true } } } },
            // team: {
            //   select: {
            //     manuscript: { select: { title: true, abstract: true } },
            //   },
            // },
          },
        });

        // const invitations = await ctx.prisma.$transaction(invitationsCreate);

        return `Invitation sent to ${user.profile!.name}`;

        // await sendEmail({
        //   bcc: invitations
        //     .filter((e) => e.user.profile !== null)
        //     .map((e) => e.user.profile!.email),
        //   subject: "New Invitation",
        //   html: `
        //   <h1>${invitations[0].team.manuscript.title}</h1>
        //
        //   <p>You have been invited to be a reviewer of the submission with the title above</p>
        //   <a href="${frontendOrigin}/dashboard/reviewer/invitations">Click this link to open your invitations</a>
        //
        //   <p><b>Abstract</b></p>
        //   <p>${invitations[0].team.manuscript.abstract}</p>
        // `,
        // });
      } catch (e) {
        throw mutationError(
          e,
          "Invalid selected user or no team is present for the selected manuscript"
        );
      }
    }),
});
