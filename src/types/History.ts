import { HISTORY_STATUS } from "../constants/numbers";

export type HistoryStatus = keyof typeof HISTORY_STATUS;
export type HistoryNumbers = typeof HISTORY_STATUS[HistoryStatus];
