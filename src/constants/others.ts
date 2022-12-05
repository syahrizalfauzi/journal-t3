// export const SAMPLE_FILE_URL =
//   "https://www.adobe.com/support/products/enterprise/knowledgecenter/media/c4611_sample_explain.pdf";

export const MANUSCRIPT_STEPS_LABEL = [
  "Submitted",
  "Reviewed",
  "Under Review",
  "Peer Reviewed",
  "Revision Under Review",
  "Proofread",
  "Finalized",
  "Published",
] as const;
export const FOLDER_NAMES = {
  manuscripts: "manuscripts",
  coverFiles: "coverFiles",
  optionalFiles: "optionalFiles",
  assessmentFiles: "assessmentFiles",
};
export const FILE_ACCEPTS = ".pdf, .doc, .docx";
