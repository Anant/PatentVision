// EnhancedInput.tsx
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
    text?: string; // We'll store extracted text here if relevant
}

export function EnhancedInput({
    onAddFiles,
    setQuestion,
}: {
    onAddFiles?: (files: File[]) => void;
    setQuestion: (q: string) => void;
}) {
    const [files, setFiles] = useState<FileItem[]>([]);
    const [links, setLinks] = useState<LinkItem[]>([]);
    const [message, setMessage] = useState("");
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

    // 4. Add a link to the local list (and optionally fetch patent text)
    const addLink = async () => {
        const link = newLink.trim();
        if (!link) return;

        // Optionally, detect google patents pattern
        let fetchedText = "";
        if (link.includes("patents.google.com")) {
            try {
                const res = await fetch("/api/extract-patent", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ url: link }),
                });
                const data = await res.json();
                fetchedText = data.descriptionText || ""; // The extracted patent text
            } catch (err) {
                console.error("Failed to extract patent text:", err);
            }
        }

        const newLinkItem: LinkItem = { url: link, text: fetchedText };
        setLinks((prev) => [...prev, newLinkItem]);
        setNewLink("");
        setLinkDialogOpen(false);
    };

    // 5. Remove a link
    const removeLink = (index: number) => {
        setLinks((prev) => {
            const updated = [...prev];
            updated.splice(index, 1);
            return updated;
        });
    };

    return (
        <div className="w-full max-w-3xl mx-auto space-y-4">
            <div className="p-4 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded">
                {/* If we have any files or links, show them */}
                {(files.length > 0 || links.length > 0) && (
                    <div className="overflow-auto h-24 bg-gray-100 dark:bg-gray-700 p-2 rounded mb-4">
                        <div className="space-y-2">
                            {files.map((f, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
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
                                    className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                                >
                                    <span className="truncate flex-1">{l.url}</span>
                                    {/* If we fetched text from a patent link, you could show or store it somewhere */}
                                    {/* e.g., <pre>{l.text.slice(0,200)}...</pre> for debugging */}
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

                {/* The question input row with PDF and Link buttons inline */}
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Do you have any questions?"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="flex-1 p-2 rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                    />

                    {/* PDF Dialog */}
                    <Dialog open={pdfDialogOpen} onOpenChange={setPdfDialogOpen}>
                        <DialogTrigger asChild>
                            <button className="p-2 rounded bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center">
                                <Paperclip className="h-5 w-5" />
                            </button>
                        </DialogTrigger>
                        <DialogContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600">
                            <DialogHeader>
                                <DialogTitle>Attach a PDF</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    Select one or more PDF files to attach.
                                </p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="application/pdf"
                                    className="block w-full text-sm text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded 
                             file:border-0 file:text-sm file:font-semibold
                             file:bg-blue-50 file:text-blue-700
                             hover:file:bg-blue-100 dark:file:bg-blue-700 dark:file:text-blue-300 
                             dark:hover:file:bg-blue-600"
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
                            <button className="p-2 rounded bg-green-600 hover:bg-green-700 text-white flex items-center justify-center">
                                <LinkIcon className="h-5 w-5" />
                            </button>
                        </DialogTrigger>
                        <DialogContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600">
                            <DialogHeader>
                                <DialogTitle>Add a Link</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <Label htmlFor="link-field" className="text-gray-700 dark:text-gray-300">
                                    Enter URL
                                </Label>
                                <Input
                                    id="link-field"
                                    placeholder="https://example.com"
                                    value={newLink}
                                    onChange={(e) => setNewLink(e.target.value)}
                                    className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600
                             text-gray-900 dark:text-gray-100"
                                />
                                <Button onClick={addLink} className="bg-green-600 hover:bg-green-700 text-white">
                                    Add Link
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    );
}
