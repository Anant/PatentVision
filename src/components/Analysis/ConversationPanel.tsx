import React from "react";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ConversationPanelProps {
  conversation: Message[];
  // Potentially pass in callbacks for helpful / not helpful
}

export function ConversationPanel({ conversation }: ConversationPanelProps) {
  return (
    <div className="space-y-4">
      {conversation.map((msg, index) => (
        <div key={index} className="flex items-start space-x-4">
          <div>
            <p className="font-bold text-gray-900 dark:text-gray-100">
              {msg.role === "assistant"
                ? "Assistant"
                : msg.role === "user"
                ? "User"
                : "System"}
            </p>
          </div>
          <div className="flex-1">
            <div className="mt-1 p-3 border border-gray-300 dark:border-gray-700 rounded bg-gray-100 dark:bg-gray-800">
              <p className="text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                {msg.content}
              </p>
            </div>
            {msg.role === "assistant" && (
              <div className="flex gap-2 mt-2">
                <button className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                  👍 Helpful
                </button>
                <button className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                  👎 Not helpful
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
