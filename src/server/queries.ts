import { questionListSorts, userListSorts } from "../utils/sorts";
import generateQueryInput from "./utils/generateQueryInput";

export const userListQuery = generateQueryInput(userListSorts);
export const questionListQuery = generateQueryInput(questionListSorts);
