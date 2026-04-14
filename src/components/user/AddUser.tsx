

import { yupResolver } from "@hookform/resolvers/yup";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Box,
  IconButton,
  Typography,
  Button,
  FormControlLabel,
  FormHelperText,
  Switch,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import React, { useEffect, useState, useCallback } from "react";
import { Controller, useForm } from "react-hook-form";
import SubmitButton from "src/components/common/button/Button";
import RHFInput from "src/hook-forms/RHFInput";
import RHFAutoComplete from "src/hook-forms/RHFAutoComplete";
import RHFDropZone from "src/hook-forms/RHFDropZone";
import axiosInstance from "src/services/axios";
import * as yup from "yup";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import toast, { Toaster } from "react-hot-toast";
import RHFAutoComplete2 from "src/hook-forms/RHFAutoComplete2";

type OptionItem = { label: string; value: string };

const schema = yup.object().shape({
  name: yup
    .string()
    .required("User Name is required.")
    .matches(/^\S(.*\S)?$/, "User Name cannot have leading or trailing spaces.")
    .min(3, "User Name must be at least 3 characters long.")
    .max(100, "User Name cannot be more than 100 characters long.")
    .trim(),
  account_number: yup
    .string()
    .required("Account Number is required.")
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .matches(/^[0-9]{9,18}$/, {
      message: "Account Number must be 9 to 18 digits",
      excludeEmptyString: true,
    }),
  bank_name: yup
    .string()
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .required("Bank Name is required.")
    .matches(/^[a-zA-Z ]+$/, {
      message: "Bank Name can contain only letters",
      excludeEmptyString: true,
    })
    .min(3, "Bank Name must be at least 3 characters")
    .max(100, "Bank Name cannot exceed 100 characters"),

  ifsc_code: yup
    .string()
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .required("IFSC Code is required.")
    .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, {
      message: "Invalid IFSC code",
      excludeEmptyString: true,
    }),

  branch_name: yup
    .string()
    .required("Branch Name is required.")
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .matches(/^[a-zA-Z0-9 .()-]+$/, {
      message: "Branch Name contains invalid characters",
      excludeEmptyString: true,
    })
    .min(3, "Branch Name must be at least 3 characters")
    .max(100, "Branch Name cannot exceed 100 characters"),
  commission_per_ton: yup
    .number()
    .transform((value, originalValue) => {
      if (originalValue === "" || originalValue === null) {
        return null; // empty allowed
      }
      return Number(originalValue); // 👈 ensures "0" → 0
    })
    .nullable()
    .typeError("Commission must be a number")
    .min(0, "Commission cannot be negative")
    .when('has_commission', {
      is: true,
      then: (schema) => schema.required('Commission Per Ton is required.'),
      otherwise: (schema) => schema.notRequired()
    }),

  email: yup.string().email("Please enter a valid email address.").trim(),
  mobile_number: yup
    .string()
    .required("WhatsApp Number is required.")
    .matches(/^\d{10}$/, "WhatsApp Number must be 10 digits."),
  role: yup
    .string()
    .required("Role is required.")
    .oneOf(["manufacturer", "trader"], "Please select a valid role."),
  sub_role: yup
    .string()
    .required("User Type is required.")
    .oneOf(["seller", "buyer", "financer"], "Please select a valid user type."),
  organization_name: yup
    .string()
    .required("Organization Name is required.")
    .min(2, "Organization name must be at least 2 characters long.")
    .max(200, "Organization name cannot be more than 200 characters long.")
    .trim(),
  address: yup
    .string()
    .required("Address is required.")
    .min(5, "Address must be at least 5 characters long.")
    .max(500, "Address cannot be more than 500 characters long.")
    .trim(),
  city: yup
    .string()
    .required("City is required.")
    .min(2, "City must be at least 2 characters long.")
    .max(100, "City cannot be more than 100 characters long.")
    .trim(),
  state: yup
    .string()
    .required("State is required.")
    .min(2, "State must be at least 2 characters long.")
    .max(100, "State cannot be more than 100 characters long.")
    .trim(),
  pincode: yup
    .string()
    .required("Pincode is required.")
    .matches(/^\d{6}$/, "Pincode must be 6 digits."),
  aadhar_number: yup
    .string()
    .required("Aadhaar Number is required.")
    .transform((value) => (value === "" ? null : value))
    .nullable()
    .min(12, "Aadhaar Number must be exactly 12 digits")
    .max(12, "Aadhaar Number must be exactly 12 digits")
    .matches(/^[0-9]{12}$/, {
      message: "Aadhaar Number must be exactly 12 digits",
      excludeEmptyString: true,
    }),

  //  .matches(/^\d{12}$/, 'Aadhar number must be 12 digits.')
  pan_number: yup
    .string()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .required("PAN Number is required.")
    .min(10, "PAN Number must be exactly 10 characters")
    .max(10, "PAN Number must be exactly 10 characters")
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, {
      message: "PAN Number must be in valid format (e.g., ABCDE1234F)",
      excludeEmptyString: true,
    }),

  gst_number: yup
    .string()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .required("GST Number is required.")
    .min(15, "GST Number must be exactly 15 characters")
    .max(15, "GST Number must be exactly 15 characters")
    .matches(/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}Z[A-Z\d]{1}$/, {
      message: "GST Number must be in valid format",
      excludeEmptyString: true,
    }),

  aadhar_document_url: yup
    .mixed()
    .test('required', 'Aadhar Document is required.', (value) => {
      return value !== null && value !== undefined && value !== '';
    })
    .test('fileSize', 'File size must be less than 2MB', (value) => {
      if (!value) return true; // Skip if no file (required test will catch this)
      if (typeof value === 'string') return true; // Skip if it's a URL (existing file)
      if (value instanceof File) {
        return value.size <= 2 * 1024 * 1024; // 2MB in bytes
      }
      return true;
    })
    .nullable(),
  pan_document_url: yup
    .mixed()
    .test('required', 'PAN Document is required.', (value) => {
      return value !== null && value !== undefined && value !== '';
    })
    .test('fileSize', 'File size must be less than 2MB', (value) => {
      if (!value) return true;
      if (typeof value === 'string') return true;
      if (value instanceof File) {
        return value.size <= 2 * 1024 * 1024;
      }
      return true;
    })
    .nullable(),
  gst_certificate_url: yup
    .mixed()
    .test('required', 'GST Certificate is required.', (value) => {
      return value !== null && value !== undefined && value !== '';
    })
    .test('fileSize', 'File size must be less than 2MB', (value) => {
      if (!value) return true;
      if (typeof value === 'string') return true;
      if (value instanceof File) {
        return value.size <= 2 * 1024 * 1024;
      }
      return true;
    })
    .nullable(),
  is_active: yup.boolean().required("Please set the user status."),
});

