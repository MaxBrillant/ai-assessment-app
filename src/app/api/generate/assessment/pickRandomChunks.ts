export default async function pickRandomChunks(
  MaxNumberOfChunks: number,
  maxQuestions: number,
  difficultyLevel: number
) {
  try {
    let chunkIndexes: number[] = [];

    const batchSize = 10;
    const iterations = Math.ceil(maxQuestions / batchSize);

    for (let j = 0; j < iterations; j++) {
      const batchLimit = Math.min(batchSize, maxQuestions - j * batchSize);

      for (let i = 0; i < batchLimit; i++) {
        console.log("picking random chunk");
        const difficultyPercentage = difficultyLevel / 100;
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

        while (chunkIndexes.includes(randomChunkIndex)) {
          randomChunkIndex = Math.floor(Math.random() * MaxNumberOfChunks);
        }

        chunkIndexes.push(randomChunkIndex);
      }
    }

    return chunkIndexes;
  } catch (e) {
    throw new Error(`Error while picking random chunks, the error is: ${e}`);
  }
}
