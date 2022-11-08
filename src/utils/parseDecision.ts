import { ASSESSMENT_DECISION, REVIEW_DECISION } from "../constants/numbers";

export const parseAssessmentDecision = (decision?: number) => {
  switch (decision) {
    case ASSESSMENT_DECISION.rejected:
      return { label: "Rejected", className: "text-error" };
    case ASSESSMENT_DECISION.unanswered:
      return { label: "Unanswered", className: "text-gray-400" };
    case ASSESSMENT_DECISION.majorRevision:
      return { label: "Major Revision", className: "text-orange-400" };
    case ASSESSMENT_DECISION.minorRevision:
      return { label: "Minor Revision", className: "text-warning" };
    case ASSESSMENT_DECISION.accepted:
      return { label: "Accepted", className: "text-success" };
    default:
      return { label: "Unanswered", className: "text-gray-400" };
  }
};
export const parseReviewDecision = (decision: number) => {
  switch (decision) {
    case REVIEW_DECISION.rejected:
      return "Rejected";
    case REVIEW_DECISION.unanswered:
      return "Unanswered";
    case REVIEW_DECISION.revision:
      return "Revision";
    case REVIEW_DECISION.accepted:
      return "Accepted";
    default:
      return "Unknown";
  }
};
