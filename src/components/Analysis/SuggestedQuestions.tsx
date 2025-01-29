import React from "react";

interface SuggestedQuestionsProps {
  questions: string[];
  onQuestionSelect: (question: string) => void;
}

export function SuggestedQuestions({ questions, onQuestionSelect }: SuggestedQuestionsProps) {
  return (
    <div className="mb-4 flex flex-wrap gap-2 justify-center">
      {questions.map((question, index) => (
        <button
          key={index}
          className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-800 text-sm text-gray-700 dark:text-gray-300"
          onClick={() => onQuestionSelect(question)}
        >
          {question}
        </button>
      ))}
    </div>
  );
}
