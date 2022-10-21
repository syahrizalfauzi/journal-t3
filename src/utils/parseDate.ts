import moment from "moment";

export const parseDate = (date: Date, fallback?: string) => {
  const momentDate = moment(date);

  return momentDate.isValid()
    ? momentDate.format("ddd, D MMM YYYY, HH:mm")
    : fallback ?? "Not set";
};
export const parseDateDay = (date: Date, fallback?: string) => {
  const momentDate = moment(date);

  return momentDate.isValid()
    ? momentDate.format("ddd, D MMM YYYY")
    : fallback ?? "Not set";
};
