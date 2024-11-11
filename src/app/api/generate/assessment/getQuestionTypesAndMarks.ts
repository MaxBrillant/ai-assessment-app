export const getQuestionTypeAndMarks = (
  numberOfQuestions: number,
  maxMarks: number,
  difficultyLevel: number
) => {
  const types = ["multiple-choice", "short-answer", "long-answer"];
  const questions = [];
  let remainingMarks = maxMarks;

  for (let i = 0; i < numberOfQuestions; i++) {
    const type =
      difficultyLevel > 70
        ? (types[Math.floor(Math.random() * 2) + 1.5] as
            | "multiple-choice"
            | "short-answer"
            | "long-answer")
        : // Higher difficulty, less probable to get a short-answer question
        difficultyLevel > 50
        ? (types[Math.floor(Math.random() * 2)] as
            | "multiple-choice"
            | "short-answer"
            | "long-answer")
        : // Higher difficulty, lower probability of getting a multiple-choice question
        difficultyLevel < 25
        ? (types[Math.floor(Math.random() * 2)] as
            | "multiple-choice"
            | "short-answer"
            | "long-answer")
        : // Lower difficulty, more probable to get short-answer and multiple-choice questions
          (types[i % types.length] as
            | "multiple-choice"
            | "short-answer"
            | "long-answer"); // Alternate between types, lower difficulty, less probable to get a long-answer question

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
