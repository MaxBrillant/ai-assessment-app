import { z } from "zod";

export const generationSchema = z.object({
  numberOfQuestions: z
    .number()
    .min(1, "The number of questions cannot be less than 1")
    .max(20, "The number of questions cannot be more than 20"),
  totalMarks: z
    .number()
    .min(5, "The total marks cannot be less than 5")
    .max(500, "The total marks cannot be more than 500"),
  difficultyLevel: z
    .number()
    .min(0, "The difficulty level cannot be less than 0")
    .max(100, "The difficulty level cannot be more than 100"),
  requirements: z
    .string()
    .min(10, "The requirements should be at least 10 characters")
    .max(5000, "The requirements cannot be more than 5000 characters")
    .optional(),
});
