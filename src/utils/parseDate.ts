import moment from "moment";

const parseDate = (date: string | Date) =>
  moment(date).format("ddd, D MMM YYYY, HH:mm");

export default parseDate;
