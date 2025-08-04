import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format, isBefore, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface EducationEmploymentSectionProps {
  data: any;
  onUpdate: (data: any) => void;
  errors?: any;
}

export function EducationEmploymentSection({ data, onUpdate, errors = {} }: EducationEmploymentSectionProps) {
  const [joiningDate, setJoiningDate] = useState<Date | undefined>(data.joiningDate);

  const handleInputChange = (field: string, value: string) => {
    const updatedData = { ...data, [field]: value };
    onUpdate(updatedData);
  };

  const handleDateChange = (selectedDate: Date | undefined) => {
    setJoiningDate(selectedDate);
    onUpdate({ ...data, joiningDate: selectedDate });
  };

  // Function to disable past dates
  const disabledDays = (date: Date) => {
    return isBefore(startOfDay(date), startOfDay(new Date()));
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
            className={errors.qualification ? "border-red-500" : ""}
          />
          {errors.qualification && (
            <p className="text-red-500 text-sm">{errors.qualification}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="aadhaarNumber">Aadhaar Number *</Label>
          <Input
            id="aadhaarNumber"
            value={data.aadhaarNumber || ""}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              handleInputChange("aadhaarNumber", value);
            }}
            placeholder="Enter 12-digit Aadhaar number"
            maxLength={12}
            required
            className={errors.aadhaarNumber ? "border-red-500" : ""}
          />
          {errors.aadhaarNumber && (
            <p className="text-red-500 text-sm">{errors.aadhaarNumber}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="panNumber">PAN Number *</Label>
          <Input
            id="panNumber"
            value={data.panNumber || ""}
            onChange={(e) => {
              // Allow only letters and numbers, convert to uppercase
              const value = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
              handleInputChange("panNumber", value);
            }}
            placeholder="Enter PAN number (e.g., ABCDE1234F)"
            maxLength={10}
            style={{ textTransform: 'uppercase' }}
            required
            className={errors.panNumber ? "border-red-500" : ""}
          />
          {errors.panNumber && (
            <p className="text-red-500 text-sm">{errors.panNumber}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="experience">Experience (in years) *</Label>
          <Input
            id="experience"
            type="number"
            value={data.experience || ""}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              handleInputChange("experience", value);
            }}
            placeholder="Enter experience in years"
            min="0"
            required
            className={errors.experience ? "border-red-500" : ""}
          />
          {errors.experience && (
            <p className="text-red-500 text-sm">{errors.experience}</p>
          )}
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
                  !joiningDate && "text-muted-foreground",
                  errors.joiningDate ? "border-red-500" : ""
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {joiningDate ? format(joiningDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={joiningDate}
                onSelect={handleDateChange}
                disabled={disabledDays}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          {errors.joiningDate && (
            <p className="text-red-500 text-sm">{errors.joiningDate}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="designation">Designation *</Label>
          <Input
            id="designation"
            value={data.designation || ""}
            onChange={(e) => handleInputChange("designation", e.target.value)}
            placeholder="Enter your designation"
            required
            className={errors.designation ? "border-red-500" : ""}
          />
          {errors.designation && (
            <p className="text-red-500 text-sm">{errors.designation}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="branch">Branch *</Label>
          <Input
            id="branch"
            value={data.branch || ""}
            onChange={(e) => handleInputChange("branch", e.target.value)}
            placeholder="Enter branch name"
            required
            className={errors.branch ? "border-red-500" : ""}
          />
          {errors.branch && (
            <p className="text-red-500 text-sm">{errors.branch}</p>
          )}
        </div>
      </div>
    </div>
  );
}