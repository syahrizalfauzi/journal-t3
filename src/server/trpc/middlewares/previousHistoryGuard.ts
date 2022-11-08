import { t } from "../trpc";
import { TRPCError } from "@trpc/server";
import { HISTORY_STATUS } from "../../../constants/numbers";
import { manuscriptIdValidator } from "../../validators/manuscript";

export const previousHistoryGuard = (
  inputValidator: typeof manuscriptIdValidator,
  historyStatus: keyof typeof HISTORY_STATUS
) =>
  t.middleware(async ({ ctx, input, next }) => {
    const { manuscriptId } = inputValidator.parse(input);

    const previousHistory = await ctx.prisma.history.findFirst({
      where: {
        AND: [{ manuscriptId }, { status: HISTORY_STATUS[historyStatus] }],
      },
      orderBy: { createdAt: "desc" },
      include: {
        submission: { select: { fileUrl: true, id: true } },
        review: { select: { decision: true } },
      },
    });

    if (!previousHistory)
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Latest history not found",
      });

    if (previousHistory.status !== HISTORY_STATUS[historyStatus])
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Latest history is not '${historyStatus}' (${previousHistory.status})`,
      });

    return await next({
      ctx: {
        ...ctx,
        previousHistory,
      },
    });
  });
