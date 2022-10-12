import moment from 'moment';

const parseDate = (dateString: string) => moment(dateString).format('ddd, D MMM YYYY, HH:mm');

export default parseDate;
