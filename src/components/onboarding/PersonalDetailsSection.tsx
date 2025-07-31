import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface PersonalDetailsSectionProps {
  data: any;
  onUpdate: (data: any) => void;
  errors?: any;
}

export function PersonalDetailsSection({ data, onUpdate, errors = {} }: PersonalDetailsSectionProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedYear, setSelectedYear] = useState(data.dob ? new Date(data.dob).getFullYear() : new Date().getFullYear() - 25);
  const [selectedMonth, setSelectedMonth] = useState(data.dob ? new Date(data.dob).getMonth() : new Date().getMonth());

  const handleInputChange = (field: string, value: string) => {
    const updatedData = { ...data, [field]: value };
    onUpdate(updatedData);
  };

  // Format date as YYYY-MM-DD for API
  const formatDateForAPI = (date: Date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format date for display
  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return 'Select date of birth';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(selectedYear, selectedMonth, day);
    const formattedDate = formatDateForAPI(selectedDate);
    handleInputChange("dob", formattedDate);
    setShowDatePicker(false);
  };

  // Email validation function
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Phone number validation (exactly 10 digits)
  const isValidPhoneNumber = (phone: string) => {
    return /^\d{10}$/.test(phone);
  };

  // Age validation function
  const isValidAge = (dateString: string) => {
    if (!dateString) return false;
    const birthDate = new Date(dateString);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 >= 18;
    }
    return age >= 18;
  };

  // Generate years (from 1950 to current year - 18)
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const maxYear = currentYear - 18;
    const years = [];
    for (let year = maxYear; year >= 1950; year--) {
      years.push(year);
    }
    return years;
  };

  // Generate days for selected month/year
  const generateDays = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    return days;
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Custom Date Picker Component
  const CustomDatePicker = () => (
    <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg p-4 z-50 w-80">
      {/* Year and Month Selectors */}
      <div className="flex justify-between items-center mb-4">
        <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map((month, index) => (
              <SelectItem key={index} value={index.toString()}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {generateYears().map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <div key={day} className="p-2 font-medium text-gray-500">
            {day}
          </div>
        ))}
        
        {/* Empty cells for first week */}
        {Array.from({ length: new Date(selectedYear, selectedMonth, 1).getDay() }).map((_, index) => (
          <div key={index} className="p-2"></div>
        ))}
        
        {/* Days */}
        {generateDays().map((day) => {
          const date = new Date(selectedYear, selectedMonth, day);
          const today = new Date();
          const isToday = date.toDateString() === today.toDateString();
          const isSelected = data.dob === formatDateForAPI(date);
          const isDisabled = date > today || date > new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
          
          return (
            <button
              key={day}
              onClick={() => !isDisabled && handleDateSelect(day)}
              disabled={isDisabled}
              className={`p-2 rounded hover:bg-blue-100 transition-colors ${
                isSelected
                  ? 'bg-blue-500 text-white'
                  : isToday
                  ? 'bg-blue-100 text-blue-600'
                  : isDisabled
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'hover:bg-gray-100'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
      
      <button
        onClick={() => setShowDatePicker(false)}
        className="mt-4 w-full px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded"
      >
        Close
      </button>
    </div>
  );

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
            className={errors.fullName ? "border-red-500" : ""}
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm">{errors.fullName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="fatherName">Father's Name *</Label>
          <Input
            id="fatherName"
            value={data.fatherName || ""}
            onChange={(e) => handleInputChange("fatherName", e.target.value)}
            placeholder="Enter father's name"
            required
            className={errors.fatherName ? "border-red-500" : ""}
          />
          {errors.fatherName && (
            <p className="text-red-500 text-sm">{errors.fatherName}</p>
          )}
        </div>

        <div className="space-y-2 relative">
          <Label htmlFor="dob">Date of Birth *</Label>
          <div className="relative">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDatePicker(!showDatePicker)}
              className={`w-full justify-start text-left font-normal ${
                !data.dob && "text-muted-foreground"
              } ${errors.dob ? "border-red-500" : ""}`}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {formatDateForDisplay(data.dob)}
            </Button>
            {showDatePicker && <CustomDatePicker />}
          </div>
          {errors.dob && (
            <p className="text-red-500 text-sm">{errors.dob}</p>
          )}
          {data.dob && !isValidAge(data.dob) && !errors.dob && (
            <p className="text-red-500 text-sm">You must be at least 18 years old</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Gender *</Label>
          <Select onValueChange={(value) => handleInputChange("gender", value)} value={data.gender || ""}>
            <SelectTrigger className={errors.gender ? "border-red-500" : ""}>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.gender && (
            <p className="text-red-500 text-sm">{errors.gender}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="maritalStatus">Marital Status *</Label>
          <Select onValueChange={(value) => handleInputChange("maritalStatus", value)} value={data.maritalStatus || ""}>
            <SelectTrigger className={errors.maritalStatus ? "border-red-500" : ""}>
              <SelectValue placeholder="Select marital status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single</SelectItem>
              <SelectItem value="married">Married</SelectItem>
              <SelectItem value="divorced">Divorced</SelectItem>
              <SelectItem value="widowed">Widowed</SelectItem>
            </SelectContent>
          </Select>
          {errors.maritalStatus && (
            <p className="text-red-500 text-sm">{errors.maritalStatus}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="bloodGroup">Blood Group *</Label>
          <Select onValueChange={(value) => handleInputChange("bloodGroup", value)} value={data.bloodGroup || ""}>
            <SelectTrigger className={errors.bloodGroup ? "border-red-500" : ""}>
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
          {errors.bloodGroup && (
            <p className="text-red-500 text-sm">{errors.bloodGroup}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="mobileNumber">Mobile Number *</Label>
          <Input
            id="mobileNumber"
            type="tel"
            value={data.mobileNumber || ""}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
              handleInputChange("mobileNumber", value);
            }}
            placeholder="Enter 10-digit mobile number"
            required
            maxLength={10}
            className={errors.mobileNumber ? "border-red-500" : ""}
          />
          {errors.mobileNumber && (
            <p className="text-red-500 text-sm">{errors.mobileNumber}</p>
          )}
          {data.mobileNumber && !isValidPhoneNumber(data.mobileNumber) && !errors.mobileNumber && (
            <p className="text-red-500 text-sm">Please enter exactly 10 digits</p>
          )}
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
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email}</p>
          )}
          {data.email && !isValidEmail(data.email) && !errors.email && (
            <p className="text-red-500 text-sm">Please enter a valid email address</p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="emergencyContact">Emergency Contact Number *</Label>
          <Input
            id="emergencyContact"
            type="tel"
            value={data.emergencyContact || ""}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
              handleInputChange("emergencyContact", value);
            }}
            placeholder="Enter 10-digit emergency contact number"
            required
            maxLength={10}
            className={errors.emergencyContact ? "border-red-500" : ""}
          />
          {errors.emergencyContact && (
            <p className="text-red-500 text-sm">{errors.emergencyContact}</p>
          )}
          {data.emergencyContact && !isValidPhoneNumber(data.emergencyContact) && !errors.emergencyContact && (
            <p className="text-red-500 text-sm">Please enter exactly 10 digits</p>
          )}
        </div>
      </div>
    </div>
  );
}