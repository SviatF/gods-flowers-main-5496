import { z } from "zod";
import { base } from "../__core/app";
import { createLead } from "../lead-store";

const createInput = z.object({
  name: z.string().trim().min(2, "Вкажіть імʼя").max(80),
  phone: z
    .string()
    .trim()
    .min(9, "Вкажіть номер телефону")
    .max(24)
    .regex(/^[0-9+()\-\s]+$/, "Некоректний номер"),
  course: z.string().trim().min(1, "Оберіть курс").max(120),
  comment: z.string().trim().max(600).optional().or(z.literal("")),
  pageUrl: z.string().trim().max(800).optional().or(z.literal("")),
  referrer: z.string().trim().max(800).optional().or(z.literal("")),
});

export const leads = {
  create: base.input(createInput).handler(async ({ input }) => {
    const row = await createLead(input);
    return { id: row.id, createdAt: row.createdAt };
  }),
};
