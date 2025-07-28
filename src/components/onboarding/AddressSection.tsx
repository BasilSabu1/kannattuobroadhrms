import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddressSectionProps {
  data: any;
  onUpdate: (data: any) => void;
}

export function AddressSection({ data, onUpdate }: AddressSectionProps) {
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
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="village">Village *</Label>
          <Input
            id="village"
            value={data.village || ""}
            onChange={(e) => handleInputChange("village", e.target.value)}
            placeholder="Enter village name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="postOffice">Post Office *</Label>
          <Input
            id="postOffice"
            value={data.postOffice || ""}
            onChange={(e) => handleInputChange("postOffice", e.target.value)}
            placeholder="Enter post office"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="panchayat">Panchayat *</Label>
          <Input
            id="panchayat"
            value={data.panchayat || ""}
            onChange={(e) => handleInputChange("panchayat", e.target.value)}
            placeholder="Enter panchayat"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="municipality">Municipality *</Label>
          <Input
            id="municipality"
            value={data.municipality || ""}
            onChange={(e) => handleInputChange("municipality", e.target.value)}
            placeholder="Enter municipality"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="taluk">Taluk *</Label>
          <Input
            id="taluk"
            value={data.taluk || ""}
            onChange={(e) => handleInputChange("taluk", e.target.value)}
            placeholder="Enter taluk"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="district">District *</Label>
          <Input
            id="district"
            value={data.district || ""}
            onChange={(e) => handleInputChange("district", e.target.value)}
            placeholder="Enter district"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State *</Label>
          <Input
            id="state"
            value={data.state || ""}
            onChange={(e) => handleInputChange("state", e.target.value)}
            placeholder="Enter state"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pinCode">Pin Code *</Label>
          <Input
            id="pinCode"
            value={data.pinCode || ""}
            onChange={(e) => handleInputChange("pinCode", e.target.value)}
            placeholder="Enter pin code"
            maxLength={6}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="place">Place *</Label>
          <Input
            id="place"
            value={data.place || ""}
            onChange={(e) => handleInputChange("place", e.target.value)}
            placeholder="Enter place"
            required
          />
        </div>
      </div>
    </div>
  );
}