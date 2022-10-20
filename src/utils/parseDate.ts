import moment from "moment";

const parseDate = (date: Date, fallback?: string) => {
  const momentDate = moment(date);

  return momentDate.isValid()
    ? momentDate.format("ddd, D MMM YYYY, HH:mm")
    : fallback ?? "Not set";
};

export default parseDate;
