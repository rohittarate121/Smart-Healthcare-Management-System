export const COUNTRY_CODES = [
  { code: "+91", label: "India (+91)", digits: 10, flag: "🇮🇳" },
  { code: "+1", label: "USA/Canada (+1)", digits: 10, flag: "🇺🇸" },
  { code: "+44", label: "UK (+44)", digits: 10, flag: "🇬🇧" },
  { code: "+61", label: "Australia (+61)", digits: 9, flag: "🇦🇺" },
  { code: "+971", label: "UAE (+971)", digits: 9, flag: "🇦🇪" },
  { code: "+966", label: "Saudi Arabia (+966)", digits: 9, flag: "🇸🇦" },
  { code: "+49", label: "Germany (+49)", digits: 10, flag: "🇩🇪" },
  { code: "+65", label: "Singapore (+65)", digits: 8, flag: "🇸🇬" },
];

export const validateName = (name) => {
  if (!name || !name.trim()) return "Full name is required";
  const nameRegex = /^[a-zA-Z\s]{2,100}$/;
  if (!nameRegex.test(name.trim())) {
    return "Name must contain only alphabets and spaces (2-100 characters)";
  }
  return null;
};

export const validateEmail = (email) => {
  if (!email || !email.trim()) return "Email address is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return "Please enter a valid email address (e.g. user@example.com)";
  }
  return null;
};

export const validatePhone = (phone, countryCode = "+91") => {
  if (!phone || !phone.trim()) return "Phone number is required";
  const cleaned = phone.trim();

  if (!/^\d+$/.test(cleaned)) {
    return "Phone number must contain only numeric digits";
  }

  if (/^0+$/.test(cleaned)) {
    return "Phone number cannot be all zeros";
  }

  const selectedCountry = COUNTRY_CODES.find((c) => c.code === countryCode) || COUNTRY_CODES[0];

  if (countryCode === "+91") {
    if (cleaned.startsWith("0")) {
      return "Indian mobile numbers cannot start with 0";
    }
    if (cleaned.length !== 10) {
      return "Indian mobile number must be exactly 10 digits";
    }
  } else if (cleaned.length !== selectedCountry.digits) {
    return `Mobile number for ${selectedCountry.label} must be exactly ${selectedCountry.digits} digits`;
  }

  return null;
};

export const validateAddress = (address) => {
  if (!address || !address.trim()) return "Address is required";
  if (address.trim().length < 5) return "Address must be at least 5 characters long";
  return null;
};

export const validateCity = (city) => {
  if (!city || !city.trim()) return "City is required";
  return null;
};

export const validateState = (state) => {
  if (!state || !state.trim()) return "State is required";
  return null;
};

export const validateCountry = (country) => {
  if (!country || !country.trim()) return "Country is required";
  return null;
};

export const validatePincode = (pincode) => {
  if (!pincode || !pincode.trim()) return "Pincode is required";
  const cleaned = pincode.trim();
  if (!/^\d+$/.test(cleaned)) return "Pincode must contain only numeric digits";
  if (cleaned.length !== 6) return "Pincode must be exactly 6 digits";
  if (cleaned.startsWith("0")) return "Pincode cannot start with 0";
  if (cleaned === "000000") return "Pincode cannot be 000000";
  return null;
};

export const validateDOB = (dob) => {
  if (!dob) return "Date of Birth is required";
  const birthDate = new Date(dob);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNaN(birthDate.getTime())) return "Please select a valid Date of Birth";
  if (birthDate >= today) return "Date of Birth must be a past date";

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < 0 || age > 120) return "Please enter a realistic Date of Birth (age 0-120)";
  return null;
};

export const validateGender = (gender) => {
  if (!gender || !gender.trim()) return "Gender selection is required";
  return null;
};

export const validateEmergencyContact = (name, phone, countryCode = "+91") => {
  const errors = {};
  if (!name || !name.trim()) {
    errors.name = "Emergency contact name is required";
  } else if (!/^[a-zA-Z\s]{2,100}$/.test(name.trim())) {
    errors.name = "Emergency contact name must contain only alphabets and spaces";
  }

  const phoneErr = validatePhone(phone, countryCode);
  if (phoneErr) errors.phone = `Emergency contact ${phoneErr.toLowerCase()}`;

  return errors;
};
