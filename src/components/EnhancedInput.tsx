import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";

// Some icons from lucide-react or your preferred library
import { Paperclip, Link as LinkIcon, Send } from "lucide-react";

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
  onAddFiles?: (files: File[]) => void;
}) {
  // Local states
  const [files, setFiles] = useState<FileItem[]>([]);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [message, setMessage] = useState("");
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);  // controlling PDF dialog
  const [linkDialogOpen, setLinkDialogOpen] = useState(false); // controlling Link dialog
  const [newLink, setNewLink] = useState("");

  // PDF File Input ref (hidden)
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Handle newly picked PDF files
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setFiles((prev) => [...prev, ...newFiles]);

      // Pass them upward so the parent can store the PDFs
      if (onAddFiles) {
        onAddFiles(Array.from(e.target.files));
      }
    }
  };

  // 2. Remove a file from the local list
  const removeFile = (index: number) => {
    setFiles((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  // 3. Add a link to the local list
  const addLink = () => {
    const link = newLink.trim();
    if (link) {
      setLinks((prev) => [...prev, { url: link }]);
      setNewLink("");
      setLinkDialogOpen(false); // close dialog after adding
    }
  };

  // 4. Remove a link
  const removeLink = (index: number) => {
    setLinks((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };

  // 5. Submit text question to parent
  const handleSubmit = () => {
    const q = message.trim();
    if (q) {
      onAskQuestion(q);
      setMessage("");
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      <div className="p-4 border border-gray-700 bg-gray-800 rounded">
        {/* If we have any files or links, show them */}
        {(files.length > 0 || links.length > 0) && (
          <div className="overflow-auto h-24 bg-gray-700 p-2 rounded mb-4">
            <div className="space-y-2">
              {files.map((f, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-sm text-gray-300"
                >
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
                <div
                  key={idx}
                  className="flex items-center gap-2 text-sm text-gray-300"
                >
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

        {/* The main input row */}
        <div className="flex gap-2 items-center">
          {/* Message input */}
          <input
            type="text"
            placeholder="Do you have any questions?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 p-2 rounded bg-gray-900 border border-gray-700 text-white"
          />

          {/* Submit message */}
          <button
            onClick={handleSubmit}
            className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1"
          >
            <Send className="h-4 w-4" />
            <span>Send</span>
          </button>
        </div>

        {/* 2 Hidden triggers that open dialogs (one for PDF, one for Link) */}
        <div className="flex gap-4 mt-3">
          {/* PDF Dialog */}
          <Dialog open={pdfDialogOpen} onOpenChange={setPdfDialogOpen}>
            <DialogTrigger asChild>
              <button
                className="px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white flex items-center gap-1"
              >
                <Paperclip className="h-4 w-4" />
                PDF
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Attach a PDF</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-gray-300">
                  Select one or more PDF files to attach.
                </p>
                {/* Hidden input for picking files */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="application/pdf"
                  className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0 file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
                  onChange={(e) => {
                    handleFileChange(e);
                    setPdfDialogOpen(false); // close dialog after picking
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>

          {/* Link Dialog */}
          <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
            <DialogTrigger asChild>
              <button
                className="px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white flex items-center gap-1"
              >
                <LinkIcon className="h-4 w-4" />
                Link
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a Link</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Label htmlFor="link-field">Enter URL</Label>
                <Input
                  id="link-field"
                  placeholder="https://example.com"
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                />
                <Button onClick={addLink}>Add Link</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
