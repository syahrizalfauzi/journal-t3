import { z } from "zod";
import { prisma } from "../db/client";

export const userValidators = z.object({
  username: z.string(),
  role: z.number(),
  profile: z.object({
    name: z.string(),
    address: z.string(),
    country: z.string(),
    phone: z.string(),
    gender: z.number({
      invalid_type_error: "The input must be a number",
    }),
    email: z.string().email(),
    degree: z.string().nullish(),
    phoneWork: z.string().nullish(),
    addressWork: z.string().nullish(),
    birthdate: z.date().nullish(),
    position: z.string().nullish(),
    department: z.string().nullish(),
    expertise: z.string().refine((expertise) => {
      const { length } = expertise.replace(/\s/g, "").split(",");

      return length > 0;
    }),
    keywords: z
      .string()
      .nullish()
      .refine((keywords) => {
        if (!keywords) return true;

        const { length } = keywords.replace(/\s/g, "").split(",");

        return length >= 5;
      }),
  }),
});
export const newUserValidators = z.object({
  password: z.string().min(6),
  username: z.string().refine(async (username) => {
    const userExists =
      (await prisma.user.count({
        where: {
          username,
        },
      })) > 0;

    return !userExists;
  }, "Username is already in use"),
  profile: z.object({
    email: z
      .string()
      .email()
      .refine(async (email) => {
        const profileExists =
          (await prisma.profile.count({
            where: {
              email,
            },
          })) > 0;

        return !profileExists;
      }),
  }),
});