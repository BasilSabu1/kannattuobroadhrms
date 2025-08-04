import axiosInstance from "@/components/api_config/axios";
import { API_URLS } from "@/components/api_config/api_urls";
import { useEffect, useState } from "react";
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
import { CheckCircle, FileText, User, MapPin, CreditCard, GraduationCap, Upload, CheckCircle2 } from "lucide-react";
import { ErrorAlert } from "@/components/ui/common-alert";
import { getErrorMessage, getErrorTitle } from "@/lib/error-utils";

// Document list definition for document upload section
// Replace the documentList in OnboardingForm.tsx with this updated version:
const documentList: DocumentItem[] = [
  {
    id: 'passport-photo',
    title: 'Passport Size Photo',
    description: 'Recent passport size photo (1 no.)',
    required: true,
    apiType: 'passport'
  },
  // Aadhaar Card with sub-documents
  {
    id: 'aadhaar-card',
    title: 'Aadhaar Card',
    description: 'Front and back side of Aadhaar Card',
    required: true,
    apiType: 'aadhaar', // This won't be used for API calls
    isMultiple: true,
    subDocuments: [
      {
        id: 'aadhaar-front',
        title: 'Aadhaar Card Front',
        required: true,
        apiType: 'aadhaar_front'
      },
      {
        id: 'aadhaar-back',
        title: 'Aadhaar Card Back',
        required: true,
        apiType: 'aadhaar_back'
      }
    ]
  },
  {
    id: 'pan-card',
    title: 'PAN Card',
    description: 'Clear copy of PAN Card',
    required: true,
    apiType: 'pan'
  },
  {
    id: 'voter-id',
    title: 'Voter ID Card',
    description: 'Clear copy of Voter ID Card',
    required: true,
    apiType: 'voter_id'
  },
  // Education Certificates with sub-documents
  {
    id: 'education-certificates',
    title: 'Education Certificates',
    description: 'Academic certificates and qualifications',
    required: true,
    apiType: 'education', // This won't be used for API calls
    isMultiple: true,
    subDocuments: [
      {
        id: 'sslc-certificate',
        title: 'SSLC Certificate',
        required: true,
        apiType: 'sslc'
      },
      {
        id: 'plustwo-certificate',
        title: 'Plus Two Certificate',
        required: true,
        apiType: 'plustwo'
      },
      {
        id: 'ug-certificate',
        title: 'Undergraduate Certificate',
        required: false,
        apiType: 'ug'
      },
      {
        id: 'pg-certificate',
        title: 'Postgraduate Certificate',
        required: false,
        apiType: 'pg'
      }
    ]
  },
  {
    id: 'experience-letter',
    title: 'Experience Letter',
    description: 'Experience letter from previous organization',
    required: false,
    apiType: 'experience'
  },
  {
    id: 'police-clearance',
    title: 'Police Clearance Certificate',
    description: 'Police clearance certificate',
    required: true,
    apiType: 'police_clearance'
  },
  {
    id: 'cibil-report',
    title: 'CIBIL Report',
    description: 'Credit Information Bureau (India) Limited report',
    required: true,
    apiType: 'cibil_report'
  },
];

interface FormData {
  personalDetails: any;
  address: any;
  officialId: any;
  educationEmployment: any;
  documents: any;
}

interface DocumentItem {
  id: string;
  title: string;
  description: string;
  required: boolean;
  apiType: string;
  isMultiple?: boolean;
  subDocuments?: Array<{
    id: string;
    title: string;
    required: boolean;
    apiType: string;
  }>;
}

// Interface to track submission state and UUIDs for each section
interface SectionState {
  isSubmitted: boolean;
  uuid?: string;
  originalData?: any; // Store original data after successful submission
}

interface SubmissionState {
  personalDetails: SectionState;
  address: SectionState;
  officialId: SectionState;
  educationEmployment: SectionState;
  documents: SectionState;
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
  const [userUuid, setUserUuid] = useState<string | null>(null); // Store user UUID
  const [formData, setFormData] = useState<FormData>({
    personalDetails: {},
    address: {},
    officialId: {},
    educationEmployment: {},
    documents: {},
  });

  // Track submission state for each section
  const [submissionState, setSubmissionState] = useState<SubmissionState>({
    personalDetails: { isSubmitted: false },
    address: { isSubmitted: false },
    officialId: { isSubmitted: false },
    educationEmployment: { isSubmitted: false },
    documents: { isSubmitted: false },
  });

