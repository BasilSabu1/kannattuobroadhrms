import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";

interface DocumentUploadSectionProps {
  data: any;
  onUpdate: (data: any) => void;
}

interface UploadItem {
  id: string;
  title: string;
  description: string;
  required: boolean;
  uploaded?: boolean;
}

const documentList: UploadItem[] = [
  {
    id: 'passport-photo',
    title: 'Passport Size Photo',
    description: 'Recent passport size photo (1 no.)',
    required: true,
  },
  {
    id: 'aadhaar-card',
    title: 'Aadhaar Card',
    description: 'Clear copy of Aadhaar Card',
    required: true,
  },
  {
    id: 'pan-card',
    title: 'PAN Card',
    description: 'Clear copy of PAN Card',
    required: true,
  },
  {
    id: 'voter-id',
    title: 'Voter ID Card',
    description: 'Clear copy of Voter ID Card',
    required: true,
  },
  {
    id: 'education-certificates',
    title: 'Education Certificates',
    description: 'Copies of your educational certificates',
    required: true,
  },
  {
    id: 'experience-letter',
    title: 'Experience Letter',
    description: 'Experience letter from previous organization',
    required: false,
  },
  {
    id: 'police-clearance',
    title: 'Police Clearance Certificate',
    description: 'Police clearance certificate',
    required: true,
  },
  {
    id: 'cibil-report',
    title: 'CIBIL Report',
    description: 'Credit Information Bureau (India) Limited report',
    required: true,
  },
];

export function DocumentUploadSection({ data, onUpdate }: DocumentUploadSectionProps) {
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>(data.files || {});

  const handleFileUpload = (documentId: string, file: File | null) => {
    const updatedFiles = { ...uploadedFiles, [documentId]: file };
    setUploadedFiles(updatedFiles);
    onUpdate({ ...data, files: updatedFiles });
  };

  const getUploadStatus = (documentId: string) => {
    return uploadedFiles[documentId] ? 'uploaded' : 'pending';
  };

  return (
    <div className="space-y-6">
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
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documentList.map((document) => {
          const status = getUploadStatus(document.id);
          const fileName = uploadedFiles[document.id]?.name;

          return (
            <Card key={document.id} className="relative">
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
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
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
                    <div className="flex items-center gap-2 p-2 bg-success/10 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm text-success-foreground font-medium">
                        {fileName}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-auto h-6 px-2 text-xs"
                        onClick={() => handleFileUpload(document.id, null)}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-hr-primary-light rounded-lg">
        <h4 className="font-semibold mb-2">Upload Summary</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Required Documents:</span>
            <span className="ml-2 font-medium">
              {documentList.filter(d => d.required && getUploadStatus(d.id) === 'uploaded').length} / {documentList.filter(d => d.required).length}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Optional Documents:</span>
            <span className="ml-2 font-medium">
              {documentList.filter(d => !d.required && getUploadStatus(d.id) === 'uploaded').length} / {documentList.filter(d => !d.required).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}