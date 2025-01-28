import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Paperclip, Link as LinkIcon } from "lucide-react";

interface FileItem {
  file: File;
  preview: string;
}

interface LinkItem {
  url: string;
}

export function EnhancedInput({
  onAddFiles,
  setQuestion,
}: {
  onAddFiles?: (files: File[]) => void;
  setQuestion: (q: string) => void; // Parent callback to store typed question
}) {
  // Local states
  const [files, setFiles] = useState<FileItem[]>([]);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [message, setMessage] = useState(""); // typed question (no "Send" button)
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [newLink, setNewLink] = useState("");

  // Hidden PDF file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Whenever message changes, notify parent
  useEffect(() => {
    setQuestion(message);
  }, [message, setQuestion]);

  // 2. Handle newly picked PDF files
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setFiles((prev) => [...prev, ...newFiles]);

      if (onAddFiles) {
        onAddFiles(Array.from(e.target.files));
      }
    }
  };

  // 3. Remove a file from local list
  const removeFile = (index: number) => {
    setFiles((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  // 4. Add a link to the local list
  const addLink = () => {
    const link = newLink.trim();
    if (link) {
      setLinks((prev) => [...prev, { url: link }]);
      setNewLink("");
      setLinkDialogOpen(false); // close dialog after adding
    }
  };

  // 5. Remove a link
  const removeLink = (index: number) => {
    setLinks((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };

  // No "Send" button or submit function—"Next" is handled in the parent.

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      <div className="p-4 border border-gray-700 bg-gray-800 rounded">
        {/* If we have any files or links, show them */}
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

        {/* The question input row (no "Send" button) */}
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Do you have any questions?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 p-2 rounded bg-gray-900 border border-gray-700 text-white"
          />
        </div>

        {/* Buttons to open PDF & Link dialogs */}
        <div className="flex gap-4 mt-3">
          {/* PDF Dialog */}
          <Dialog open={pdfDialogOpen} onOpenChange={setPdfDialogOpen}>
            <DialogTrigger asChild>
              <button className="px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white flex items-center gap-1">
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
                    setPdfDialogOpen(false);
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>

          {/* Link Dialog */}
          <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
            <DialogTrigger asChild>
              <button className="px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white flex items-center gap-1">
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