  const { toast } = useToast();
  const [errors, setErrors] = useState<any>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false); 
  const USER_UUID_KEY = 'onboarding_user_uuid';

  const progress = ((currentSection + 1) / sections.length) * 100;
  const [isLoadingExistingData, setIsLoadingExistingData] = useState(false);

  // Enhanced email validation
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhoneNumber = (phone: string) => {
    return /^\d{10}$/.test(phone);
  };

  // Age validation function (at least 18 years old)
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

  // Helper function to deep compare objects (excluding functions)
  const deepEqual = (obj1: any, obj2: any): boolean => {
    if (obj1 === obj2) return true;

    if (obj1 == null || obj2 == null) return obj1 === obj2;

    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return obj1 === obj2;

    // Handle File objects for document comparison
    if (obj1 instanceof File && obj2 instanceof File) {
      return obj1.name === obj2.name && obj1.size === obj2.size && obj1.lastModified === obj2.lastModified;
    }

    const keys1 = Object.keys(obj1).filter(key => typeof obj1[key] !== 'function');
    const keys2 = Object.keys(obj2).filter(key => typeof obj2[key] !== 'function');

    if (keys1.length !== keys2.length) return false;

    for (let key of keys1) {
      if (!keys2.includes(key)) return false;
      if (!deepEqual(obj1[key], obj2[key])) return false;
    }

    return true;
  };

  // Helper function to check if data has changed
  const hasDataChanged = (sectionKey: keyof SubmissionState, currentData: any): boolean => {
    const originalData = submissionState[sectionKey].originalData;
    if (!originalData) return true; // If no original data, consider it as changed (first submission)

    return !deepEqual(currentData, originalData);
  };

  // Helper function to update submission state
  const updateSubmissionState = (section: keyof SubmissionState, updates: Partial<SectionState>) => {
    setSubmissionState(prev => ({
      ...prev,
      [section]: { ...prev[section], ...updates }
    }));
  };

  const validatePersonalDetails = (data: any) => {
    const newErrors: any = {};
    if (!data.fullName) newErrors.fullName = "Full name is required.";
    if (!data.fatherName) newErrors.fatherName = "Father's name is required.";
    if (!data.dob) {
      newErrors.dob = "Date of birth is required.";
    } else if (!isValidAge(data.dob)) {
      newErrors.dob = "You must be at least 18 years old.";
    }
    if (!data.gender) newErrors.gender = "Gender is required.";
    if (!data.maritalStatus) newErrors.maritalStatus = "Marital status is required.";
    if (!data.bloodGroup) newErrors.bloodGroup = "Blood group is required.";

    // Updated mobile number validation
    if (!data.mobileNumber) {
      newErrors.mobileNumber = "Mobile number is required.";
    } else if (!isValidPhoneNumber(data.mobileNumber)) {
      newErrors.mobileNumber = "Mobile number must be exactly 10 digits.";
    }

    if (!data.email) {
      newErrors.email = "Email is required.";
    } else if (!isValidEmail(data.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    // Updated emergency contact validation
    if (!data.emergencyContact) {
      newErrors.emergencyContact = "Emergency contact number is required.";
    } else if (!isValidPhoneNumber(data.emergencyContact)) {
      newErrors.emergencyContact = "Emergency contact must be exactly 10 digits.";
    }

    return newErrors;
  };

  const validateAddress = (data: any) => {
    const newErrors: any = {};
    if (!data.addressLine) newErrors.addressLine = "Address line is required.";
    if (!data.village) newErrors.village = "Village is required.";
    if (!data.postOffice) newErrors.postOffice = "Post office is required.";
    if (!data.panchayat) newErrors.panchayat = "Panchayat is required.";
    if (!data.municipality) newErrors.municipality = "Municipality is required.";
    if (!data.taluk) newErrors.taluk = "Taluk is required.";
    if (!data.district) newErrors.district = "District is required.";
    if (!data.state) newErrors.state = "State is required.";
    if (!data.pinCode) newErrors.pinCode = "Pin code is required.";
    if (!data.place) newErrors.place = "Place is required.";
    return newErrors;
  };

  // Update the validateOfficialId function in the parent component (OnboardingForm)
  const validateOfficialId = (data: any) => {
    const newErrors: any = {};
    if (!data.nameForId) newErrors.nameForId = "Name for ID card is required.";
    if (!data.mobileForId) newErrors.mobileForId = "Mobile number for ID card is required.";
    if (!data.emergencyContactForId) newErrors.emergencyContactForId = "Emergency contact for ID card is required.";
    if (!data.addressForId) newErrors.addressForId = "Address for ID card is required.";
    if (!data.dobForId) newErrors.dobForId = "Date of birth for ID card is required.";
    if (!data.bloodGroupForId) newErrors.bloodGroupForId = "Blood group for ID card is required.";
    return newErrors;
  };

  const validateEducationEmployment = (data: any) => {
    const newErrors: any = {};
    if (!data.qualification) newErrors.qualification = "Highest qualification is required.";
    if (!data.aadhaarNumber) newErrors.aadhaarNumber = "Aadhaar number is required.";
    
    // Enhanced PAN number validation
    if (!data.panNumber) {
      newErrors.panNumber = "PAN number is required.";
    } else {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(data.panNumber)) {
        newErrors.panNumber = "PAN number must be in format: ABCDE1234F (5 letters + 4 numbers + 1 letter).";
      }
    }
    
    if (!data.experience) newErrors.experience = "Experience is required.";
    if (!data.joiningDate) newErrors.joiningDate = "Joining date is required.";
    if (!data.branch) newErrors.branch = "Branch is required."; // Add this line
    if (!data.designation) newErrors.designation = "Designation is required.";
    return newErrors;
  };
  

  // Updated validateDocuments function in OnboardingForm
  // Replace the validateDocuments function in OnboardingForm.tsx with this:
  const validateDocuments = (data: any) => {
    const newErrors: any = {};

    // Function to validate all documents (including sub-documents)
    const validateAllDocuments = () => {
      documentList.forEach(document => {
        if (document.isMultiple && document.subDocuments) {
          // Validate sub-documents
          document.subDocuments.forEach(subDoc => {
            if (subDoc.required && (!data.files || !data.files[subDoc.id])) {
              newErrors[subDoc.id] = `Please upload ${subDoc.title}.`;
            }
          });
        } else {
          // Validate single documents
          if (document.required && (!data.files || !data.files[document.id])) {
            newErrors[document.id] = `Please upload ${document.title}.`;
          }
        }
      });
    };

    validateAllDocuments();

    // Log validation errors to the console
    console.log("Validation Errors:", newErrors);
    return newErrors;
  };


  const validateCurrentSection = () => {
    let validationErrors: any = {};

    switch (currentSection) {
      case 0:
        validationErrors = validatePersonalDetails(formData.personalDetails);
        break;
      case 1:
        validationErrors = validateAddress(formData.address);
        break;
      case 2:
        validationErrors = validateOfficialId(formData.officialId);
        break;
      case 3:
        validationErrors = validateEducationEmployment(formData.educationEmployment);
        break;
      case 4:
        validationErrors = validateDocuments(formData.documents);
        break;
      default:
        break;
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };




  useEffect(() => {
    const checkExistingUUID = async () => {
      const savedUUID = localStorage.getItem(USER_UUID_KEY);
      if (savedUUID) {
        setIsLoadingExistingData(true);
        try {
          await loadExistingData(savedUUID);
          setUserUuid(savedUUID);

          // toast({
          //   title: "Data Recovered",
          //   description: "Your previously filled information has been restored.",
          //   variant: "success",
          // });
        } catch (error) {
          console.error('Error loading existing data:', error);
          // Clear invalid UUID from localStorage
          localStorage.removeItem(USER_UUID_KEY);

          toast({
            title: "Unable to Recover Data",
            description: "Starting fresh with a new form.",
            variant: "info",
          });
        } finally {
          setIsLoadingExistingData(false);
        }
      }
    };

    checkExistingUUID();
  }, []);


  const loadExistingData = async (uuid: string) => {
    const loadingPromises = [];

    // Load Personal Details
    loadingPromises.push(
      axiosInstance.get(API_URLS.PERSONAL_DETAILS.GET_PERSONAL_DETAILS(uuid))
        .then(response => {
          console.log(response);

          if (response.data) {
            const personalData = {
              fullName: response.data.full_name,
              fatherName: response.data.father_name,
              dob: response.data.date_of_birth,
              gender: response.data.gender,
              maritalStatus: response.data.marital_status,
              bloodGroup: response.data.blood_group,
              mobileNumber: response.data.mobile_number,
              email: response.data.email,
              emergencyContact: response.data.emergency_contact_number,
            };

            updateFormData('personalDetails', personalData);
            updateSubmissionState('personalDetails', {
              isSubmitted: true,
              uuid: uuid,
              originalData: { ...personalData }
            });
          }
        })
        .catch(error => console.warn('Personal details not found:', error))
    );

    loadingPromises.push(
      axiosInstance.get(API_URLS.ADDRESS.GET_ADDRESSES_UUID(uuid))
        .then(response => {
          console.log(response);

          if (response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
            const addressData = response.data.data[0];

            const formattedAddressData = {
              addressLine: addressData.address_line,
              village: addressData.village,
              postOffice: addressData.post_office,
              panchayat: addressData.panchayat,
              municipality: addressData.municipality,
              taluk: addressData.taluk,
              district: addressData.district,
              state: addressData.state,
              pinCode: addressData.pin_code,
              place: addressData.place,
            };

            updateFormData('address', formattedAddressData);
            updateSubmissionState('address', {
              isSubmitted: true,
              uuid: addressData.id || addressData.uuid || uuid, // Use the address ID from response
              originalData: { ...formattedAddressData }
            });
          }
        })
        .catch(error => console.warn('Address not found:', error))
    );

    // Load Official ID
    loadingPromises.push(
      axiosInstance.get(API_URLS.OFFICIAL_ID.GET_IDCARD_ID(uuid))
        .then(response => {
          if (response.data) {
            const officialIdData = {
              nameForId: response.data.full_name,
              mobileForId: response.data.mobile_number,
              emergencyContactForId: response.data.emergency_contact_number,
              addressForId: response.data.address,
              dobForId: response.data.date_of_birth,
              bloodGroupForId: response.data.blood_group,
            };

            updateFormData('officialId', officialIdData);
            updateSubmissionState('officialId', {
              isSubmitted: true,
              uuid: uuid,
              originalData: { ...officialIdData }
            });
          }
        })
        .catch(error => console.warn('Official ID not found:', error))
    );

    // Load Education Employment
    // Replace the Education Employment loading section in loadExistingData function
    // Load Education Employment
    // Replace the Education Employment loading section in loadExistingData function
    loadingPromises.push(
      axiosInstance.get(API_URLS.EDUCATION_EMPLOYMENT.GET_EDUCATION_EMPLOYMENT_ID(uuid))
        .then(response => {
          console.log('Education Employment Full Response:', response);
          console.log('Education Employment Response Data:', response.data);

          let educationData = null;

          // Handle different possible response structures
          if (response.data) {
            // Case 1: Direct data structure
            if (response.data.highest_qualification) {
              educationData = response.data;
            }
            // Case 2: Nested data array structure  
            else if (response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
              educationData = response.data.data[0];
            }
            // Case 3: Single nested data object
            else if (response.data.data && !Array.isArray(response.data.data) && response.data.data.highest_qualification) {
              educationData = response.data.data;
            }
          }

          console.log('Extracted Education Data:', educationData);

          if (educationData && educationData.highest_qualification) {
            const formattedEducationData = {
              qualification: educationData.highest_qualification || '',
              aadhaarNumber: educationData.aadhaar_number || '',
              panNumber: educationData.pan_number || '',
              experience: educationData.experience_years || '',
              joiningDate: educationData.joining_date || '',
              branch: educationData.branch || '',
              designation: educationData.designation || '',
              previousEmployer: educationData.previous_employer || '',
            };

            console.log('Final Formatted Education Data:', formattedEducationData);

            updateFormData('educationEmployment', formattedEducationData);
            updateSubmissionState('educationEmployment', {
              isSubmitted: true,
              // FIX: Prioritize uuid over id, fallback to user uuid
              uuid: educationData.uuid || educationData.user_uuid || uuid,
              originalData: { ...formattedEducationData }
            });

            console.log('Education employment data loaded successfully with UUID:', educationData.uuid || educationData.user_uuid || uuid);
          } else {
            console.warn('Education employment data not found or missing required fields');
            console.warn('Available fields in response:', educationData ? Object.keys(educationData) : 'No data');
          }
        })
        .catch(error => {
          console.error('Education employment API error:', error);
          console.error('Error response:', error.response?.data);
          console.error('Error status:', error.response?.status);
        })
    );

    // Load Documents (Note: Documents might need special handling as they're files)
    loadingPromises.push(
      axiosInstance.get(API_URLS.DOCUMENTS.GET_DOCUMENTS_ID(uuid))
        .then(response => {
          if (response.data) {
            // Handle document data - this might need custom logic based on your API response
            updateSubmissionState('documents', {
              isSubmitted: true,
              uuid: response.data.uuid || uuid,
              originalData: response.data
            });
          }
        })
        .catch(error => console.warn('Documents not found:', error))
    );

    // Wait for all API calls to complete
    await Promise.allSettled(loadingPromises);
  };

  // Enhanced submission functions with change detection
  const submitPersonalDetails = async () => {
    const currentData = formData.personalDetails;

    // Check if data has changed
    if (submissionState.personalDetails.isSubmitted && !hasDataChanged('personalDetails', currentData)) {
      console.log('Personal details unchanged, skipping API call');
      return { data: { uuid: submissionState.personalDetails.uuid } };
    }

    const payload = {
      full_name: currentData.fullName,
      father_name: currentData.fatherName,
      date_of_birth: currentData.dob,
      gender: currentData.gender,
      marital_status: currentData.maritalStatus,
      blood_group: currentData.bloodGroup,
      mobile_number: currentData.mobileNumber,
      email: currentData.email,
      emergency_contact_number: currentData.emergencyContact,
    };

    let response;

    if (submissionState.personalDetails.isSubmitted && submissionState.personalDetails.uuid) {
      // Use PATCH for updates
      console.log('Updating personal details with PATCH', API_URLS.PERSONAL_DETAILS.PATCH_PERSONAL_DETAILS(submissionState));
      response = await axiosInstance.patch(
        API_URLS.PERSONAL_DETAILS.PATCH_PERSONAL_DETAILS(submissionState.personalDetails.uuid),
        payload
      );
    } else {
      // Use POST for first submission
      console.log('Creating personal details with POST');
      response = await axiosInstance.post(API_URLS.PERSONAL_DETAILS.POST_PERSONAL_DETAILS, payload);

      // Extract UUID from response and update submission state
      console.log('Personal Details Response:', response.data);
      let uuid = null;

      // Try different possible UUID field names
      if (response.data) {
        uuid = response.data.uuid || response.data.id || response.data.user_id || response.data.user_uuid;
      }

      if (uuid) {
        setUserUuid(uuid);
        // **NEW: Save UUID to localStorage**
        localStorage.setItem(USER_UUID_KEY, uuid);
        console.log('User UUID saved to localStorage:', uuid);
      } else {
        console.warn('No UUID found in personal details response. Available fields:', Object.keys(response.data || {}));
      }
    }

    // Store original data after successful submission
    updateSubmissionState('personalDetails', {
      isSubmitted: true,
      uuid: response.data.uuid || submissionState.personalDetails.uuid,
      originalData: { ...currentData }
    });

    return response;
  };

  const clearOnboardingData = () => {
    localStorage.removeItem(USER_UUID_KEY);
    console.log('Onboarding UUID cleared from localStorage');
  };


  const submitAddress = async () => {
    const currentData = formData.address;

    // Check if data has changed
    if (submissionState.address.isSubmitted && !hasDataChanged('address', currentData)) {
      console.log('Address unchanged, skipping API call');
      return { data: { uuid: submissionState.address.uuid } }; // Return existing data
    }

    console.log('Submitting address with user UUID:', userUuid);
    const payload = {
      user: userUuid, // Add the user UUID from personal details
      address_line: currentData.addressLine,
      village: currentData.village,
      post_office: currentData.postOffice,
      panchayat: currentData.panchayat,
      municipality: currentData.municipality,
      taluk: currentData.taluk,
      district: currentData.district,
      state: currentData.state,
      pin_code: currentData.pinCode,
      place: currentData.place,
    };

    console.log('Address payload:', payload);

    let response;

    if (submissionState.address.isSubmitted && submissionState.address.uuid) {
      // Use PATCH for updates
      console.log('Updating address with PATCH, UUID:', submissionState.address.uuid);
      response = await axiosInstance.patch(
        API_URLS.ADDRESS.PATCH_ADDRESSES(submissionState.address.uuid),
        payload
      );
    } else {
      // Use POST for first submission
      console.log('Creating address with POST');
      response = await axiosInstance.post(API_URLS.ADDRESS.POST_ADDRESS, payload);
    }

    // Store original data after successful submission
    // Fix: Make sure to get UUID from response for POST requests
    const addressUuid = response.data.uuid || response.data.id || submissionState.address.uuid;

    updateSubmissionState('address', {
      isSubmitted: true,
      uuid: addressUuid, // Use the extracted UUID
      originalData: { ...currentData } // Deep copy of current data
    });

    console.log('Address submission completed. UUID:', addressUuid);

    return response;
  };

  const submitOfficialId = async () => {
    const currentData = formData.officialId;

    console.log(currentData);

    // For OfficialId section, always use the component's own save method
    // since it handles PATCH operations properly
    if (userUuid && currentData._saveMethod) {
      const result = await currentData._saveMethod();
      if (result) {
        // Update submission state to track that this section is now submitted
        updateSubmissionState('officialId', {
          isSubmitted: true,
          uuid: userUuid, // Use userUuid since ID cards are linked to the user
          originalData: { ...currentData }
        });
        return { data: { success: true } };
      }
      return false;
    }

    // Fallback: if no save method, directly call PATCH API
    if (!userUuid) {
      throw new Error("User UUID is required for ID card submission");
    }
    console.log(submissionState);
    console.log(currentData);

    console.log(userUuid);

    // Check if data has changed
    if (submissionState.officialId.isSubmitted && !hasDataChanged('officialId', currentData)) {
      console.log('Official ID unchanged, skipping API call');
      return { data: { uuid: userUuid } };
    }

    // Format date properly for API
    const formattedDate = currentData.dobForId ?
      (currentData.dobForId instanceof Date ?
        currentData.dobForId.toISOString().split('T')[0] :
        currentData.dobForId) :
      null;

    const payload = {
      full_name: currentData.nameForId,
      mobile_number: currentData.mobileForId,
      emergency_contact_number: currentData.emergencyContactForId,
      address: currentData.addressForId,
      date_of_birth: formattedDate,
      blood_group: currentData.bloodGroupForId,
    };

    // Always use PATCH since ID cards only support PATCH
    console.log('Updating official ID with PATCH for user:', userUuid);
    const response = await axiosInstance.patch(
      API_URLS.OFFICIAL_ID.PATCH_IDCARD_ID(userUuid),
      payload
    );

    // Store original data after successful submission
    updateSubmissionState('officialId', {
      isSubmitted: true,
      uuid: userUuid,
      originalData: { ...currentData }
    });

    return response;
  };

  // Fix the submitEducationEmployment function in OnboardingForm component
  console.log(submissionState);

  const submitEducationEmployment = async () => {
    const currentData = formData.educationEmployment;

    // Check if data has changed
    if (submissionState.educationEmployment.isSubmitted && !hasDataChanged('educationEmployment', currentData)) {
      console.log('Education employment unchanged, skipping API call');
      return { data: { uuid: submissionState.educationEmployment.uuid } };
    }

    // Format joining date properly for API
    const formattedJoiningDate = currentData.joiningDate ?
      (currentData.joiningDate instanceof Date ?
        currentData.joiningDate.toISOString().split('T')[0] :
        currentData.joiningDate) :
      null;

    // Corrected payload with proper field names matching the API
    const payload = {
      user: userUuid, // Add the user UUID from personal details
      highest_qualification: currentData.qualification,
      aadhaar_number: currentData.aadhaarNumber,
      pan_number: currentData.panNumber,
      experience_years: currentData.experience,
      joining_date: formattedJoiningDate, // Format date properly
      branch: currentData.branch, // Add branch field
      designation: currentData.designation,
      previous_employer: currentData.previousEmployer,
    };

    let response;

    if (submissionState.educationEmployment.isSubmitted && submissionState.educationEmployment.uuid) {
      // Use PATCH for updates
      console.log('Updating education employment with PATCH Method, UUID:', submissionState.educationEmployment.uuid);
      response = await axiosInstance.patch(
        API_URLS.EDUCATION_EMPLOYMENT.PATCH_EDUCATION_EMPLOYMENT(submissionState.educationEmployment.uuid),
        payload
      );
    } else {
      // Use POST for first submission
      console.log('Creating education employment with POST');
      response = await axiosInstance.post(API_URLS.EDUCATION_EMPLOYMENT.POST_EDUCATION_EMPLOYMENT, payload);
    }

    // Store original data after successful submission
    // FIX: Ensure we always store the correct UUID for future PATCH operations
    const educationUuid = response.data.uuid || response.data.user_uuid || submissionState.educationEmployment.uuid || userUuid;

    updateSubmissionState('educationEmployment', {
      isSubmitted: true,
      uuid: educationUuid,
      originalData: { ...currentData }
    });

    console.log('Education employment submission completed with UUID:', educationUuid);
    return response;
  };

  const submitDocuments = async () => {
    const currentData = formData.documents;

    // Check if data has changed
    if (submissionState.documents.isSubmitted && !hasDataChanged('documents', currentData)) {
      console.log('Documents unchanged, skipping API call');
      return { data: { uuid: submissionState.documents.uuid } };
    }

    // Create separate FormData for each document
    const documentSubmissions = [];

    // Function to collect all document files (including sub-documents)
    const collectAllDocuments = () => {
      const allDocuments = [];

      documentList.forEach(document => {
        if (document.isMultiple && document.subDocuments) {
          // Add sub-documents
          document.subDocuments.forEach(subDoc => {
            const file = currentData.files?.[subDoc.id];
            if (file && file instanceof File) {
              allDocuments.push({
                id: subDoc.id,
                apiType: subDoc.apiType,
                file: file
              });
            }
          });
        } else {
          // Add single documents
          const file = currentData.files?.[document.id];
          if (file && file instanceof File) {
            allDocuments.push({
              id: document.id,
              apiType: document.apiType,
              file: file
            });
          }
        }
      });

      return allDocuments;
    };

    const allDocuments = collectAllDocuments();
    console.log('All documents to submit:', allDocuments);

    for (const doc of allDocuments) {
      const formDataToSend = new FormData();

      // Add the user UUID
      if (userUuid) {
        formDataToSend.append('user_uuid', userUuid);
      }

      // Add document type (use the individual apiType, not the group apiType)
      formDataToSend.append('document_types', doc.apiType);

      // Add the file
      formDataToSend.append('uploaded_files', doc.file);

      documentSubmissions.push({
        formData: formDataToSend,
        documentType: doc.apiType,
        documentId: doc.id
      });
    }

    // Submit all documents
    const responses = [];

    for (const submission of documentSubmissions) {
      try {
        console.log(`Submitting document: ${submission.documentType} (ID: ${submission.documentId})`);
        const response = await axiosInstance.post(API_URLS.DOCUMENTS.POST_DOCUMENTS, submission.formData, {
          headers: {
            'Content-Type': undefined,
          },
        });

        responses.push(response);
        console.log(`Successfully submitted ${submission.documentType}:`, response.data);
      } catch (error) {
        console.error(`Error submitting ${submission.documentType}:`, error);
        throw error;
      }
    }

    // Update submission state
    updateSubmissionState('documents', {
      isSubmitted: true,
      uuid: responses[0]?.data?.uuid || submissionState.documents.uuid,
      originalData: { ...currentData }
    });

    return { data: { success: true, responses } };
  };

  // Alternative: If your API accepts multiple documents in a single request
  const submitDocumentsBatch = async () => {
    const currentData = formData.documents;

    if (submissionState.documents.isSubmitted && !hasDataChanged('documents', currentData)) {
      console.log('Documents unchanged, skipping API call');
      return { data: { uuid: submissionState.documents.uuid } };
    }

    const formDataToSend = new FormData();

    // Add the user UUID
    if (userUuid) {
      formDataToSend.append('user_uuid', userUuid);
    }

    // Add all document types and files
    documentList.forEach(document => {
      const file = currentData.files?.[document.id];

      if (file && file instanceof File) {
        // Add document type
        formDataToSend.append('document_types', document.apiType);

        // Add corresponding file
        formDataToSend.append('uploaded_files', file);
      }
    });

    let response;

    if (submissionState.documents.isSubmitted && submissionState.documents.uuid) {
      response = await axiosInstance.patch(
        API_URLS.DOCUMENTS.PATCH_DOCUMENTS(submissionState.documents.uuid),
        formDataToSend,
        {
          headers: {
            'Content-Type': undefined, // Override the default JSON content type
          },
        }
      );
    } else {
      response = await axiosInstance.post(API_URLS.DOCUMENTS.POST_DOCUMENTS, formDataToSend, {
        headers: {
          'Content-Type': undefined, // Override the default JSON content type
        },
      });
    }

    updateSubmissionState('documents', {
      isSubmitted: true,
      uuid: response.data.uuid || submissionState.documents.uuid,
      originalData: { ...currentData }
    });

    return response;
  };

  // Enhanced error handling function - now using the utility
  const handleErrorMessage = (error: any): string => {
    return getErrorMessage(error);
  };

  const submitCurrentSection = async () => {
    try {
      let result = true;

      // Check if user UUID is available for sections after personal details
      if (currentSection > 0 && !userUuid) {
        toast({
          title: "Error",
          description: "Please complete the Personal Details section first to get your user ID.",
          variant: "destructive",
        });
        return false;
      }

      switch (currentSection) {
        case 0:
          await submitPersonalDetails();
          break;
        case 1:
          await submitAddress();
          break;
        case 2:
          result = await submitOfficialId();
          break;
        case 3:
          await submitEducationEmployment();
          break;
        case 4:
          await submitDocuments();
          break;
        default:
          break;
      }

      if (result !== false) {
        // Determine action type for success message
        const sectionKeys: (keyof SubmissionState)[] = ['personalDetails', 'address', 'officialId', 'educationEmployment', 'documents'];
        const currentSectionKey = sectionKeys[currentSection];
        const wasSubmitted = submissionState[currentSectionKey]?.isSubmitted;
        const hasChanged = hasDataChanged(currentSectionKey, getCurrentSectionData());

        if (hasChanged) {
          toast({
            title: `Section ${wasSubmitted ? 'Updated' : 'Submitted'} Successfully!`,
            description: `${sections[currentSection].title} has been ${wasSubmitted ? 'updated' : 'submitted'} successfully.`,
            variant: "success",
          });
        } else {
          toast({
            title: "No Changes Detected",
            description: `${sections[currentSection].title} data is already up to date.`,
            variant: "info",
          });
        }
      }

      return result !== false;
    } catch (error: any) {
      const errorMessage = handleErrorMessage(error);
      setApiError(errorMessage);
      toast({
        title: getErrorTitle(error),
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  // Helper function to get current section data
  const getCurrentSectionData = () => {
    switch (currentSection) {
      case 0: return formData.personalDetails;
      case 1: return formData.address;
      case 2: return formData.officialId;
      case 3: return formData.educationEmployment;
      case 4: return formData.documents;
      default: return {};
    }
  };

  const handleNext = async () => {
    console.log(validateCurrentSection);

    if (!validateCurrentSection()) {
      // Don't show toast since field-specific validation errors are already displayed
      return;
    }

    setSubmitting(true);
    setApiError(null);

    const success = await submitCurrentSection();

    if (success) {
      if (currentSection < sections.length - 1) {
        setCurrentSection(currentSection + 1);
        setErrors({});
      } else {
        // Final section completed - clear localStorage
        clearOnboardingData();
        setApplicationSubmitted(true); // Set application submitted state

        // Don't show toast since we're showing the success alert instead
      }
    }

    setSubmitting(false);
  };




  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      setErrors({}); // Clear errors when going back
      setApiError(null); // Clear API errors when going back
    }
  };


  if (isLoadingExistingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hr-primary-light to-background flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground">
                Loading your existing information...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success Alert Component
  const SuccessAlert = () => (
    <div className="min-h-screen bg-gradient-to-br from-hr-primary-light to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-2xl">
        <CardContent className="p-8 text-center">
          <div className="space-y-6">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>

            {/* Success Title */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Application Submitted Successfully!
              </h2>
              <p className="text-gray-600 text-sm">
                Your onboarding application has been submitted to the HR department for review.
              </p>
            </div>

            {/* Success Details */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Application Status:</span>
                  <span className="font-medium text-green-700">Submitted</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Review Process:</span>
                  <span className="font-medium text-green-700">Under Review</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Next Steps:</span>
                  <span className="font-medium text-green-700">HR Contact</span>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="text-xs text-gray-500 space-y-1">
              <p>• You will receive an email confirmation shortly</p>
              <p>• HR department will review your application within 3-5 business days</p>
              <p>• You will be contacted for any additional requirements</p>
            </div>


            {/* <Button 
            onClick={() => {
              // Try to close the window, fallback to redirect if not possible
              try {
                window.close();
                // If window.close() doesn't work, redirect to a blank page
                setTimeout(() => {
                  window.location.href = 'about:blank';
                }, 100);
              } catch (error) {
                window.location.href = 'about:blank';
              }
            }} 
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            Close Application
          </Button> */}

          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Show success alert if application is submitted
  if (applicationSubmitted) {
    return <SuccessAlert />;
  }

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
            errors={errors}
          />
        );
      case 1:
        return (
          <AddressSection
            data={formData.address}
            onUpdate={(data) => updateFormData('address', data)}
            errors={errors}
            isSubmitted={submissionState.address.isSubmitted} // Add this
            uuid={submissionState.address.uuid} // Add this
          />
        );
      case 2:
        return (
          <OfficialIdSection
            data={formData.officialId}
            onUpdate={(data) => updateFormData('officialId', data)}
            errors={errors}
            userUuid={userUuid}
          />
        );
      case 3:
        return (
          <EducationEmploymentSection
            data={formData.educationEmployment}
            onUpdate={(data) => updateFormData('educationEmployment', data)}
            errors={errors}
          />
        );
      case 4:
        return (
          <DocumentUploadSection
            data={formData.documents}
            onUpdate={(data) => updateFormData('documents', data)}
            errors={errors}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-hr-primary-light to-background">
      <div className="h-screen overflow-y-auto p-4">
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
                  {/* <span className="text-sm font-medium">Progress</span> */}
                  <span className="text-sm text-muted-foreground">
                    {currentSection + 1} of {sections.length}
                  </span>
                </div>
                <Progress value={progress} className="h-2" />

                {/* Section Navigator */}
                <div className="overflow-x-auto mt-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400">
                  <div className="flex gap-2 lg:grid lg:grid-cols-5 lg:gap-2">
                    {sections.map((section, index) => {
                      const Icon = section.icon;
                      const isCompleted = index < currentSection;
                      const isCurrent = index === currentSection;

                      return (
                        <div
                          key={section.id}
                          className={`flex flex-col items-center p-3 rounded-lg transition-all min-w-[170px] sm:min-w-[180px] lg:min-w-0 ${isCurrent
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
                          <span className="text-xs text-center font-medium whitespace-nowrap">{section.title}</span>
                        </div>
                      );
                    })}
                  </div>
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
                {/* {userUuid && currentSection === 2 && (
                  <span className="block mt-1 text-blue-600 font-medium">
                    Loading your existing information...
                  </span>
                )} */}

                {/* {userUuid && currentSection > 0 && (
                  <span className="block mt-1 text-green-600 font-medium">
                    ✓ User ID available for submission
                  </span>
                )} */}

              </CardDescription>

            </CardHeader>
            {apiError && (
              <div className="px-6 pt-0 pb-4">
                <ErrorAlert
                  title="Error"
                  message={apiError}
                  showCloseButton={true}
                  onClose={() => setApiError(null)}
                />
              </div>
            )}
            <CardContent className="p-4 sm:p-6 max-h-[60vh] sm:max-h-none overflow-y-auto">
              <div className="space-y-4">
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
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-6 sm:mt-8 p-4 sm:p-6 border-t bg-background/50">
                <Button
                  onClick={handlePrevious}
                  disabled={currentSection === 0}
                  variant="outline"
                  className="min-w-20 sm:min-w-24 text-sm sm:text-base"
                >
                  Previous
                </Button>

                <Button
                  onClick={handleNext}
                  className="min-w-20 sm:min-w-24 text-sm sm:text-base"
                  disabled={submitting || (currentSection === sections.length - 1 && !acknowledged)}
                >
                  {submitting ? "Submitting..." : currentSection === sections.length - 1 ? "Submit Application" : "Next"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}