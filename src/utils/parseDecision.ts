export const parseAssessmentDecision = (decision?: number) => {
  switch (decision) {
    case -1:
      return { label: "Rejected", className: "text-error" };
    case 0:
      return { label: "Unanswered", className: "text-gray-400" };
    case 1:
      return { label: "Major Revision", className: "text-orange-400" };
    case 2:
      return { label: "Minor Revision", className: "text-warning" };
    case 3:
      return { label: "Accepted", className: "text-success" };
    default:
      return { label: "Unanswered", className: "text-gray-400" };
  }
};
export const parseReviewDecision = (decision: number) => {
  switch (decision) {
    case -1:
      return "Rejected";
    case 0:
      return "Unanswered";
    case 1:
      return "Revision";
    case 2:
      return "Accepted";
    default:
      return "Unknown";
  }
};
