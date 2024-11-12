export const getQuestionTypeAndMarks = (
  numberOfQuestions: number,
  maxMarks: number,
  difficultyLevel: number
) => {
  let remainingMarks = maxMarks;
  const questions = [];

  for (let i = 0; i < numberOfQuestions; i++) {
    const type = getQuestionTypeByDifficultyLevel(difficultyLevel);

    let marks =
      type === "long-answer"
        ? Math.max(
            Math.floor(maxMarks / numberOfQuestions),
            // Allocate more marks to long-answer questions, but
            // don't over-allocate to prevent other questions from
            // getting too few marks. The factor of 1.5 is arbitrary,
            // but is intended to make long-answer questions worth
            // more than other types of questions
            Math.floor((remainingMarks / (numberOfQuestions - i)) * 1.5)
          )
        : Math.max(1, Math.floor(remainingMarks / (numberOfQuestions - i)));

    // Ensure that the sum of all the marks must be equal to maxMarks
    if (i === numberOfQuestions - 1) {
      marks = maxMarks - questions.reduce((acc, cur) => acc + cur.marks, 0);
    }

    remainingMarks -= marks;

    questions.push({ type, marks });
  }

  return questions;
};

const getQuestionTypeByDifficultyLevel = (
  difficultyLevel: number
): "multiple-choice" | "short-answer" | "long-answer" => {
  // Validate input
  if (difficultyLevel < 0 || difficultyLevel > 100) {
    throw new Error("Difficulty level must be between 0 and 100");
  }

  // Define weights for each difficulty range
  let weights: Record<
    "multiple-choice" | "short-answer" | "long-answer",
    number
  >;

  if (difficultyLevel < 25) {
    weights = {
      "multiple-choice": 0.7,
      "short-answer": 0.3,
      "long-answer": 0,
    };
  } else if (difficultyLevel < 50) {
    weights = {
      "multiple-choice": 0.65,
      "short-answer": 0.35,
      "long-answer": 0.1,
    };
  } else if (difficultyLevel < 75) {
    weights = {
      "multiple-choice": 0.1,
      "short-answer": 0.35,
      "long-answer": 0.65,
    };
  } else {
    weights = {
      "multiple-choice": 0,
      "short-answer": 0.3,
      "long-answer": 0.7,
    };
  }

  // Generate random number between 0 and 1
  const random = Math.random();

  // Calculate cumulative probabilities and select type
  let cumulativeProbability = 0;

  for (const [type, weight] of Object.entries(weights)) {
    cumulativeProbability += weight;
    if (random <= cumulativeProbability) {
      return type as "multiple-choice" | "short-answer" | "long-answer";
    }
  }

  // Fallback (should never reach here due to cumulative probabilities adding to 1)
  return "short-answer";
};
