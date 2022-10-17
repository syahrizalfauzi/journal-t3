import { t } from "../trpc";
import { historyManuscriptIdValidator } from "../../validators/history";
import { TRPCError } from "@trpc/server";
import { HistoryStatus } from "../../../types/History";
import { HISTORY_STATUS } from "../../../constants/numbers";

export const previousHistoryGuard = (
  inputValidator: typeof historyManuscriptIdValidator,
  historyStatus: HistoryStatus
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