import { QUESTION_LIST_SORTS, USER_LIST_SORTS } from "../constants/sorts";
import generateQueryInput from "./utils/generateQueryInput";

export const userListQuery = generateQueryInput(USER_LIST_SORTS);
export const questionListQuery = generateQueryInput(QUESTION_LIST_SORTS);
