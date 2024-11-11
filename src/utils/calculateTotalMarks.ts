export function calculateTotalMarks(marks: number[]) {
  return marks.reduce((total, mark) => total + mark, 0);
}
