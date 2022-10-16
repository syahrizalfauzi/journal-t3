import { Filter } from "../types/Filter";

export const MANUSCRIPT_CHIEF_AUTHOR_FILTERS: readonly Filter[] = [
  {
    key: "status",
    label: "Status",
    availableValues: [
      {
        value: "0",
        label: "Waiting For Review",
      },
      {
        value: "-1",
        label: "Rejected",
      },
      {
        value: "1",
        label: "Under Review",
      },
      {
        value: "4",
        label: "Under Review (Revision)",
      },
      {
        value: "2",
        label: "Under Peer Review",
      },
      {
        value: "3",
        label: "Reviewed",
      },
      {
        value: "5",
        label: "Proofread",
      },
      {
        value: "6",
        label: "Finalized",
      },
      {
        value: "7",
        label: "Published",
      },
    ],
  },
] as const;
export const MANUSCRIPT_REVIEWER_FILTERS: readonly Filter[] = [
  {
    key: "assessed",
    label: "Status",
    availableValues: [
      {
        value: "1",
        label: "Not Assessed",
      },
      {
        value: "2",
        label: "Assessed",
      },
    ],
  },
] as const;
export const INVITATION_FILTERS: readonly Filter[] = [
  {
    key: "status",
    label: "Status",
    availableValues: [
      { value: "0", label: "Unanswered" },
      { value: "1", label: "Rejected" },
      { value: "2", label: "Accepted" },
    ],
  },
] as const;
