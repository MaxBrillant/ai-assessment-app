"use server";
export const getQuestionTypeAndMarks = async (
  numberOfQuestions: number,
  maxMarks: number,
  difficultyLevel: number
) => {
  let remainingMarks = maxMarks;
  const questions = [];

  const types = await getQuestionTypeByDifficultyLevel(
    difficultyLevel,
    numberOfQuestions
  );

  for (let i = 0; i < numberOfQuestions; i++) {
    let marks =
      types[i] === "long-answer"
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

    questions.push({ type: types[i], marks });
  }

  return questions;
};

const getQuestionTypeByDifficultyLevel = async (
  difficultyLevel: number,
  numberOfQuestions: number
) => {
  const allQuestionTypes: (
    | "multiple-choice"
    | "short-answer"
    | "long-answer"
  )[] = [];
  for (let i = 0; i < numberOfQuestions; i++) {
    // Validate input
    if (difficultyLevel < 0 || difficultyLevel > 100) {
      throw new Error("Difficulty level must be between 0 and 100");
    }

    // Define weights for each difficulty range
    let weights: Record<
      "multiple-choice" | "short-answer" | "long-answer",
      number
    >;

    if (difficultyLevel < 15) {
      weights = {
        "multiple-choice": 0.7,
        "short-answer": 0.3,
        "long-answer": 0,
      };
    } else if (difficultyLevel <= 25) {
      weights = {
        "multiple-choice": 0.55,
        "short-answer": 0.45,
        "long-answer": 0,
      };
    } else if (difficultyLevel <= 50) {
      weights = {
        "multiple-choice": 0.3,
        "short-answer": 0.35,
        "long-answer": 0.35,
      };
    } else if (difficultyLevel <= 75) {
      weights = {
        "multiple-choice": 0.1,
        "short-answer": 0.35,
        "long-answer": 0.55,
      };
    } else {
      weights = {
        "multiple-choice": 0,
        "short-answer": 0.3,
        "long-answer": 0.7,
      };
    }

    // Normalize weights to ensure they sum to 1
    const totalWeight = Object.values(weights).reduce(
      (sum, weight) => sum + weight,
      0
    );
    const normalizedWeights = Object.fromEntries(
      Object.entries(weights).map(([type, weight]) => [
        type,
        weight / totalWeight,
      ])
    ) as typeof weights;

    // Generate an array of question types based on the normalized weights
    const questionTypes: Array<
      "multiple-choice" | "short-answer" | "long-answer"
    > = [];
    for (const [type, weight] of Object.entries(normalizedWeights)) {
      questionTypes.push(
        ...new Array(Math.floor(weight * 100)).fill(
          type as "multiple-choice" | "short-answer" | "long-answer"
        )
      );
    }

    // Shuffle the array of question types
    for (let i = questionTypes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questionTypes[i], questionTypes[j]] = [
        questionTypes[j],
        questionTypes[i],
      ];
    }

    // Return the first question type from the shuffled array
    allQuestionTypes.push(questionTypes[0]);
  }

  return allQuestionTypes;
};
