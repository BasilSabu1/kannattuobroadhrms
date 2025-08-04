import React, { useState, useEffect } from 'react';
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
  const [dragStates, setDragStates] = useState<Record<string, boolean>>({});

  // Sync localFiles when modal opens or uploadedFiles changes
  useEffect(() => {
    setLocalFiles(uploadedFiles);
  }, [uploadedFiles, isOpen]);

  // Enhanced file validation function
  const validateFile = (file: File): boolean => {
    // Check file extension
    const validExtensions = ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'webp', 'doc', 'docx', 'txt', 'rtf'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !validExtensions.includes(fileExtension)) {
      return false;
    }

    // Check MIME type for additional validation
    const validMimeTypes = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/gif',
      'image/bmp',
      'image/tiff',
      'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/rtf'
    ];

    return validMimeTypes.includes(file.type);
  };

  const handleFileChange = (documentId: string, file: File | null) => {
    if (file && !validateFile(file)) {
      console.error('Invalid file type:', file.name, file.type);
      return;
    }
    
    const updatedFiles = { ...localFiles, [documentId]: file };
    setLocalFiles(updatedFiles);
  };

  // Drag and drop handlers
  const handleDragEnter = (documentId: string, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragStates(prev => ({ ...prev, [documentId]: true }));
  };

  const handleDragLeave = (documentId: string, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragStates(prev => ({ ...prev, [documentId]: false }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (documentId: string, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragStates(prev => ({ ...prev, [documentId]: false }));

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        handleFileChange(documentId, file);
      }
    }
  };

  // Check if all required documents are uploaded
  const hasAllRequiredDocuments = () => {
    return documents.every(document => {
      if (document.required) {
        return localFiles[document.id] !== null && localFiles[document.id] !== undefined;
      }
      return true;
    });
  };

  const handleSave = () => {
    if (!hasAllRequiredDocuments()) {
      return; // Don't save if required documents are missing
    }
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
                      className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="flex items-center justify-center w-full">
                  <Label
                    htmlFor={`modal-file-${document.id}`}
                    className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors ${
                      hasError ? 'border-red-500' : dragStates[document.id] ? 'border-primary bg-primary/10' : 'border-border'
                    }`}
                    onDragEnter={(e) => handleDragEnter(document.id, e)}
                    onDragLeave={(e) => handleDragLeave(document.id, e)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(document.id, e)}
                  >
                    <div className="flex flex-col items-center justify-center py-2">
                      <Upload className="w-6 h-6 mb-1 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground text-center">
                        {file ? 'Replace file' : 'Click to upload or drag and drop'}
                      </p>
                    </div>
                    <Input
                      id={`modal-file-${document.id}`}
                      type="file"
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg,.gif,.bmp,.tiff,.webp,.doc,.docx,.txt,.rtf"
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
          <Button 
            onClick={handleSave}
            disabled={!hasAllRequiredDocuments()}
            title={!hasAllRequiredDocuments() ? "Please upload all required documents before saving" : ""}
          >
            Save Files
          </Button>
        </div>
        
        {!hasAllRequiredDocuments() && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
            <AlertCircle className="h-4 w-4 inline mr-1" />
            Please upload all required documents (marked with *) before saving.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}