import { AvailableRoles } from "../types/Role";

const getStatusProps = (
  history: {
    status: number;
    review?: {
      decision?: number;
      dueDate?: Date | null;
    } | null;
  },
  role?: Exclude<AvailableRoles, "admin">,
  hasSelfAssessment?: boolean,
  isDoneAssessing?: boolean
): {
  color: string;
  label: string;
  message: string;
} => {
  switch (history.status) {
    case -1:
      return {
        color: "error",
        message:
          role === "author"
            ? "Your manuscript is rejected by the chief editor."
            : "",
        label: "Rejected",
      };
    case 0:
      return {
        color: role === "chief" ? "primary" : "gray-200",
        message: {
          author:
            "Your manuscript has been submitted, please wait for the initial review.",
          reviewer: "",
          chief: "Please do an initial review on this manuscript",
          unknown: "",
        }[role ?? "unknown"],
        label: role === "author" ? "Waiting For Review" : "Need Review",
      };
    case 1:
      return {
        color: role === "chief" ? "primary" : "gray-200",
        message: {
          author:
            "Your manuscript is on it's way to be under review by the reviewers, please wait for further update.",
          reviewer:
            "Waiting for other reviewers to accept the invitation, please wait for further update",
          chief:
            "The manuscript has been reviewed initially, please invite reviewers for peer review",
          unknown: "",
        }[role ?? "unknown"],
        label: {
          author: "Under Review",
          reviewer: "Waiting For Other Reviewers",
          chief: "Need Invitation",
          unknown: "",
        }[role ?? "unknown"],
      };
    case 2:
      return {
        color: {
          author: "gray-200",
          reviewer: history.review?.dueDate
            ? hasSelfAssessment && isDoneAssessing
              ? "success"
              : "primary"
            : "gray-200",
          chief: history.review?.dueDate ? "gray-200" : "primary",
          unknown: "",
        }[role ?? "unknown"],
        message: {
          author:
            "Your manuscript is under review by the reviewers, please wait for further update.",
          reviewer: history.review?.dueDate
            ? hasSelfAssessment && isDoneAssessing
              ? "You have submitted your assessment"
              : "Please do a review on the latest file of this submission"
            : "Awaiting chief editor to set a due date, please wait for further update",
          chief: history.review?.dueDate
            ? "The manuscript is under peer review, please wait for further update"
            : "The reviewers has accepted the invitation, please set the due date of the review",
          unknown: "",
        }[role ?? "unknown"],
        label: {
          author: "Under Peer Review",
          reviewer: history.review?.dueDate
            ? hasSelfAssessment && isDoneAssessing
              ? "Assessment Submitted"
              : "Need Assessment"
            : "Waiting For Due Date",
          chief: history.review?.dueDate
            ? "Under Peer Review"
            : "Need Due Date",
          unknown: "",
        }[role ?? "unknown"],
      };
    case 3:
      if (!history.review)
        return { color: "secondary", message: "", label: "Reviewed" };

      switch (history.review.decision) {
        case -1:
          return { color: "error", message: "", label: "Reviewed (Rejected)" };
        case 1:
          return {
            color: "warning",
            message: "",
            label: "Reviewed (Revision)",
          };
        case 2:
          return {
            color: "success",
            message: {
              author:
                "Your manuscript has been accepted by the editor & the reviewers, please wait for the finalized article to be sent by the journal team for proofreading.",
              reviewer: "",
              chief:
                "The manuscript review is accept, please submit a finalized article for proofreading",
              unknown: "",
            }[role ?? "unknown"],
            label: "Reviewed (Accepted)",
          };
        default:
          if (role === "chief")
            return {
              color: "primary",
              message: "Please give a decision on this review",
              label: "Need Decision",
            };
          if (role === "reviewer")
            return {
              color: "success",
              message: "",
              label: "Assessment Submitted",
            };
          return {
            color: "gray-200",
            message:
              "Your manuscript is under review by the editor & the reviewers, please wait for further update.",
            label: "Under Peer Review",
          };
      }
    case 4:
      return {
        color:
          role === "reviewer"
            ? history.review?.dueDate && hasSelfAssessment
              ? "success"
              : "primary"
            : "gray-200",
        message: {
          author:
            "Your revision is under review by the reviewers, please wait for further update.",
          reviewer: history.review?.dueDate
            ? hasSelfAssessment
              ? ""
              : "Please do a review on the latest file of this submission"
            : "Awaiting chief editor to set a due date, please wait for further update",
          chief: history.review?.dueDate
            ? "The revision is under peer review, please wait for further update"
            : "The reviewers has accepted the invitation, please set the due date of the review",
          unknown: "",
        }[role ?? "unknown"],
        label: {
          author: "Revision Peer Review",
          reviewer: history.review?.dueDate
            ? hasSelfAssessment
              ? "Assessment Submitted"
              : "Need Assessment"
            : "Waiting For Due Date",
          chief: history.review?.dueDate
            ? "Revision Peer Review"
            : "Need Due Date",
          unknown: "",
        }[role ?? "unknown"],
      };
    case 5:
      return {
        color: role === "author" ? "primary" : "accent",
        message: {
          author:
            "Please do a proofreading on your finalized article, you may submit a revision once",
          reviewer: "",
          chief:
            "The author is proofreading the finalized article, please wait for further update",
          unknown: "",
        }[role ?? "unknown"],
        label: role === "author" ? "Need Proofread" : "Under Proofread",
      };
    case 6:
      return {
        color: "info",
        message: {
          author:
            "Your article has been finalized, please await for publishing.",
          reviewer: "",
          chief:
            "The author has proofread the article, please publish the article to the journal",
          unknown: "",
        }[role ?? "unknown"],
        label: "Finalized",
      };
    case 7:
      return {
        color: "info",
        message: {
          author:
            "Congratulations! your paper has been published to a journal, please click the link above to see your published paper.",
          reviewer: "",
          chief: "The article has been published to the journal",
          unknown: "",
        }[role ?? "unknown"],
        label: "Published",
      };
    default:
      return { color: "gray-200", message: "", label: "Unknown Status" };
  }
};

export default getStatusProps;
