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
  Switch,
  FormControlLabel,
  Button,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import RHFInput from "src/hook-forms/RHFInput";
import RHFAutoComplete from "src/hook-forms/RHFAutoComplete";
import axiosInstance from "src/services/axios";
import * as yup from "yup";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import toast, { Toaster } from "react-hot-toast";
import SubmitButton from "../../common/button/Button";

const schema = yup.object().shape({
  name: yup
    .string()
    .required("Full Name is required.")
    .min(3, "Full Name must be at least 3 characters")
    .trim(),
  email: yup
    .string()
    .email("Please enter a valid email address.")
    .required("Email ID is required.")
    .trim(),
  password: yup
    .string()
    .when("$isEdit", {
      is: true,
      then: (s) => s.notRequired(),
      otherwise: (s) => s.required("Password is required.").min(6, "Password must be at least 6 characters"),
    }),
  phone: yup
    .string()
    .required("Mobile Number is required.")
    .matches(/^\d{10}$/, "Mobile Number must be 10 digits."),
  role_id: yup
    .number()
    .required("Role is required.")
    .typeError("Role is required."),
  // shop_id: yup
  //   .number()
  //   .required("Shop is required.")
  //   .typeError("Shop is required."),
  // supplier_id: yup
  //   .number()
  //   .nullable()
  //   .transform((v) => (v === "" || v === null ? null : v)),
  is_active: yup.boolean().required("Status is required."),
});

interface FormData {
  name: string;
  email: string;
  password?: string;
  phone: string;
  role_id: number | null;
  shop_id: number | null;
  supplier_id?: number | null;
  is_active: boolean;
}

interface Props {
  open: boolean;
  handleClose: () => void;
  fetchData: any;
  selectedItem?: any;
}

const defaultValues: FormData = {
  name: "",
  email: "",
  password: "",
  phone: "",
  role_id: null,
  shop_id: null,
  supplier_id: null,
  is_active: true,
};

const AddUser = ({ open, handleClose, fetchData, selectedItem }: Props) => {
  const [isLoading, setIsLoading] = useState(false);

  const isEdit = Boolean(selectedItem);

  const methods = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues,
    context: { isEdit },
  });

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = methods;

  useEffect(() => {
    if (selectedItem) {
      reset({
        name: selectedItem.name || "",
        email: selectedItem.email || "",
        phone: selectedItem.phone || "",
        role_id: selectedItem.role_id || (selectedItem.roles?.[0]?.id) || null,
        shop_id: selectedItem.shop_id || (selectedItem.shop?.id) || null,
        supplier_id: selectedItem.supplier_id || null,
        is_active: selectedItem.is_active === true || selectedItem.is_active === 1,
        password: selectedItem.password || "",
      });
    } else {
      reset(defaultValues);
    }
  }, [selectedItem, reset]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const payload = {
        ...data,
        is_active: data.is_active ? 1 : 0,
      };

      // Remove password if empty (especially for edit)
      if (!payload.password) {
        delete payload.password;
      }

      let url = selectedItem
        ? `/api/v1/updateUser/${selectedItem.id}`
        : "/api/v1/registerUser";

      const response = await axiosInstance.post(url, payload);

      if (response.data.success) {
        toast.success(response.data.message || (selectedItem ? "User updated successfully" : "User created successfully"));
        fetchData();
        handleCloseModal();
      }
    } catch (e: any) {
      const apiErrors = e?.response?.data?.data;
      if (apiErrors) {
        Object.keys(apiErrors).forEach((key) => {
          methods.setError(key as any, {
            type: "manual",
            message: apiErrors[key][0],
          });
        });
      } else {
        toast.error(e?.response?.data?.message || "Something went wrong");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    reset(defaultValues);
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCloseModal}
       maxWidth={'md'}
      fullWidth
    >
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          fontWeight: "bold",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: theme => theme.palette.action.hover,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          {selectedItem ? "Edit" : "Add"} User
        </Typography>
        <IconButton onClick={handleCloseModal}>
          <HighlightOffIcon sx={{ color: "error.main" }} fontSize="large" />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Toaster position="top-right" />
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6}>
              <RHFInput control={control} name="name" label="Full Name" placeholder="Full Name" mandatory />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFInput control={control} name="email" label="Email ID" placeholder="Email ID" mandatory />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFInput
                control={control}
                name="phone"
                label="Mobile Number"
                placeholder="Mobile Number"
                mandatory
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFInput
                control={control}
                name="password"
                label={"Password"}
                placeholder="Password"
                inputType="password"
                mandatory={!isEdit}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFAutoComplete
                control={control}
                name="role_id"
                labelinput="Role"
                placeholder="Select Role"
                apiUrl="/api/v1/getAllRoles"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <RHFAutoComplete
                control={control}
                name="shop_id"
                labelinput="Shop"
                placeholder="Select Shop"
                apiUrl="/api/v1/admin/getAllShops"
                required
                labelKey="name"
                valueKey="id"
              />
            </Grid>
            {/* <Grid item xs={12} sm={6}>
              <RHFAutoComplete
                control={control}
                name="supplier_id"
                labelinput="Supplier (Optional)"
                placeholder="Select Supplier"
                apiUrl="/api/v1/admin/suppliers/getAllSuppliers"
              />
            </Grid> */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ mt: 4 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={methods.watch("is_active")}
                      onChange={(e) => setValue("is_active", e.target.checked)}
                    />
                  }
                  label={methods.watch("is_active") ? "Active" : "Inactive"}
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseModal} variant="outlined" color="secondary">
            Cancel
          </Button>
          <SubmitButton isLoading={isLoading} label={selectedItem ? "Edit User" : "Add User"} />
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddUser;
