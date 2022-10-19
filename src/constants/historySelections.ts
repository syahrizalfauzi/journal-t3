//Removed type annotation & cast as readonly so that the query result would actually have the type

export const AUTHOR_HISTORY_SELECTION = {
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
} as const;

export const REVIEWER_HISTORY_SELECTION = {
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
} as const;

export const CHIEF_HISTORY_SELECTION = {
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
} as const;
