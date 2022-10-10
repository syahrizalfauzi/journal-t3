import { hashSync } from "bcrypt";
import { env } from "process";

const hashRounds = Number(env.HASH_ROUNDS) ?? 10;

const passwordEncryptor = (password: string) => {
  return hashSync(password, hashRounds);
};

export default passwordEncryptor;
