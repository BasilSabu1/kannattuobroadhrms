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

interface OfficialIdSectionProps {
  data: any;
  onUpdate: (data: any) => void;
}

export function OfficialIdSection({ data, onUpdate }: OfficialIdSectionProps) {
  const [date, setDate] = useState<Date | undefined>(data.dobForId);

  const handleInputChange = (field: string, value: string) => {
    const updatedData = { ...data, [field]: value };
    onUpdate(updatedData);
  };

  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    onUpdate({ ...data, dobForId: selectedDate });
  };

  return (
    <div className="space-y-6">
      <div className="bg-accent p-4 rounded-lg">
        <p className="text-sm text-muted-foreground">
          This information will be used for creating your official employee ID card.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nameForId">Name (for ID Card) *</Label>
          <Input
            id="nameForId"
            value={data.nameForId || ""}
            onChange={(e) => handleInputChange("nameForId", e.target.value)}
            placeholder="Name as it should appear on ID"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="mobileForId">Mobile No (for ID Card) *</Label>
          <Input
            id="mobileForId"
            type="tel"
            value={data.mobileForId || ""}
            onChange={(e) => handleInputChange("mobileForId", e.target.value)}
            placeholder="Mobile number for ID"
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="addressForId">Address (for ID Card) *</Label>
          <Input
            id="addressForId"
            value={data.addressForId || ""}
            onChange={(e) => handleInputChange("addressForId", e.target.value)}
            placeholder="Address as it should appear on ID"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dobForId">DOB (for ID Card) *</Label>
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
          <Label htmlFor="bloodGroupForId">Blood Group (for ID Card) *</Label>
          <Select onValueChange={(value) => handleInputChange("bloodGroupForId", value)}>
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
      </div>
    </div>
  );
}