import { z } from "zod";

export const questionSchema = z
  .object({
    id: z.number(),
    type: z.enum(["short-answer", "long-answer", "multiple-choice"]),
    content: z
      .string()
      .min(1, "The question cannot be empty")
      .max(3000, "The question cannot be more than 3000 characters"),
    choices: z.optional(
      z
        .array(z.string().min(1, "Write a valid option"))
        .min(2, "Write at least two options")
    ),
    marks: z.number().min(1, "The marks cannot be less than 1"),
    answer: z.object({
      content: z.optional(
        z
          .string()
          .min(1, "The answer cannot be empty")
          .max(5000, "The answer cannot be more than 5000 characters")
      ),
      choices: z.optional(
        z.array(z.string()).min(1, "Select at least one option")
      ),
    }),
  })
  .refine(
    (data) => {
      if (
        (data.type === "short-answer" || data.type === "long-answer") &&
        (data.answer.choices || data.choices)
      ) {
        return false;
      } else {
        return true;
      }
    },
    {
      message: `Select type "Multiple choice" in order to have multiple choices`,
      path: ["type"],
    }
  )
  .refine(
    (data) => {
      if (data.type === "multiple-choice" && data.answer.content) {
        return false;
      } else {
        return true;
      }
    },
    {
      message: `Select type "Short answer" or "Long answer" in order to have a text answer`,
      path: ["type"],
    }
  );
