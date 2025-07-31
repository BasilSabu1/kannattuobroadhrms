import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, CheckCircle, AlertCircle, Files } from "lucide-react";
import { useState } from "react";
import { DocumentUploadModal } from "./DocumentUploadModal";
import { Alert, AlertDescription } from "@/components/ui/alert";
// import { AlertCircle } from "lucide-react";

interface DocumentUploadSectionProps {
  data: any;
  onUpdate: (data: any) => void;
  errors?: Record<string, string>;
}

// Updated UploadItem interface in DocumentUploadSection.tsx
interface UploadItem {
  id: string;
  title: string;
  description: string;
  required: boolean;
  uploaded?: boolean;
  apiType: string;
  isMultiple?: boolean;
  subDocuments?: Array<{
    id: string;
    title: string;
    required: boolean;
    apiType: string;
  }>;
}

// Update the documentList to match UploadItem interface
const documentList: UploadItem[] = [
  {
    id: 'passport-photo',
    title: 'Passport Size Photo',
    description: 'Recent passport size photo (1 no.)',
    required: true,
    apiType: 'passport'
  },
  // Aadhaar Card with sub-documents
  {
    id: 'aadhaar-card',
    title: 'Aadhaar Card',
    description: 'Front and back side of Aadhaar Card',
    required: true,
    apiType: 'aadhaar', // This won't be used for API calls
    isMultiple: true,
    subDocuments: [
      {
        id: 'aadhaar-front',
        title: 'Aadhaar Card Front',
        required: true,
        apiType: 'aadhaar_front'
      },
      {
        id: 'aadhaar-back',
        title: 'Aadhaar Card Back',
        required: true,
        apiType: 'aadhaar_back'
      }
    ]
  },
  {
    id: 'pan-card',
    title: 'PAN Card',
    description: 'Clear copy of PAN Card',
    required: true,
    apiType: 'pan'
  },
  {
    id: 'voter-id',
    title: 'Voter ID Card',
    description: 'Clear copy of Voter ID Card',
    required: true,
    apiType: 'voter_id'
  },
  // Education Certificates with sub-documents
  {
    id: 'education-certificates',
    title: 'Education Certificates',
    description: 'Academic certificates and qualifications',
    required: true,
    apiType: 'education', // This won't be used for API calls
    isMultiple: true,
    subDocuments: [
      {
        id: 'sslc-certificate',
        title: 'SSLC Certificate',
        required: true,
        apiType: 'sslc'
      },
      {
        id: 'plustwo-certificate',
        title: 'Plus Two Certificate',
        required: true,
        apiType: 'plustwo'
      },
      {
        id: 'ug-certificate',
        title: 'Undergraduate Certificate',
        required: false,
        apiType: 'ug'
      },
      {
        id: 'pg-certificate',
        title: 'Postgraduate Certificate',
        required: false,
        apiType: 'pg'
      }
    ]
  },
  {
    id: 'experience-letter',
    title: 'Experience Letter',
    description: 'Experience letter from previous organization',
    required: false,
    apiType: 'experience'
  },
  {
    id: 'police-clearance',
    title: 'Police Clearance Certificate',
    description: 'Police clearance certificate',
    required: true,
    apiType: 'police_clearance'
  },
  {
    id: 'cibil-report',
    title: 'CIBIL Report',
    description: 'Credit Information Bureau (India) Limited report',
    required: true,
    apiType: 'cibil_report'
  },
];


