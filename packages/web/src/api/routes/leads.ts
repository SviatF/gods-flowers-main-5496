import { z } from "zod";
import { desc } from "drizzle-orm";
import { base } from "../__core/app";
import { db } from "../database";
import * as schema from "../database/schema";

const createInput = z.object({
  name: z.string().trim().min(2, "Вкажіть імʼя").max(80),
  phone: z
    .string()
    .trim()
    .min(9, "Вкажіть номер телефону")
    .max(24)
    .regex(/^[0-9+()\-\s]+$/, "Некоректний номер"),
  email: z.string().trim().email("Некоректний email").optional().or(z.literal("")),
  course: z.string().trim().min(1, "Оберіть курс").max(80),
  comment: z.string().trim().max(600).optional().or(z.literal("")),
});

export const leads = {
  create: base.input(createInput).handler(async ({ input }) => {
    const [row] = await db
      .insert(schema.leads)
      .values({
        name: input.name,
        phone: input.phone,
        email: input.email ? input.email : null,
        course: input.course,
        comment: input.comment ? input.comment : null,
      })
      .returning();

    return { id: row.id, createdAt: row.createdAt };
  }),

  list: base.handler(() =>
    db.select().from(schema.leads).orderBy(desc(schema.leads.createdAt)).limit(100),
  ),
};
