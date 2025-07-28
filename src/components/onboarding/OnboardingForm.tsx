import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { PersonalDetailsSection } from "./PersonalDetailsSection";
import { AddressSection } from "./AddressSection";
import { OfficialIdSection } from "./OfficialIdSection";
import { EducationEmploymentSection } from "./EducationEmploymentSection";
import { DocumentUploadSection } from "./DocumentUploadSection";
import { CheckCircle, FileText, User, MapPin, CreditCard, GraduationCap, Upload } from "lucide-react";

interface FormData {
  personalDetails: any;
  address: any;
  officialId: any;
  educationEmployment: any;
  documents: any;
}

const sections = [
  { id: 'personal', title: 'Personal Details', icon: User },
  { id: 'address', title: 'Residential Address', icon: MapPin },
  { id: 'officialId', title: 'Official ID Information', icon: CreditCard },
  { id: 'education', title: 'Education & Employment', icon: GraduationCap },
  { id: 'documents', title: 'Document Upload', icon: Upload },
];

export function OnboardingForm() {
  const [currentSection, setCurrentSection] = useState(0);
  const [acknowledged, setAcknowledged] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    personalDetails: {},
    address: {},
    officialId: {},
    educationEmployment: {},
    documents: {},
  });
  const { toast } = useToast();

  const progress = ((currentSection + 1) / sections.length) * 100;

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleSubmit = () => {
    toast({
      title: "Application Submitted Successfully!",
      description: "Your onboarding application has been submitted to the HR department for review.",
    });
  };

  const updateFormData = (section: keyof FormData, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 0:
        return (
          <PersonalDetailsSection
            data={formData.personalDetails}
            onUpdate={(data) => updateFormData('personalDetails', data)}
          />
        );
      case 1:
        return (
          <AddressSection
            data={formData.address}
            onUpdate={(data) => updateFormData('address', data)}
          />
        );
      case 2:
        return (
          <OfficialIdSection
            data={formData.officialId}
            onUpdate={(data) => updateFormData('officialId', data)}
          />
        );
      case 3:
        return (
          <EducationEmploymentSection
            data={formData.educationEmployment}
            onUpdate={(data) => updateFormData('educationEmployment', data)}
          />
        );
      case 4:
        return (
          <DocumentUploadSection
            data={formData.documents}
            onUpdate={(data) => updateFormData('documents', data)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-hr-primary-light to-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="mb-6 shadow-lg">
          <CardHeader className="text-center bg-gradient-to-r from-primary to-primary-hover text-primary-foreground">
            <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
              <FileText className="h-6 w-6" />
              KANNATTU HR DEPARTMENT
            </CardTitle>
            <CardDescription className="text-primary-foreground/90 text-lg">
              Employee Onboarding Module
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-muted-foreground">
                  {currentSection + 1} of {sections.length}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
              
              {/* Section Navigator */}
              <div className="grid grid-cols-5 gap-2 mt-6">
                {sections.map((section, index) => {
                  const Icon = section.icon;
                  const isCompleted = index < currentSection;
                  const isCurrent = index === currentSection;
                  
                  return (
                    <div
                      key={section.id}
                      className={`flex flex-col items-center p-3 rounded-lg transition-all ${
                        isCurrent
                          ? 'bg-primary text-primary-foreground'
                          : isCompleted
                          ? 'bg-success text-success-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 mb-1" />
                      ) : (
                        <Icon className="h-5 w-5 mb-1" />
                      )}
                      <span className="text-xs text-center font-medium">{section.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {sections[currentSection] && (() => {
                const Icon = sections[currentSection].icon;
                return (
                  <>
                    <Icon className="h-5 w-5" />
                    {sections[currentSection].title}
                  </>
                );
              })()}
            </CardTitle>
            <CardDescription>
              Please fill in all required fields marked with *
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {renderCurrentSection()}
            
            {/* Acknowledgment Section for Final Step */}
            {currentSection === sections.length - 1 && (
              <div className="mt-6 p-4 bg-accent rounded-lg">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="acknowledgment"
                    checked={acknowledged}
                    onCheckedChange={(checked) => setAcknowledged(checked as boolean)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="acknowledgment"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I acknowledge that all the information provided is true and correct
                    </label>
                    <p className="text-xs text-muted-foreground">
                      By checking this box, I confirm that I have provided accurate information and uploaded all required documents. I understand that any false information may result in the rejection of my application.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                onClick={handlePrevious}
                disabled={currentSection === 0}
                variant="outline"
                className="min-w-24"
              >
                Previous
              </Button>
              
              {currentSection === sections.length - 1 ? (
                <Button 
                  onClick={handleSubmit} 
                  className="min-w-24"
                  disabled={!acknowledged}
                >
                  Submit Application
                </Button>
              ) : (
                <Button onClick={handleNext} className="min-w-24">
                  Next
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}