export function DocumentUploadSection({ data, onUpdate, errors = {} }: DocumentUploadSectionProps) {
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>(data.files || {});

  const handleFileUpload = (documentId: string, file: File | null) => {
    const updatedFiles = { ...uploadedFiles, [documentId]: file };
    setUploadedFiles(updatedFiles);
    onUpdate({ ...data, files: updatedFiles });
  };

  const handleMultipleFilesUpdate = (files: Record<string, File | null>) => {
    const updatedFiles = { ...uploadedFiles, ...files };
    setUploadedFiles(updatedFiles);
    onUpdate({ ...data, files: updatedFiles });
  };

  const getUploadStatus = (documentId: string) => {
    return uploadedFiles[documentId] ? 'uploaded' : 'pending';
  };

  const getMultipleUploadStatus = (document: UploadItem) => {
    if (!document.subDocuments) return 'pending';
    
    const uploadedCount = document.subDocuments.filter(subDoc => 
      uploadedFiles[subDoc.id]
    ).length;
    
    const requiredCount = document.subDocuments.filter(subDoc => 
      subDoc.required
    ).length;
    
    if (uploadedCount === 0) return 'pending';
    if (uploadedCount >= requiredCount) return 'completed';
    return 'partial';
  };

  const getMultipleUploadSummary = (document: UploadItem) => {
    if (!document.subDocuments) return '';
    
    const uploadedCount = document.subDocuments.filter(subDoc => 
      uploadedFiles[subDoc.id]
    ).length;
    
    return `${uploadedCount}/${document.subDocuments.length} files uploaded`;
  };

  // Helper to get a list of missing required document names
  const getMissingRequiredFields = () => {
    const missing: string[] = [];
    documentList.forEach(doc => {
      if (doc.isMultiple && doc.subDocuments) {
        doc.subDocuments.forEach(subDoc => {
          if (subDoc.required && errors[subDoc.id]) {
            missing.push(subDoc.title);
          }
        });
      } else if (doc.required && errors[doc.id]) {
        missing.push(doc.title);
      }
    });
    return missing;
  };

  const missingFields = getMissingRequiredFields();

  return (
    <div className="space-y-6">
      {/* Show alert if there are missing required fields */}
      {missingFields.length > 0 && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please upload the following required document{missingFields.length > 1 ? "s" : ""}:<br />
            <ul className="list-disc list-inside mt-1">
              {missingFields.map(field => (
                <li key={field}>{field}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      <div className="bg-accent p-4 rounded-lg">
        <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Document Submission Guidelines
        </h3>
        <p className="text-sm text-muted-foreground mb-2">
          Please upload clear scanned copies or high-resolution photos of the following documents:
        </p>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Files should be in PDF, JPG, or PNG format</li>
          <li>• Maximum file size: 5MB per document</li>
          <li>• Ensure all text is clearly readable</li>
          <li>• Documents marked with * are mandatory</li>
          <li>• Click on documents with multiple files to upload each part</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documentList.map((document) => {
          if (document.isMultiple && document.subDocuments) {
            // Handle multiple file upload with modal
            const status = getMultipleUploadStatus(document);
            const summary = getMultipleUploadSummary(document);
            const hasError = document.subDocuments.some(subDoc => errors[subDoc.id]);

            return (
              <Card key={document.id} className={`relative ${hasError ? 'border-red-500' : ''}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      {document.title}
                      {document.required && <span className="text-destructive">*</span>}
                    </span>
                    {status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : status === 'partial' ? (
                      <AlertCircle className="h-5 w-5 text-warning" />
                    ) : document.required ? (
                      <AlertCircle className="h-5 w-5 text-warning" />
                    ) : null}
                  </CardTitle>
                  <CardDescription>{document.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <DocumentUploadModal
                      title={`Upload ${document.title}`}
                      documents={document.subDocuments}
                      uploadedFiles={uploadedFiles}
                      onFilesUpdate={handleMultipleFilesUpdate}
                      errors={errors}
                    >
                      <Button 
                        variant="outline" 
                        className="w-full h-32 border-2 border-dashed hover:bg-muted transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center">
                          <Files className="w-8 h-8 mb-2 text-muted-foreground" />
                          <p className="text-sm font-semibold">Click to Upload Multiple Files</p>
                          <p className="text-xs text-muted-foreground mt-1">{summary}</p>
                        </div>
                      </Button>
                    </DocumentUploadModal>
                    
                    {hasError && (
                      <div className="text-red-500 text-sm">
                        {document.subDocuments
                          .filter(subDoc => errors[subDoc.id])
                          .map(subDoc => (
                            <div key={subDoc.id}>{errors[subDoc.id]}</div>
                          ))
                        }
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          } else {
            // Handle single file upload
            const status = getUploadStatus(document.id);
            const fileName = uploadedFiles[document.id]?.name;
            const hasError = errors[document.id];

            return (
              <Card key={document.id} className={`relative ${hasError ? 'border-red-500' : ''}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      {document.title}
                      {document.required && <span className="text-destructive">*</span>}
                    </span>
                    {status === 'uploaded' ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : document.required ? (
                      <AlertCircle className="h-5 w-5 text-warning" />
                    ) : null}
                  </CardTitle>
                  <CardDescription>{document.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-center w-full">
                      <Label
                        htmlFor={`file-${document.id}`}
                        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors ${
                          hasError ? 'border-red-500' : 'border-border'
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                          <p className="mb-2 text-sm text-muted-foreground text-center">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">PDF, PNG, JPG (MAX. 5MB)</p>
                        </div>
                        <Input
                          id={`file-${document.id}`}
                          type="file"
                          className="hidden"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            handleFileUpload(document.id, file);
                          }}
                        />
                      </Label>
                    </div>
                    {fileName && (
                      <div className="text-sm text-muted-foreground">
                        Uploaded: {fileName}
                      </div>
                    )}
                    {hasError && (
                      <p className="text-red-500 text-sm">{hasError}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          }
        })}
      </div>

      <div className="mt-6 p-4 bg-hr-primary-light rounded-lg">
        <h4 className="font-semibold mb-2">Upload Summary</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Required Documents:</span>
            <span className="ml-2 font-medium">
              {(() => {
                let uploadedRequired = 0;
                let totalRequired = 0;
                
                documentList.forEach(doc => {
                  if (doc.isMultiple && doc.subDocuments) {
                    doc.subDocuments.forEach(subDoc => {
                      if (subDoc.required) {
                        totalRequired++;
                        if (uploadedFiles[subDoc.id]) uploadedRequired++;
                      }
                    });
                  } else if (doc.required) {
                    totalRequired++;
                    if (uploadedFiles[doc.id]) uploadedRequired++;
                  }
                });
                
                return `${uploadedRequired} / ${totalRequired}`;
              })()}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Optional Documents:</span>
            <span className="ml-2 font-medium">
              {(() => {
                let uploadedOptional = 0;
                let totalOptional = 0;
                
                documentList.forEach(doc => {
                  if (doc.isMultiple && doc.subDocuments) {
                    doc.subDocuments.forEach(subDoc => {
                      if (!subDoc.required) {
                        totalOptional++;
                        if (uploadedFiles[subDoc.id]) uploadedOptional++;
                      }
                    });
                  } else if (!doc.required) {
                    totalOptional++;
                    if (uploadedFiles[doc.id]) uploadedOptional++;
                  }
                });
                
                return `${uploadedOptional} / ${totalOptional}`;
              })()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}