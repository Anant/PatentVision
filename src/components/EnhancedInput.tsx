import React, { useState, useRef } from "react";

interface FileItem {
  file: File;
  preview: string;
}

interface LinkItem {
  url: string;
}

export function EnhancedInput({
  onAskQuestion,
  onAddFiles,
}: {
  onAskQuestion: (question: string) => void;
  onAddFiles?: (files: File[]) => void; // optional
}) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [message, setMessage] = useState("");
  const [newLink, setNewLink] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle newly picked files
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setFiles((prev) => [...prev, ...newFiles]);

      // Pass them upward so the parent can store the PDF
      if (onAddFiles) {
        onAddFiles(Array.from(e.target.files));
      }
    }
  };

  // Remove a file from the local list
  const removeFile = (index: number) => {
    setFiles((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  // Add a link to the local list
  const addLink = () => {
    if (newLink.trim()) {
      setLinks((prev) => [...prev, { url: newLink.trim() }]);
      setNewLink("");
    }
  };

  const removeLink = (index: number) => {
    setLinks((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };

  // Submit text question to parent
  const handleSubmit = () => {
    if (message.trim()) {
      onAskQuestion(message.trim());
      setMessage("");
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      {/* Basic container (was Card previously) */}
      <div className="p-4 border border-gray-700 bg-gray-800 rounded">
        {/* Display attached files/links */}
        {(files.length > 0 || links.length > 0) && (
          <div className="overflow-auto h-24 bg-gray-700 p-2 rounded mb-4">
            <div className="space-y-2">
              {files.map((f, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="truncate flex-1">{f.file.name}</span>
                  <button
                    className="px-2 py-1 text-red-400 hover:text-red-500"
                    onClick={() => removeFile(idx)}
                  >
                    X
                  </button>
                </div>
              ))}
              {links.map((l, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="truncate flex-1">{l.url}</span>
                  <button
                    className="px-2 py-1 text-red-400 hover:text-red-500"
                    onClick={() => removeLink(idx)}
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input row for message + buttons */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Do you have any questions?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 p-2 rounded bg-gray-900 border border-gray-700 text-white"
          />

          {/* Hidden file input */}
          <input
            type="file"
            multiple
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Button to open file picker */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 rounded bg-gray-700 hover:bg-gray-600"
          >
            +PDF
          </button>

          {/* Minimal link input (toggle open? Or inline input) */}
          <div className="relative flex items-center gap-2">
            <input
              type="text"
              placeholder="Enter link"
              value={newLink}
              onChange={(e) => setNewLink(e.target.value)}
              className="w-36 p-2 rounded bg-gray-900 border border-gray-700 text-white"
            />
            <button
              onClick={addLink}
              className="px-3 py-2 rounded bg-gray-700 hover:bg-gray-600"
            >
              +Link
            </button>
          </div>

          {/* Submit message */}
          <button
            onClick={handleSubmit}
            className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-500"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