// interface FormData {
//   name: string
//   email: string
//   mobile_number: string
//   role: string
//   sub_role: string
//   organization_name: string
//   address: string
//   city: string
//   state: string
//   pincode: string
//   aadhar_number?: string
//   pan_number?: string
//   gst_number?: string
//   aadhar_document_url?: string
//   pan_document_url?: string
//   gst_certificate_url?: string
//   is_active: boolean
// }
interface FormData {
  name: string;
  email: string;
  mobile_number: string;

  role: string;
  sub_role: string;

  organization_name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;

  // Optional IDs
  aadhar_number?: string;
  pan_number?: string;
  gst_number?: string;

  // // Documents (optional)
  aadhar_document_url?: string;
  pan_document_url?: string;
  gst_certificate_url?: string;

  // Bank Details
  bank_name?: string;
  branch_name?: string;
  ifsc_code?: string;
  account_number?: string;

  // Commission
  has_commission?: boolean;
  commission_per_ton?: number;

  // Status
  is_active: boolean | number;
}

interface SelectedItem {
  id: number | string;

  name?: string;
  email?: string;
  mobile_number?: string;

  role?: string;
  sub_role?: string;

  organization_name?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;

  // Identity
  aadhar_number?: string;
  pan_number?: string;
  gst_number?: string;

  // Documents
  aadhar_document_url?: string;
  pan_document_url?: string;
  gst_certificate_url?: string;

  // Bank Details
  bank_name?: string;
  branch_name?: string;
  ifsc_code?: string;
  account_number?: string;

  // Commission
  has_commission?: boolean;
  commission_per_ton?: number;

