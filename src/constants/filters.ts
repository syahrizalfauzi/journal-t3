//Removed Filter[] so that it's a literal type

export const MANUSCRIPT_AUTHOR_FILTERS = [
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
export const MANUSCRIPT_CHIEF_FILTERS = [
  {
    key: "status",
    label: "Status",
    availableValues: [
      {
        value: "0",
        label: "Need Review",
      },
      {
        value: "-1",
        label: "Rejected",
      },
      {
        value: "1",
        label: "Need Invitation",
      },
      {
        value: "4",
        label: "Revision",
      },
      {
        value: "2",
        label: "Peer Review",
      },
      {
        value: "3",
        label: "Reviewed",
      },
      {
        value: "5",
        label: "Need Proofread",
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

export const MANUSCRIPT_REVIEWER_FILTERS = [
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
export const INVITATION_LIST_FILTERS = [
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
