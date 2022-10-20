import { t } from "../trpc";
import { authGuard } from "../middlewares/authGuard";
import {
  createInvitationValidator,
  updateInvitationValidator,
} from "../../validators/invitation";
import {
  HISTORY_STATUS,
  INVITATION_STATUS,
  MAX_TEAM_USERS,
  REVIEW_DECISION,
} from "../../../constants/numbers";
import mutationError from "../../utils/mutationError";
import { invitationListQuery } from "../../queries";
import { Prisma } from "@prisma/client";
import { paginationMetadata, paginationQuery } from "../../utils/pagination";
import { getOrderQuery } from "../../utils/sortOrder";
import { TRPCError } from "@trpc/server";

export const invitationRouter = t.router({
  create: t.procedure
    .use(authGuard(["chief"]))
    .input(createInvitationValidator)
    .mutation(async ({ ctx, input }) => {
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
  list: t.procedure
    .use(authGuard(["reviewer"]))
    .input(invitationListQuery)
    .query(async ({ ctx, input }) => {
      const filter: Prisma.InvitationWhereInput = {
        AND: [
          { userId: ctx.session.user.id },
          ...(input.filter?.key === "status"
            ? [{ status: Number(input.filter?.value ?? "0") }]
            : []),
        ],
      };

      const getCount = ctx.prisma.invitation.count({
        where: filter,
      });
      const getInvitations = ctx.prisma.invitation.findMany({
        ...paginationQuery(input),
        where: filter,
        orderBy: getOrderQuery(input, ["createdAt", "status", "updatedAt"]) ?? {
          createdAt: "desc",
        },
        select: {
          id: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          team: {
            select: {
              _count: { select: { users: true } },
              manuscript: {
                select: {
                  title: true,
                  authors: true,
                  abstract: true,
                  isBlind: true,
                },
              },
            },
          },
        },
      });

      const [totalCount, invitations] = await ctx.prisma.$transaction([
        getCount,
        getInvitations,
      ]);

      return {
        ...paginationMetadata(totalCount, input),
        invitations,
      };
    }),
  update: t.procedure
    .use(authGuard(["reviewer"]))
    .input(updateInvitationValidator)
    .mutation(async ({ ctx, input }) => {
      //Verify invitation ownership
      const invitation = await ctx.prisma.invitation.findFirst({
        where: {
          AND: [
            { id: input.id },
            { userId: ctx.session.user.id },
            { status: INVITATION_STATUS.unanswered },
          ],
        },
        select: {
          teamId: true,
          team: {
            select: {
              users: {
                where: { id: ctx.session.user.id },
                select: { id: true },
              },
            },
          },
        },
      });

      if (!invitation)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation has already been answered",
        });

      //Update the invitation
      await ctx.prisma.invitation.update({
        where: { id: input.id },
        data: {
          status: input.status
            ? INVITATION_STATUS.accepted
            : INVITATION_STATUS.rejected,
        },
      });

      if (!input.status)
        return {
          message: "Invitation rejected",
        };

      if (invitation.team.users.some((user) => user.id === ctx.session.user.id))
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You're already in the team",
        });

      //TRIGGER ZONE
      //Check if the team has less than 4 members
      const team = await ctx.prisma.team.findFirst({
        where: {
          id: invitation.teamId,
        },
        select: {
          id: true,
          _count: { select: { users: true } },
        },
      });

      if (!team)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Review team not found",
        });
      if (team._count.users >= MAX_TEAM_USERS)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Team is already full",
        });

      //Team has less than 4 members, append the reviewer to the users
      const teamUpdate = await ctx.prisma.team.update({
        where: { id: team.id },
        data: {
          users: {
            connect: {
              id: ctx.session.user.id,
            },
          },
        },
        select: {
          manuscript: {
            select: {
              id: true,
              title: true,
              history: {
                take: 1,
                where: { status: HISTORY_STATUS.inviting },
                select: {
                  id: true,
                  manuscriptId: true,
                  review: true,
                  status: true,
                  submission: true,
                },
              },
            },
          },
          _count: { select: { users: true } },
        },
      });

      //If the team is full upon appending the new reviewer, create a history and review
      if (teamUpdate._count.users < MAX_TEAM_USERS)
        return {
          message: `Accepted invitation to '${teamUpdate.manuscript.title}'`,
          reviewerCount: teamUpdate._count.users,
        };

      if (!teamUpdate.manuscript.history[0]?.submission)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Submission history not found",
        });

      const history = await ctx.prisma.history.create({
        data: {
          status: HISTORY_STATUS.reviewing,
          submission: {
            connect: { id: teamUpdate.manuscript.history[0].submission.id },
          },
          manuscript: {
            connect: { id: teamUpdate.manuscript.id },
          },
          review: {
            create: { decision: REVIEW_DECISION.unanswered },
          },
        },
        select: { id: true },
      });

      const latestHistoryUpdate = ctx.prisma.latestHistory.update({
        where: {
          manuscriptId: teamUpdate.manuscript.id,
        },
        data: {
          history: { connect: { id: history.id } },
        },
        select: { manuscript: { select: { id: true, title: true } } },
      });

      // const chiefEmailFetch = ctx.prisma.user.findMany({
      //   where: {
      //     OR: getRoleNumbers("chief").map((e) => ({
      //       role: e,
      //     })),
      //   },
      //   select: { profile: { select: { email: true } } },
      // });

      await ctx.prisma.$transaction([
        latestHistoryUpdate,
        // chiefEmailFetch,
      ]);

      return {
        message: `Accepted invitation to '${teamUpdate.manuscript.title}'`,
        manuscriptId: teamUpdate.manuscript.id,
      };

      // await sendEmail({
      //   bcc: chiefEmails
      //     .filter((e) => e.profile !== null)
      //     .map((e) => e.profile!.email),
      //   subject: "Review Need Action",
      //   html: `
      //     <h1>${latestHistory.manuscript.title}</h1>

      //     <p>Reviewers has accepted the invitation for the manuscript review with the title above</p>
      //     <p>Please set a due date for the review by clicking the link below</p>
      //     <a href="${frontendOrigin}/dashboard/chief/submissions/${latestHistory.manuscript.id}">Submission detail</a>
      //   `,
      // });
    }),
});
