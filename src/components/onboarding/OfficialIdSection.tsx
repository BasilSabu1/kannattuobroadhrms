import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import axiosInstance from "@/components/api_config/axios";
import { API_URLS } from "@/components/api_config/api_urls";
import { useToast } from "@/hooks/use-toast";

interface OfficialIdSectionProps {
  data: any;
  onUpdate: (data: any) => void;
  errors?: any;
  userUuid?: string; // UUID from PersonalDetails section
}

interface OfficialIdData {
  uuid?: string;
  full_name?: string;
  mobile_number?: string;
  date_of_birth?: string;
  blood_group?: string;
  address?: string;
  emergency_contact_number?:string;
}

export function OfficialIdSection({ data, onUpdate, errors = {}, userUuid }: OfficialIdSectionProps) {
  const [date, setDate] = useState<Date | undefined>(data.dobForId);
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState<OfficialIdData>({});
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  // Email validation
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Phone number validation (exactly 10 digits)
  const isValidPhoneNumber = (phone: string) => {
    return /^\d{10}$/.test(phone);
  };

  // Fetch existing user data
  const fetchUserData = async () => {
    if (!userUuid) return;

    setLoading(true);
    try {
      const response = await axiosInstance.get(API_URLS.OFFICIAL_ID.GET_IDCARD_ID(userUuid));
      const userData = response.data;

      // Map API response to component data structure (including emergency_contact_number)
      const mappedData = {
        nameForId: userData.full_name || "",
        mobileForId: userData.mobile_number || "",
        addressForId: userData.address || "",
        dobForId: userData.date_of_birth ? new Date(userData.date_of_birth) : undefined,
        bloodGroupForId: userData.blood_group || "",
        emergencyContactForId: userData.emergency_contact_number || "",
      };

      // Store initial data for comparison (including emergency_contact_number)
      setInitialData({
        uuid: userData.uuid,
        full_name: userData.full_name,
        mobile_number: userData.mobile_number,
        address: userData.address,
        date_of_birth: userData.date_of_birth,
        blood_group: userData.blood_group,
        emergency_contact_number: userData.emergency_contact_number,
      });

      // Update component state
      onUpdate(mappedData);

      // Set date state
      if (userData.date_of_birth) {
        setDate(new Date(userData.date_of_birth));
      }

      toast({
        title: "Data Loaded",
        description: "Your existing information has been loaded successfully.",
        variant: "success",
      });
    } catch (error: any) {
      console.error("Failed to fetch user data:", error);
      // Don't show error toast if it's a 404 (user doesn't exist yet)
      if (error.response?.status !== 404) {
        toast({
          title: "Failed to Load Data",
          description: "Could not load your existing information. You can still enter new data.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Check for changes
  const checkForChanges = (currentData: any) => {
    const changes = {
      full_name: currentData.nameForId !== initialData.full_name,
      mobile_number: currentData.mobileForId !== initialData.mobile_number,
      address: currentData.addressForId !== initialData.address,
      date_of_birth: currentData.dobForId ?
        format(currentData.dobForId, "yyyy-MM-dd") !== initialData.date_of_birth :
        false,
      blood_group: currentData.bloodGroupForId !== initialData.blood_group,
    };

    const hasAnyChanges = Object.values(changes).some(changed => changed);
    setHasChanges(hasAnyChanges);
    return changes;
  };

  // PATCH only changed fields
  const patchChangedFields = async (changedFields: any) => {
    if (!userUuid || !hasChanges) return;

    const payload: any = {};

    // Only include changed fields in payload
    if (changedFields.full_name && data.nameForId) {
      payload.full_name = data.nameForId;
    }
    if (changedFields.mobile_number && data.mobileForId) {
      payload.mobile_number = data.mobileForId;
    }
    if (changedFields.address && data.addressForId) {
      payload.address = data.addressForId;
    }
    if (changedFields.date_of_birth && data.dobForId) {
      payload.date_of_birth = format(data.dobForId, "yyyy-MM-dd");
    }
    if (changedFields.blood_group && data.bloodGroupForId) {
      payload.blood_group = data.bloodGroupForId;
    }

    // Don't send PATCH if no valid changes
    if (Object.keys(payload).length === 0) return;

    try {
      await axiosInstance.patch(API_URLS.OFFICIAL_ID.PATCH_IDCARD_ID(userUuid), payload);

      // Update initial data to reflect successful changes
      setInitialData(prev => ({ ...prev, ...payload }));
      setHasChanges(false);

      toast({
        title: "Changes Saved",
        description: "Your information has been updated successfully.",
        variant: "success",
      });
    } catch (error: any) {
      console.error("Failed to update data:", error);
      toast({
        title: "Update Failed",
        description: "Failed to save your changes. Please try again.",
        variant: "destructive",
      });
      throw error; // Re-throw to handle in parent component
    }
  };

  // Load data on component mount
  useEffect(() => {
    if (userUuid) {
      fetchUserData();
    }
  }, [userUuid]);

  // Check for changes whenever data updates
  useEffect(() => {
    if (Object.keys(initialData).length > 0) {
      checkForChanges(data);
    }
  }, [data, initialData]);

  const handleInputChange = (field: string, value: string) => {
    // Prevent clearing existing values
    if (value.trim() === "" && initialData[getApiFieldName(field)]) {
      toast({
        title: "Invalid Input",
        description: "You cannot clear an existing field. Please enter a valid value.",
        variant: "destructive",
      });
      return;
    }

    const updatedData = { ...data, [field]: value };
    onUpdate(updatedData);
  };

  const handleDateChange = (selectedDate: Date | undefined) => {
    // Prevent clearing existing date
    if (!selectedDate && initialData.date_of_birth) {
      toast({
        title: "Invalid Input",
        description: "You cannot clear an existing date. Please select a valid date.",
        variant: "destructive",
      });
      return;
    }

    setDate(selectedDate);
    onUpdate({ ...data, dobForId: selectedDate });
  };

  // Helper function to map component field names to API field names
  const getApiFieldName = (componentField: string) => {
    const fieldMap: { [key: string]: string } = {
      nameForId: 'full_name',
      mobileForId: 'mobile_number',
      addressForId: 'address',
      dobForId: 'date_of_birth',
      bloodGroupForId: 'blood_group',
    };
    return fieldMap[componentField] || componentField;
  };

  // Validation with empty field prevention
  const validateField = (field: string, value: string) => {
    const apiField = getApiFieldName(field);

    // Prevent clearing existing values
    if (value.trim() === "" && initialData[apiField]) {
      return "You cannot clear an existing field.";
    }

    // Apply specific validations
    switch (field) {
      case 'mobileForId':
        if (value && !isValidPhoneNumber(value)) {
          return "Mobile number must be exactly 10 digits.";
        }
        break;
      default:
        break;
    }

    return null;
  };

  // Expose PATCH method to parent component
  const handleSave = async () => {
    if (!hasChanges) return true;

    const changedFields = checkForChanges(data);
    try {
      await patchChangedFields(changedFields);
      return true;
    } catch (error) {
      return false;
    }
  };

  // Expose save method to parent component
  useEffect(() => {
    if (onUpdate && typeof onUpdate === 'function') {
      // Add save method to the data object so parent can call it
      onUpdate({ ...data, _saveMethod: handleSave });
    }
  }, [data, hasChanges]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading your information...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-accent p-4 rounded-lg">
        <p className="text-sm text-muted-foreground">
          This information will be used for creating your official employee ID card.
          {hasChanges && (
            <span className="block mt-1 text-amber-600 font-medium">
              You have unsaved changes.
            </span>
          )}
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
            className={errors.nameForId ? "border-red-500" : ""}
          />
          {errors.nameForId && (
            <p className="text-red-500 text-sm">{errors.nameForId}</p>
          )}
          {validateField('nameForId', data.nameForId || '') && (
            <p className="text-red-500 text-sm">{validateField('nameForId', data.nameForId || '')}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="mobileForId">Mobile No (for ID Card) *</Label>
          <Input
            id="mobileForId"
            type="tel"
            value={data.mobileForId || ""}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              handleInputChange("mobileForId", value);
            }}
            placeholder="Mobile number for ID"
            required
            maxLength={10}
            className={errors.mobileForId ? "border-red-500" : ""}
          />
          {errors.mobileForId && (
            <p className="text-red-500 text-sm">{errors.mobileForId}</p>
          )}
          {validateField('mobileForId', data.mobileForId || '') && (
            <p className="text-red-500 text-sm">{validateField('mobileForId', data.mobileForId || '')}</p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="addressForId">Address (for ID Card) *</Label>
          <Input
            id="addressForId"
            value={data.addressForId || ""}
            onChange={(e) => handleInputChange("addressForId", e.target.value)}
            placeholder="Address as it should appear on ID"
            required
            className={errors.addressForId ? "border-red-500" : ""}
          />
          {errors.addressForId && (
            <p className="text-red-500 text-sm">{errors.addressForId}</p>
          )}
          {validateField('addressForId', data.addressForId || '') && (
            <p className="text-red-500 text-sm">{validateField('addressForId', data.addressForId || '')}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dobForId">DOB (for ID Card) *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground",
                  errors.dobForId ? "border-red-500" : ""
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
          {errors.dobForId && (
            <p className="text-red-500 text-sm">{errors.dobForId}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="bloodGroupForId">Blood Group (for ID Card) *</Label>
          <Select
            onValueChange={(value) => handleInputChange("bloodGroupForId", value)}
            value={data.bloodGroupForId || ""}
          >
            <SelectTrigger className={errors.bloodGroupForId ? "border-red-500" : ""}>
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
          {errors.bloodGroupForId && (
            <p className="text-red-500 text-sm">{errors.bloodGroupForId}</p>
          )}
          {validateField('bloodGroupForId', data.bloodGroupForId || '') && (
            <p className="text-red-500 text-sm">{validateField('bloodGroupForId', data.bloodGroupForId || '')}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="emergencyContactForId">Emergency Contact (for ID Card) *</Label>
          <Input
            id="emergencyContactForId"
            type="tel"
            value={data.emergencyContactForId || ""}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              handleInputChange("emergencyContactForId", value);
            }}
            placeholder="Emergency contact number for ID"
            required
            maxLength={10}
            className={errors.emergencyContactForId ? "border-red-500" : ""}
          />
          {errors.emergencyContactForId && (
            <p className="text-red-500 text-sm">{errors.emergencyContactForId}</p>
          )}
          {validateField('emergencyContactForId', data.emergencyContactForId || '') && (
            <p className="text-red-500 text-sm">{validateField('emergencyContactForId', data.emergencyContactForId || '')}</p>
          )}
        </div>
      </div>

      {hasChanges && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-amber-700 text-sm font-medium">
            You have unsaved changes. They will be saved when you proceed to the next section.
          </p>
        </div>
      )}
    </div>
  );
}