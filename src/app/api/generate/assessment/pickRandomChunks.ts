export default async function pickRandomChunks(
  MaxNumberOfChunks: number,
  maxQuestions: number,
  difficultyLevel: number
) {
  try {
    let chunkIndexes: number[] = [];

    for (let i = 0; i < maxQuestions; i++) {
      const difficultyPercentage = difficultyLevel / 100;
      //Avoid choosing the first three chunks
      const startOffset = MaxNumberOfChunks > 20 ? 3 : 0;
      const firstTwentyPercent =
        Math.floor(MaxNumberOfChunks * 0.2) + startOffset;
      const secondTwentyPercent =
        Math.floor(MaxNumberOfChunks * 0.4) + startOffset;
      const thirdTwentyPercent =
        Math.floor(MaxNumberOfChunks * 0.6) + startOffset;
      const fourthTwentyPercent =
        Math.floor(MaxNumberOfChunks * 0.8) + startOffset;

      let randomChunkIndex;
      if (difficultyPercentage < 0.2) {
        randomChunkIndex = Math.floor(Math.random() * firstTwentyPercent);
      } else if (difficultyPercentage < 0.4) {
        randomChunkIndex = Math.floor(
          Math.random() * (secondTwentyPercent - firstTwentyPercent) +
            firstTwentyPercent
        );
      } else if (difficultyPercentage < 0.6) {
        randomChunkIndex = Math.floor(
          Math.random() * (thirdTwentyPercent - secondTwentyPercent) +
            secondTwentyPercent
        );
      } else if (difficultyPercentage < 0.8) {
        randomChunkIndex = Math.floor(
          Math.random() * (fourthTwentyPercent - thirdTwentyPercent) +
            thirdTwentyPercent
        );
      } else {
        randomChunkIndex = Math.floor(
          Math.random() * (MaxNumberOfChunks - fourthTwentyPercent) +
            fourthTwentyPercent
        );
      }

      //Make sure to not select the same chunk twice
      while (chunkIndexes.includes(randomChunkIndex)) {
        randomChunkIndex = Math.floor(Math.random() * MaxNumberOfChunks);
      }

      chunkIndexes.push(randomChunkIndex);
    }

    return chunkIndexes;
  } catch (e) {
    throw new Error(`Error while picking random chunks, the error is: ${e}`);
  }
}
