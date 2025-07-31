import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddressSectionProps {
  data: any;
  onUpdate: (data: any) => void;
  errors?: any;
  isSubmitted?: boolean; // Add this
  uuid?: string; // Add this
}


export function AddressSection({ data, onUpdate, errors = {}, isSubmitted, uuid }: AddressSectionProps) {
  const handleInputChange = (field: string, value: string) => {
    const updatedData = { ...data, [field]: value };
    onUpdate(updatedData);
  };


  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="addressLine">Address Line *</Label>
          <Input
            id="addressLine"
            value={data.addressLine || ""}
            onChange={(e) => handleInputChange("addressLine", e.target.value)}
            placeholder="Enter your complete address"
            required
            className={errors.addressLine ? "border-red-500" : ""}
          />
          {errors.addressLine && (
            <p className="text-red-500 text-sm">{errors.addressLine}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="village">Village *</Label>
          <Input
            id="village"
            value={data.village || ""}
            onChange={(e) => handleInputChange("village", e.target.value)}
            placeholder="Enter village name"
            required
            className={errors.village ? "border-red-500" : ""}
          />
          {errors.village && (
            <p className="text-red-500 text-sm">{errors.village}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="postOffice">Post Office *</Label>
          <Input
            id="postOffice"
            value={data.postOffice || ""}
            onChange={(e) => handleInputChange("postOffice", e.target.value)}
            placeholder="Enter post office"
            required
            className={errors.postOffice ? "border-red-500" : ""}
          />
          {errors.postOffice && (
            <p className="text-red-500 text-sm">{errors.postOffice}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="panchayat">Panchayat *</Label>
          <Input
            id="panchayat"
            value={data.panchayat || ""}
            onChange={(e) => handleInputChange("panchayat", e.target.value)}
            placeholder="Enter panchayat"
            required
            className={errors.panchayat ? "border-red-500" : ""}
          />
          {errors.panchayat && (
            <p className="text-red-500 text-sm">{errors.panchayat}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="municipality">Municipality *</Label>
          <Input
            id="municipality"
            value={data.municipality || ""}
            onChange={(e) => handleInputChange("municipality", e.target.value)}
            placeholder="Enter municipality"
            required
            className={errors.municipality ? "border-red-500" : ""}
          />
          {errors.municipality && (
            <p className="text-red-500 text-sm">{errors.municipality}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="taluk">Taluk *</Label>
          <Input
            id="taluk"
            value={data.taluk || ""}
            onChange={(e) => handleInputChange("taluk", e.target.value)}
            placeholder="Enter taluk"
            required
            className={errors.taluk ? "border-red-500" : ""}
          />
          {errors.taluk && (
            <p className="text-red-500 text-sm">{errors.taluk}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="district">District *</Label>
          <Input
            id="district"
            value={data.district || ""}
            onChange={(e) => handleInputChange("district", e.target.value)}
            placeholder="Enter district"
            required
            className={errors.district ? "border-red-500" : ""}
          />
          {errors.district && (
            <p className="text-red-500 text-sm">{errors.district}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State *</Label>
          <Input
            id="state"
            value={data.state || ""}
            onChange={(e) => handleInputChange("state", e.target.value)}
            placeholder="Enter state"
            required
            className={errors.state ? "border-red-500" : ""}
          />
          {errors.state && (
            <p className="text-red-500 text-sm">{errors.state}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="pinCode">Pin Code *</Label>
          <Input
            id="pinCode"
            value={data.pinCode || ""}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              handleInputChange("pinCode", value);
            }}
            placeholder="Enter pin code"
            maxLength={6}
            required
            className={errors.pinCode ? "border-red-500" : ""}
          />
          {errors.pinCode && (
            <p className="text-red-500 text-sm">{errors.pinCode}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="place">Place *</Label>
          <Input
            id="place"
            value={data.place || ""}
            onChange={(e) => handleInputChange("place", e.target.value)}
            placeholder="Enter place"
            required
            className={errors.place ? "border-red-500" : ""}
          />
          {errors.place && (
            <p className="text-red-500 text-sm">{errors.place}</p>
          )}
        </div>
      </div>
    </div>
  );
}