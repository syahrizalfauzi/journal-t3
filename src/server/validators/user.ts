import { z } from "zod";
import { prisma } from "../db/client";

export const userValidator = z.object({
  username: z.string(),
  role: z.number(),
  profile: z.object({
    name: z.string(),
    address: z.string(),
    country: z.string(),
    phone: z.string(),
    gender: z.number(),
    email: z.string().email(),
    degree: z.string().nullish(),
    phoneWork: z.string().nullish(),
    addressWork: z.string().nullish(),
    birthdate: z.date().nullish(),
    institution: z.string().nullish(),
    position: z.string().nullish(),
    department: z.string().nullish(),
    expertise: z.string().refine((expertise) => {
      const { length } = expertise
        .replace(/\s/g, "")
        .split(",")
        .filter((e) => e.length > 0);

      return length > 0;
    }, "must be at least one"),
    keywords: z
      .string()
      .nullish()
      .refine((keywords) => {
        if (!keywords) return true;

        const { length } = keywords
          .replace(/\s/g, "")
          .split(",")
          .filter((e) => e.length > 0);

        return length >= 5;
      }, "must be at least five"),
  }),
});
export const createUserValidator = z.object({
  password: z.string().min(6),
  username: z.string().refine(async (username) => {
    const userExists =
      (await prisma.user.count({
        where: {
          username,
        },
      })) > 0;

    return !userExists;
  }, "is already in use"),
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
      }, "is already in use"),
  }),
});

export const updateUserValidator = z
  .object({
    id: z.string(),
  })
  .merge(userValidator);
export const newUserValidator = createUserValidator.merge(userValidator);
export const changePasswordValidator = z.object({
  oldPassword: z.string(),
  newPassword: z.string().min(6, "New Password anu"),
});
