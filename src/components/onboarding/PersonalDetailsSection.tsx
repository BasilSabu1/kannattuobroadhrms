import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface PersonalDetailsSectionProps {
  data: any;
  onUpdate: (data: any) => void;
}

export function PersonalDetailsSection({ data, onUpdate }: PersonalDetailsSectionProps) {
  const [date, setDate] = useState<Date | undefined>(data.dob);

  const handleInputChange = (field: string, value: string) => {
    const updatedData = { ...data, [field]: value };
    onUpdate(updatedData);
  };

  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    onUpdate({ ...data, dob: selectedDate });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            value={data.fullName || ""}
            onChange={(e) => handleInputChange("fullName", e.target.value)}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fatherName">Father's Name *</Label>
          <Input
            id="fatherName"
            value={data.fatherName || ""}
            onChange={(e) => handleInputChange("fatherName", e.target.value)}
            placeholder="Enter father's name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dob">Date of Birth *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateChange}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Gender *</Label>
          <Select onValueChange={(value) => handleInputChange("gender", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="maritalStatus">Marital Status *</Label>
          <Select onValueChange={(value) => handleInputChange("maritalStatus", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select marital status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single</SelectItem>
              <SelectItem value="married">Married</SelectItem>
              <SelectItem value="divorced">Divorced</SelectItem>
              <SelectItem value="widowed">Widowed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bloodGroup">Blood Group *</Label>
          <Select onValueChange={(value) => handleInputChange("bloodGroup", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select blood group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A+">A+</SelectItem>
              <SelectItem value="A-">A-</SelectItem>
              <SelectItem value="B+">B+</SelectItem>
              <SelectItem value="B-">B-</SelectItem>
              <SelectItem value="AB+">AB+</SelectItem>
              <SelectItem value="AB-">AB-</SelectItem>
              <SelectItem value="O+">O+</SelectItem>
              <SelectItem value="O-">O-</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="mobileNumber">Mobile Number *</Label>
          <Input
            id="mobileNumber"
            type="tel"
            value={data.mobileNumber || ""}
            onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
            placeholder="Enter mobile number"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email ID *</Label>
          <Input
            id="email"
            type="email"
            value={data.email || ""}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="Enter email address"
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="emergencyContact">Emergency Contact Number *</Label>
          <Input
            id="emergencyContact"
            type="tel"
            value={data.emergencyContact || ""}
            onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
            placeholder="Enter emergency contact number"
            required
          />
        </div>
      </div>
    </div>
  );
}