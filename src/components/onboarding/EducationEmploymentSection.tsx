import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface EducationEmploymentSectionProps {
  data: any;
  onUpdate: (data: any) => void;
}

export function EducationEmploymentSection({ data, onUpdate }: EducationEmploymentSectionProps) {
  const [joiningDate, setJoiningDate] = useState<Date | undefined>(data.joiningDate);

  const handleInputChange = (field: string, value: string) => {
    const updatedData = { ...data, [field]: value };
    onUpdate(updatedData);
  };

  const handleDateChange = (selectedDate: Date | undefined) => {
    setJoiningDate(selectedDate);
    onUpdate({ ...data, joiningDate: selectedDate });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="qualification">Highest Qualification *</Label>
          <Input
            id="qualification"
            value={data.qualification || ""}
            onChange={(e) => handleInputChange("qualification", e.target.value)}
            placeholder="e.g., Bachelor's, Master's, Diploma"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="aadhaarNumber">Aadhaar Number *</Label>
          <Input
            id="aadhaarNumber"
            value={data.aadhaarNumber || ""}
            onChange={(e) => handleInputChange("aadhaarNumber", e.target.value)}
            placeholder="Enter 12-digit Aadhaar number"
            maxLength={12}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="panNumber">PAN Number *</Label>
          <Input
            id="panNumber"
            value={data.panNumber || ""}
            onChange={(e) => handleInputChange("panNumber", e.target.value)}
            placeholder="Enter PAN number"
            maxLength={10}
            style={{ textTransform: 'uppercase' }}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="experience">Experience (in years) *</Label>
          <Input
            id="experience"
            type="number"
            value={data.experience || ""}
            onChange={(e) => handleInputChange("experience", e.target.value)}
            placeholder="Enter experience in years"
            min="0"
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="previousEmployer">Previous Employer (if any)</Label>
          <Input
            id="previousEmployer"
            value={data.previousEmployer || ""}
            onChange={(e) => handleInputChange("previousEmployer", e.target.value)}
            placeholder="Enter previous employer name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="joiningDate">Joining Date at Kannattu *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !joiningDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {joiningDate ? format(joiningDate, "PPP") : <span>Pick joining date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={joiningDate}
                onSelect={handleDateChange}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}