import { z } from "zod";

export const submissionSchema = z.object({
  submission: z.array(
    z.object({
      questionId: z.string(),
      content: z.optional(
        z
          .string()
          .min(1, "The answer cannot be empty")
          .max(5000, "The answer cannot be more than 5000 characters")
      ),
      choices: z.optional(
        z.array(z.string()).min(1, "Select at least one option")
      ),
      marks: z.optional(z.number()),
      comment: z.optional(
        z
          .string()
          .min(1, "The comment cannot be empty")
          .max(5000, "The comment cannot be more than 5000 characters")
      ),
    })
  ),
  credentials: z
    .array(
      z
        .string()
        .min(1, "The credential title cannot be empty")
        .max(100, "The credential title cannot be more than 100 characters")
    )
    .max(3, "There cannot be more than 3 credentials"),
});

const answersSchema = submissionSchema.pick({ submission: true });
export type answersType = z.infer<typeof answersSchema>["submission"];

export const gradeSchema = z
  .object({
    marks: submissionSchema.shape.submission.element.shape.marks,
    comment: submissionSchema.shape.submission.element.shape.comment,
  })
  .refine(
    (data) => {
      if (data.marks == undefined && data.comment) {
        return false;
      } else {
        return true;
      }
    },
    {
      message: `You must give points in order to leave a comment`,
      path: ["marks"],
    }
  );
