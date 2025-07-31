import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, CheckCircle, AlertCircle } from "lucide-react";

interface DocumentUploadModalProps {
  title: string;
  documents: Array<{
    id: string;
    title: string;
    required: boolean;
    apiType: string;
  }>;
  uploadedFiles: Record<string, File | null>;
  onFilesUpdate: (files: Record<string, File | null>) => void;
  errors: Record<string, string>;
  children: React.ReactNode;
}

export function DocumentUploadModal({ 
  title, 
  documents, 
  uploadedFiles, 
  onFilesUpdate, 
  errors, 
  children 
}: DocumentUploadModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFiles, setLocalFiles] = useState<Record<string, File | null>>(uploadedFiles);

  const handleFileChange = (documentId: string, file: File | null) => {
    const updatedFiles = { ...localFiles, [documentId]: file };
    setLocalFiles(updatedFiles);
  };

  const handleSave = () => {
    onFilesUpdate(localFiles);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setLocalFiles(uploadedFiles); // Reset to original state
    setIsOpen(false);
  };

  const removeFile = (documentId: string) => {
    const updatedFiles = { ...localFiles };
    delete updatedFiles[documentId];
    setLocalFiles(updatedFiles);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {documents.map((document) => {
            const file = localFiles[document.id];
            const hasError = errors[document.id];
            
            return (
              <div key={document.id} className={`border rounded-lg p-4 ${hasError ? 'border-red-500' : 'border-border'}`}>
                <div className="flex items-center justify-between mb-2">
                  <Label className="font-medium flex items-center gap-2">
                    {document.title}
                    {document.required && <span className="text-destructive">*</span>}
                    {file && <CheckCircle className="h-4 w-4 text-success" />}
                  </Label>
                  {file && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(document.id)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="flex items-center justify-center w-full">
                  <Label
                    htmlFor={`modal-file-${document.id}`}
                    className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors ${
                      hasError ? 'border-red-500' : 'border-border'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center py-2">
                      <Upload className="w-6 h-6 mb-1 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground text-center">
                        {file ? 'Replace file' : 'Click to upload'}
                      </p>
                    </div>
                    <Input
                      id={`modal-file-${document.id}`}
                      type="file"
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) => {
                        const selectedFile = e.target.files?.[0] || null;
                        handleFileChange(document.id, selectedFile);
                      }}
                    />
                  </Label>
                </div>
                
                {file && (
                  <div className="text-sm text-muted-foreground mt-2">
                    Selected: {file.name}
                  </div>
                )}
                
                {hasError && (
                  <p className="text-red-500 text-sm mt-1">{hasError}</p>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Files
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}