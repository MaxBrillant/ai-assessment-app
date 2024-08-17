import FileSelection from "./components/fileSelection";

export default function Home() {
  return (
    <div>
      <div className="max-w-md mx-auto mt-32 text-center space-y-3">
        <h1 className="text-3xl font-bold text-balance">
          Create quizzes and assessments with the power of AI
        </h1>
        <p>
          Start by providing a PDF, Word or PowerPoint file of notes or
          resources
        </p>
        <FileSelection />
      </div>
    </div>
  );
}
