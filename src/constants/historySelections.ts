import { Prisma } from "@prisma/client";

export const AUTHOR_HISTORY_SELECTION: Prisma.HistorySelect = {
  updatedAt: true,
  status: true,
  submission: true,
  review: {
    select: {
      comment: true,
      decision: true,
      assesment: {
        select: {
          id: true,
          decision: true,
        },
        where: { isDone: true },
      },
    },
  },
};

export const REVIEWER_HISTORY_SELECTION: Prisma.HistorySelect = {
  updatedAt: true,
  status: true,
  submission: true,
  review: {
    select: {
      id: true,
      dueDate: true,
      comment: true,
      decision: true,
      assesment: {
        orderBy: { userId: "asc" },
        select: {
          id: true,
          isDone: true,
          user: { select: { id: true } },
          decision: true,
        },
        // where: { isDone: true },
      },
    },
  },
};

export const CHIEF_HISTORY_SELECTION: Prisma.HistorySelect = {
  updatedAt: true,
  status: true,
  submission: true,
  id: true,
  review: {
    select: {
      id: true,
      dueDate: true,
      comment: true,
      decision: true,
      assesment: {
        orderBy: {
          userId: "asc",
        },
        select: {
          id: true,
          user: { select: { id: true, profile: { select: { name: true } } } },
          decision: true,
        },
        where: { isDone: true },
      },
    },
  },
};
