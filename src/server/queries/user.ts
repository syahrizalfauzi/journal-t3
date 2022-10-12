import { userListSorts } from "../../utils/sorts/user";
import generateQueryInput from "../utils/generateQueryInput";

export const userListQuery = generateQueryInput(userListSorts);