  // Status
  is_active?: boolean | number;
}

interface Props {
  open: boolean;
  handleClose: () => void;
  fetchData: any;
  selectedItem?: SelectedItem;
  userType?: string;
  userSubRole?: string;
}

const defaultValues: Partial<FormData> = {
  name: "",
  email: "",
  mobile_number: "",

  role: "",
  sub_role: "",

  organization_name: "",
  address: "",
  city: "",
  state: "",
  pincode: "",

  aadhar_number: "",
  pan_number: "",
  gst_number: "",

  aadhar_document_url: "",
  pan_document_url: "",
  gst_certificate_url: "",

  // Bank details
  bank_name: "",
  branch_name: "",
  ifsc_code: "",
  account_number: "",

  // Commission
  has_commission: false,
  commission_per_ton: '',

  // Status
  is_active: true,
};

const roleOptions: OptionItem[] = [
  { label: "Manufacturer", value: "manufacturer" },
  { label: "Trader", value: "trader" },
];

const subRoleOptions: OptionItem[] = [
  { label: "Seller", value: "seller" },
  { label: "Buyer", value: "buyer" },
  // { label: "Financer", value: "financer" },
];

const AddUser = ({ open, handleClose, fetchData, selectedItem, userType, userSubRole }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [aadharFile, setAadharFile] = useState<File | null>(null);
  const [panFile, setPanFile] = useState<File | null>(null);
  const [gstFile, setGstFile] = useState<File | null>(null);
  const [aadharPreview, setAadharPreview] = useState<string>("");
  const [panPreview, setPanPreview] = useState<string>("");
  const [gstPreview, setGstPreview] = useState<string>("");
  // const [hasCommission, setHasCommission] = useState(false);

  const methods = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues,
  });
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = methods;
  const hasCommission = watch("has_commission");

  const handleAadharDrop = useCallback(
    (fieldName: string, acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setAadharFile(file);
        // Set the File object, not just the filename
        setValue("aadhar_document_url", file, { shouldValidate: true });
        // Create preview URL
        setAadharPreview(URL.createObjectURL(file));
      }
    },
    [setValue]
  );

  // Handle PAN document upload
  const handlePanDrop = useCallback(
    (fieldName: string, acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setPanFile(file);
        // Set the File object, not just the filename
        setValue("pan_document_url", file, { shouldValidate: true });
        // Create preview URL
        setPanPreview(URL.createObjectURL(file));
      }
    },
    [setValue]
  );

  // Handle GST certificate upload
  const handleGstDrop = useCallback(
    (fieldName: string, acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setGstFile(file);
        // Set the File object, not just the filename
        setValue("gst_certificate_url", file, { shouldValidate: true });
        // Create preview URL
        setGstPreview(URL.createObjectURL(file));
      }
    },
    [setValue]
  );
  const onSubmit = async (data: FormData) => {
    console.log("Form data:", data);
    console.log("Form errors:", errors);
    console.log("Button clicked");
    setIsLoading(true);

    try {
      // Create FormData for multipart/form-data upload
      const formData = new FormData();
      // console.log("sjdhvcjwhdbc",formData)

      formData.append("name", data.name.trim());
      formData.append("email", data.email.trim());
      formData.append("mobile_number", data.mobile_number.trim());
      formData.append("role", data.role);
      formData.append("sub_role", data.sub_role);
      formData.append("organization_name", data.organization_name.trim());
      formData.append("address", data.address.trim());
      formData.append("city", data.city.trim());
      formData.append("state", data.state.trim());
      formData.append("pincode", data.pincode.trim());
      formData.append("is_active", data.is_active ? "1" : "0");
      formData.append("has_commission", data.has_commission ? "1" : "0");

      if (userType) {
        formData.append("user_type", userType);
      }
      if (userSubRole) {
        // If "user_type" handles the subrole in backend (very common confusion in this codebase, checking where userType is used previously... it seems userType passed to AddUser might be 'manufacturer' or 'trader' which matches 'role' field in form likely, NOT 'user_type' field).
        // Actually looking at lines 686-688: if (userType) { setValue("role", userType); }
        // So userType prop maps to "role" field.
        // And sub_role field is what we want to set.
        // The formData.append("user_type", userType) on line 427 looks suspicious if userType is actually role. 
        // But I should stick to my plan: set sub_role.
        // Let's check where sub_role comes from. It comes from data.sub_role.
        // I don't need to append extra stuff here if I set the default value correctly.
      }

      // formData.append("bank_name", data.bank_name.trim());
      // formData.append("branch_name", data.branch_name.trim());
      // formData.append("ifsc_code", data.ifsc_code.trim());
      // formData.append("account_number", data.account_number.trim());
      formData.append("bank_name", data.bank_name?.trim() || "");
      formData.append("branch_name", data.branch_name?.trim() || "");
      formData.append("ifsc_code", data.ifsc_code?.trim() || "");
      formData.append("account_number", data.account_number?.trim() || "");

      // formData.append(
      //   "commission_per_ton",
      //   data.has_commission ? String(data.commission_per_ton ?? 0) : "0"
      // );
      formData.append(
        "commission_per_ton",
        data.has_commission && data.commission_per_ton
          ? String(data.commission_per_ton)
          : ""
      );
      // Add optional text fields
      if (data.aadhar_number)
        formData.append("aadhar_number", data.aadhar_number.trim());
      if (data.pan_number)
        formData.append("pan_number", data.pan_number.trim());
      if (data.gst_number)
        formData.append("gst_number", data.gst_number.trim());

      // Add file uploads
      if (aadharFile) formData.append("aadhar_document", aadharFile);
      if (panFile) formData.append("pan_document", panFile);
      if (gstFile) formData.append("gst_certificate", gstFile);

      let url = "";
      if (selectedItem) {
        url = `/api/v1/admin/users/updateUser/${selectedItem.id}`;
      } else {
        url = "/api/v1/admin/users/createUser";
      }

      console.log("Before submit:");
      console.table([...formData.entries()]);
      const response = await axiosInstance.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        handleCloseModal();
        fetchData();
        toast.success(
          response.data.message ??
          (selectedItem
            ? "User updated successfully."
            : "User added successfully.")
        );
      }
    } catch (e: any) {
      console.error(e);

      const apiErrors = e?.response?.data?.data;
      let fieldErrorHandled = false;

      if (apiErrors) {
        if (apiErrors.name?.[0]) {
          methods.setError("name", {
            type: "manual",
            message: apiErrors.name[0],
          });
          fieldErrorHandled = true;
        }
        if (apiErrors.email?.[0]) {
          methods.setError("email", {
            type: "manual",
            message: apiErrors.email[0],
          });
          fieldErrorHandled = true;
        }
        if (apiErrors.mobile_number?.[0]) {
          methods.setError("mobile_number", {
            type: "manual",
            message: apiErrors.mobile_number[0],
          });
          fieldErrorHandled = true;
        }
        if (apiErrors.role?.[0]) {
          methods.setError("role", {
            type: "manual",
            message: apiErrors.role[0],
          });
          fieldErrorHandled = true;
        }
        if (apiErrors.sub_role?.[0]) {
          methods.setError("sub_role", {
            type: "manual",
            message: apiErrors.sub_role[0],
          });
          fieldErrorHandled = true;
        }
        if (apiErrors.organization_name?.[0]) {
          methods.setError("organization_name", {
            type: "manual",
            message: apiErrors.organization_name[0],
          });
          fieldErrorHandled = true;
        }
        if (apiErrors.address?.[0]) {
          methods.setError("address", {
            type: "manual",
            message: apiErrors.address[0],
          });
          fieldErrorHandled = true;
        }
        if (apiErrors.city?.[0]) {
          methods.setError("city", {
            type: "manual",
            message: apiErrors.city[0],
          });
          fieldErrorHandled = true;
        }
        if (apiErrors.state?.[0]) {
          methods.setError("state", {
            type: "manual",
            message: apiErrors.state[0],
          });
          fieldErrorHandled = true;
        }
        if (apiErrors.pincode?.[0]) {
          methods.setError("pincode", {
            type: "manual",
            message: apiErrors.pincode[0],
          });
          fieldErrorHandled = true;
        }
        if (apiErrors.aadhar_number?.[0]) {
          methods.setError("aadhar_number", {
            type: "manual",
            message: apiErrors.aadhar_number[0],
          });
          fieldErrorHandled = true;
        }
        if (apiErrors.pan_number?.[0]) {
          methods.setError("pan_number", {
            type: "manual",
            message: apiErrors.pan_number[0],
          });
          fieldErrorHandled = true;
        }
        if (apiErrors.gst_number?.[0]) {
          methods.setError("gst_number", {
            type: "manual",
            message: apiErrors.gst_number[0],
          });
          fieldErrorHandled = true;
        }
        if (
          apiErrors.aadhar_document?.[0] ||
          apiErrors.aadhar_document_url?.[0]
        ) {
          methods.setError("aadhar_document_url", {
            type: "manual",
            message:
              apiErrors.aadhar_document?.[0] ||
              apiErrors.aadhar_document_url?.[0],
          });
          fieldErrorHandled = true;
        }
        if (apiErrors.pan_document?.[0] || apiErrors.pan_document_url?.[0]) {
          methods.setError("pan_document_url", {
            type: "manual",
            message:
              apiErrors.pan_document?.[0] || apiErrors.pan_document_url?.[0],
          });
          fieldErrorHandled = true;
        }
        if (
          apiErrors.gst_certificate?.[0] ||
          apiErrors.gst_certificate_url?.[0]
        ) {
          methods.setError("gst_certificate_url", {
            type: "manual",
            message:
              apiErrors.gst_certificate?.[0] ||
              apiErrors.gst_certificate_url?.[0],
          });
          fieldErrorHandled = true;
        }
      }

      if (!fieldErrorHandled) {
        toast.error(
          selectedItem
            ? e?.response?.data?.message ??
            "Failed to update user. Please try again."
            : e?.response?.data?.message ??
            "Failed to add user. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedItem) {
      setValue("name", selectedItem?.name ?? "");
      setValue("email", selectedItem?.email ?? "");
      setValue("mobile_number", selectedItem?.mobile_number ?? "");
      setValue("role", selectedItem?.role ?? (undefined as any));
      setValue("sub_role", selectedItem?.sub_role ?? (undefined as any));
      setValue("organization_name", selectedItem?.organization_name ?? "");
      setValue("address", selectedItem?.address ?? "");
      setValue("city", selectedItem?.city ?? "");
      setValue("state", selectedItem?.state ?? "");
      setValue("pincode", selectedItem?.pincode ?? "");
      setValue("aadhar_number", selectedItem?.aadhar_number ?? "");
      setValue("pan_number", selectedItem?.pan_number ?? "");
      setValue("gst_number", selectedItem?.gst_number ?? "");
      setValue("aadhar_document_url", selectedItem?.aadhar_document_url ?? "");
      setValue("pan_document_url", selectedItem?.pan_document_url ?? "");
      setValue("gst_certificate_url", selectedItem?.gst_certificate_url ?? "");

      setValue("bank_name", selectedItem?.bank_name ?? "");
      setValue("account_number", selectedItem?.account_number ?? "");
      setValue("branch_name", selectedItem?.branch_name ?? "");
      setValue("ifsc_code", selectedItem?.ifsc_code ?? "");
      setValue(
        "commission_per_ton",
        selectedItem?.commission_per_ton
          ? Number(selectedItem.commission_per_ton)
          : ""
      );

      setAadharPreview(selectedItem?.aadhar_document_url ?? "");
      setPanPreview(selectedItem?.pan_document_url ?? "");
      setGstPreview(selectedItem?.gst_certificate_url ?? "");
      setValue(
        "is_active",
        typeof selectedItem?.is_active === "boolean"
          ? selectedItem.is_active
          : selectedItem?.is_active === 1
      );
      // setValue(
      //   "has_commission",
      //   typeof selectedItem?.is_active === "boolean"
      //     ? selectedItem.is_active
      //     : selectedItem?.is_active === 1
      // );
      setValue(
        "has_commission",
        typeof selectedItem?.has_commission === "boolean"
          ? selectedItem.has_commission
          : selectedItem?.has_commission === 1
      );
    } else {
      reset(defaultValues);
      if (userType) {
        setValue("role", userType);
      }
      if (userSubRole) {
        setValue("sub_role", userSubRole);
      }
      setAadharPreview("");
      setPanPreview("");
      setGstPreview("");
    }
  }, [selectedItem, reset, setValue, userType, userSubRole]);

  const handleCloseModal = () => {
    reset(defaultValues);
    setAadharFile(null);
    setPanFile(null);
    setGstFile(null);
    setAadharPreview("");
    setPanPreview("");
    setGstPreview("");
    handleClose();
  };

  const hideMd = userSubRole !== "financer" && selectedItem?.sub_role !== "financer";

  return (
    <Dialog
      open={open}
      onClose={handleCloseModal}
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
      maxWidth={"md"}
      fullWidth
      disableEnforceFocus={true}
    >
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          fontWeight: "bold",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#3A4E7C0F",
        }}
        id="customized-dialog-title"
      >
        <Toaster position="top-right" reverseOrder={false} />
        <Typography
          sx={{
            fontSize: "25px",
            fontWeight: "bold",
            textAlign: "Start",
            flexGrow: 1,
            paddingLeft: "10px",
          }}
        >
          {selectedItem ? "Update" : "Add"} User
        </Typography>
        <IconButton onClick={handleCloseModal}>
          <HighlightOffIcon sx={{ color: "#f52d2de0" }} fontSize="large" />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <RHFInput
                control={control}
                name={"name"}
                label={"User Name"}
                placeholder={"User Name"}
                mandatory
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <RHFInput
                control={control}
                name={"mobile_number"}
                label={"WhatsApp Number"}
                placeholder={"WhatsApp Number"}
                mandatory
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <RHFInput
                control={control}
                name={"organization_name"}
                label={"Organization Name"}
                placeholder={"Organization Name"}
                mandatory
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <RHFInput
                control={control}
                name={"email"}
                label={"Email ID"}
                placeholder={"Email ID"}
                mandatory={false}
              />
            </Grid>


            {/* Role selection removed as it is passed from parent */}
            {hideMd && (
              <Grid item xs={12} md={6}>
                <RHFAutoComplete2
                  control={control}
                  name="sub_role"
                  options={subRoleOptions}
                  placeholder="Select User Type"
                  label="Select User Type"
                  loading={false}
                  resetApiFunction={undefined}
                  onScrollToEnd={undefined}
                  onChange={undefined}
                  mandatory={true}
                />
              </Grid>
            )}
            {/* <Grid item xs={12} md={6}>
              <RHFAutoComplete2
                control={control}
                name="sub_role"
                options={subRoleOptions}
                placeholder="Select User Type"
                labelinput="Select User Type"
                loading={false}
                valueKey="value"  // Tell it to use 'value' property
    labelKey="label"   // Tell it to use 'label' property
    returnFullObject={false}  
              />
             <Grid item xs={12} md={6}>
  <Controller
    name="sub_role"
    control={control}
    render={({ field }) => (
      <FormControl
        fullWidth
        size="small"
        error={!!errors.sub_role}
      >
        <InputLabel id="sub-role-label">
          Select User Type
        </InputLabel>

        <Select
          {...field}
          labelId="sub-role-label"
          label="Select User Type"
        >
          <MenuItem value="seller">Seller</MenuItem>
          <MenuItem value="buyer">Buyer</MenuItem>
          <MenuItem value="financer">Financer</MenuItem>
        </Select>

        {errors.sub_role && (
          <FormHelperText>
            {errors.sub_role.message}
          </FormHelperText>
        )}
      </FormControl>
    )}
  />
</Grid>

            </Grid> */}

            <Grid item xs={12} md={6}>
              <RHFInput
                control={control}
                name={"city"}
                label={"City"}
                placeholder={"City"}
                mandatory
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <RHFInput
                control={control}
                name={"state"}
                label={"State"}
                placeholder={"State"}
                mandatory
              />
            </Grid>
            <Grid item xs={12} md={!hideMd ? 12 : 6}>
              <RHFInput
                control={control}
                name={"pincode"}
                label={"Pincode"}
                placeholder={"Pincode"}
                mandatory
              />
            </Grid>
            <Grid item xs={12}>
              <RHFInput
                control={control}
                name={"address"}
                label={"Address"}
                placeholder={"Address"}
                mandatory
                multiline
                rows={2}
              />
            </Grid>

            {/* New Fields Added */}
            <Grid item xs={12} md={4}>
              <RHFInput
                control={control}
                name={"aadhar_number"}
                label={"Aadhar Number"}
                placeholder={"Aadhar Number"}
                mandatory={true}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <RHFInput
                control={control}
                name={"pan_number"}
                label={"PAN Number"}
                placeholder={"PAN Number"}
                mandatory={true}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <RHFInput
                control={control}
                name={"gst_number"}
                label={"GST Number"}
                placeholder={"GST Number"}
                mandatory={true}
              />
            </Grid>

            {/* Document Upload Fields */}
            <Grid item xs={12} md={4}>
              <label>
                Aadhar Document<span style={{ color: 'red' }}>*</span>
              </label>
              <RHFDropZone
                control={control}
                name="aadhar_document_url"
                onImageDrop={handleAadharDrop}
                imgUrl={aadharPreview}
                videoUrl=""
                pdfUrl=""
                disabled={false}
                multiple={false}
                type="image"
                maxSize={2}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <label>
                PAN Document<span style={{ color: 'red' }}>*</span>
              </label>
              <RHFDropZone
                control={control}
                name="pan_document_url"
                onImageDrop={handlePanDrop}
                imgUrl={panPreview}
                videoUrl=""
                pdfUrl=""
                disabled={false}
                multiple={false}
                type="image"
                maxSize={2}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <label>
                GST Certificate<span style={{ color: 'red' }}>*</span>
              </label>
              <RHFDropZone
                control={control}
                name="gst_certificate_url"
                onImageDrop={handleGstDrop}
                imgUrl={gstPreview}
                videoUrl=""
                pdfUrl=""
                disabled={false}
                multiple={false}
                type="image"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <RHFInput
                control={control}
                name={"account_number"}
                label={"Account Number"}
                placeholder="Account Number"
                mandatory={true}
                inputType="text"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <RHFInput
                control={control}
                name={"bank_name"}
                label={"Bank Name"}
                placeholder="Bank Name"
                mandatory={true}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <RHFInput
                control={control}
                name={"branch_name"}
                label={"Branch Name"}
                placeholder="Branch Name"
                mandatory={true}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <RHFInput
                control={control}
                name={"ifsc_code"}
                label={"IFSC Code"}
                placeholder="IFSC Code"
                mandatory={true}
                inputType="text"
              />
            </Grid>

            <Grid
              item
              xs={12}
              md={4}
              sx={{ display: "flex", alignItems: "center" }}
            >
              <Box>
                <Controller
                  name="has_commission"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value}
                          onChange={(event) =>
                            field.onChange(event.target.checked)
                          }
                          color="primary"
                        />
                      }
                      label={field.value ? "Commission" : "Commission"}
                    />
                  )}
                />
                {errors.is_active && (
                  <FormHelperText sx={{ color: "error.main", ml: 1 }}>
                    {errors.is_active.message}
                  </FormHelperText>
                )}
              </Box>
            </Grid>
            {hasCommission && (
              <Grid item xs={12} md={4}>
                <RHFInput
                  control={control}
                  name="commission_per_ton"
                  label="Commission Per Ton"
                  placeholder="Commission Per Ton"
                  mandatory={true}
                />
              </Grid>
            )}

            {selectedItem && (
              <Grid
                item
                xs={12}
                md={6}
                sx={{ display: "flex", alignItems: "center" }}
              >
                <Box>
                  <Controller
                    name="is_active"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={field.value}
                            onChange={(event) =>
                              field.onChange(event.target.checked)
                            }
                            color="primary"
                          />
                        }
                        label={field.value ? "Active" : "Inactive"}
                      />
                    )}
                  />
                  {errors.is_active && (
                    <FormHelperText sx={{ color: "error.main", ml: 1 }}>
                      {errors.is_active.message}
                    </FormHelperText>
                  )}
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ mt: 3 }}>
          <Button variant="outlined" onClick={handleCloseModal}>
            Cancel
          </Button>
          <SubmitButton
            label="Submit"
            isLoading={isLoading}
            onSubmit={handleSubmit(onSubmit)}
            isWidth={false}
          />
        </DialogActions>
      </form>
    </Dialog >
  );
};

export default AddUser;
