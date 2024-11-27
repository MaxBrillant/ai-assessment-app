import { z } from "zod";

export const generationSchema = z.object({
  numberOfQuestions: z
    .number()
    .min(1, "The number of questions cannot be less than 1")
    .max(10, "You can only generate up to 10 questions at a time"),
  totalMarks: z
    .number()
    .min(5, "The total points cannot be less than 5")
    .max(100, "The total points cannot be more than 100"),
  difficultyLevel: z
    .number()
    .min(0, "The difficulty level cannot be less than 0")
    .max(100, "The difficulty level cannot be more than 100"),
  requirements: z
    .string()
    .max(5000, "The requirements cannot be more than 5000 characters")
    .optional(),
});
