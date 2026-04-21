import { yupResolver } from "@hookform/resolvers/yup";
import {
  CardContent,
  Grid,
  Box,
  Typography,
  TableCell,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Tab,
  Tabs,
  Button,
  Modal,
  TextField,
  TablePagination,
  Divider,
  Link,
  useTheme,
  CircularProgress,
} from "@mui/material";
import Card from "@mui/material/Card";
import { Icon } from "@iconify/react";
import React, { useEffect, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "src/store";
import * as yup from "yup";
import { useRouter } from "next/router"; // Import useRouter
import { useDispatch } from "react-redux";
import FacebookIcon from "@mui/icons-material/Facebook";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import LanguageIcon from "@mui/icons-material/Language";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import InstagramIcon from "@mui/icons-material/Instagram";
import moment from "moment";
import CallIcon from "@mui/icons-material/Call";
// import Loader from 'src/util/Loadar';
import { DataGrid } from "@mui/x-data-grid";
// import FlagComponent from 'src/hookforms/FlagComponent';
import RedditIcon from "@mui/icons-material/Reddit";
// import PdfImagePreview from 'src/hookforms/ImagePreview';
// import ImageModal from 'src/hookforms/ImageModal';
import { get } from "src/services/apiCall";
import EmailModule from "src/components/common/Links/EmailLink";
import MobileNumberModule from "src/components/common/Links/MobileNumberModule";
import ActionButtonBox from "src/components/actionButtonBox";
import ImageModal from "src/components/ImageModal";
import Plants from "src/components/plant/Plants";
import { decodeParams } from "src/utils/encodeid";
import DateFormateComponent from "src/components/common/dateFormat/DateFromatModule";
import Loader from "src/utils/Loadar";

const style1 = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 1000,
  bgcolor: "background.paper",
  height: 500,
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  "@media (max-width: 600px)": {
    width: "95%", // Adjust width for smaller screens
    height: "500px", // Adjust height for smaller screens
  },
  "@media (max-width: 700px)": {
    width: "95%", // Adjust width for smaller screens
    height: "500px", // Adjust height for smaller screens
  },
};
const style = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  height: 200,
  boxShadow: 24,
  p: 4,
};
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export default function Viewopportunity() {
  const theme = useTheme();

  const [isLoading, setIsLoading] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(0);
  const [selectedData, setSelectedData] = useState<Record<string, any>>({});
  const [newData, setNewData] = useState<Record<string, any>>({});
  const [open, setOpen] = React.useState(false);
  const [resolvedUserId, setResolvedUserId] = useState<number | undefined>(
    undefined
  );
  const handleClose = () => setOpen(false);
  const handleOpen = (data: any) => {
    setSelectedData(data);
    setOpen(true);
  };
  const { back } = useRouter(); // Use useRouter hook
  const BASE_URL = `${process.env.NEXT_PUBLIC_BASEURL}`;

  const methods = useForm();

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const router = useRouter();
  const { id } = router.query;
  const colorMap = {
    approved: {
      text: "#2e7d32", // green
      background: "rgba(46, 125, 50, 0.1)",
    },
    rejected: {
      text: "#d32f2f", // red
      background: "rgba(211, 47, 47, 0.1)",
    },
    pending: {
      text: "#ed6c02", // orange
      background: "rgba(237, 108, 2, 0.1)",
    },
  };

  const statusKey: keyof typeof colorMap =
    typeof newData?.status === "string" && newData.status in colorMap
      ? (newData.status as keyof typeof colorMap)
      : "pending";
  const { text, background } = colorMap[statusKey] || colorMap.pending;

  const [open1, setOpen1] = useState(false);
  const handleClose1 = () => setOpen1(false);
  const dispatch = useDispatch<AppDispatch>();
  //console.log(opportunityprofile)
  const handleButtonClick = (data: any) => {
    setOpen1(true);
    //console.log(data)
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  // const updateOppurtunity = async (id, accepted, reason) => {

  //   try {

  //     let payload = {
  //       "accepted": accepted,
  //     };
  //     if (!accepted && reason) {
  //       payload.reason = reason;
  //     }
  //     setIsLoading(true)
  //     const usedId = id || selectedData.id;

  //     const response = await commanservice('post', `/api/v1/admin/opportunityApprovalStatus?opportunity_id=${2}`, payload)
  //     if (response['success']) {
  //       setIsLoading(false)
  //       // //console.log(response)
  //       setSelectedData('')
  //       getAllData()
  //     } else {
  //       setIsLoading(false)
  //     }
  //   } catch (error) {
  //     // //console.log(error)
  //   }
  // }
  const defaultValues = {
    id: "",
    accepted: "",
    reason: "",
  };
  const schema = yup.object().shape({
    accepted: yup.boolean(),
    reason: yup.string(),
  });
  const handleClickOpen = (file: string) => {
    window.open(`${file}`, "_blank");
  };
  const handleClick = (link: string) => {
    window.open(`${link}`, `_blank`);
  };

  const resolveId = (
    raw: string | string[] | number | undefined
  ): number | undefined => {
    if (!raw) {
      return undefined;
    }

    const value = Array.isArray(raw) ? raw[0] : raw;
    if (typeof value === "number") {
      return value;
    }
    try {
      const decoded = decodeParams(value);
      if (typeof decoded === "number" && !Number.isNaN(decoded)) {
        return decoded;
      }
      if (decoded && typeof decoded === "object" && "id" in decoded) {
        const numericId = Number(decoded.id);
        if (!Number.isNaN(numericId)) {
          return numericId;
        }
      }
      const fallback = Number(decoded ?? value);
      if (!Number.isNaN(fallback)) {
        return fallback;
      }
    } catch (error) {
      const fallback = Number(value);
      if (!Number.isNaN(fallback)) {
        return fallback;
      }
    }

    return undefined;
  };

  useEffect(() => {
    const userIdValue = resolveId(id);
    setResolvedUserId(userIdValue);
  }, [id]);

  const getAllData = async () => {
    if (!resolvedUserId) return;

    setIsLoading(true);

    try {
      const url = `/api/v1/admin/users/getUserById/${resolvedUserId}`;
      const response = await get(url, "");

      if (!response?.success) return;

      const userData = response.data?.data ?? response.data;
      setNewData(userData);

      if (userData?.id) {
        setResolvedUserId((prev) => prev ?? Number(userData.id));
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    if (resolvedUserId) {
      getAllData();
    }
  }, [resolvedUserId]);

  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema), defaultValues });

  const handleDownload = async (url: string, name: string) => {
    try {
      const response = await fetch(url, { mode: "cors" });
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = name || "document.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <>
      {isLoading && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255,255,255,0.6)", // optional overlay
            zIndex: 1300, // above everything
          }}
        >
          {/* <Loader open={isLoading} /> */}
          <CircularProgress />
        </Box>
      )}
      <Grid
        container
        spacing={2}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "row",
          pl: 4,
          pr: 7,
          mb: 3,
        }}
      >
        <Grid item xs={12} md={10}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              onClick={back}
              sx={{
                marginBottom: "15px",
                boxShadow: "none!important",
                color: "#3598DB",
              }}
              aria-label="back"
            >
              <ArrowBackIcon sx={{ color: "#3598DB" }} />
            </IconButton>

            <Typography
              sx={{
                fontWeight: 600,
                fontSize: 20,
                ml: 2,
                color: "#3598DB",
                mb: "15px",
              }}
            >
              User Details
            </Typography>
          </Box>
        </Grid>
      </Grid>{" "}
      <Grid
        container
        spacing={2}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "row",
        }}
      >
        <Grid item xs={12} md={12}>
          <Card sx={{ height: "auto", p: 4, ml: 1 }} className="bg-gray-50">
            <Typography sx={{ fontWeight: 600, fontSize: 20, mb: 3 }}>
              User Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={12} sx={{ mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3} sx={{ mb: 2 }}>
                    <Typography variant="body1"> Organization Name</Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{ mb: 2, fontWeight: 600 }}
                    >
                      {newData?.organization_name || "NA"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3} sx={{ mb: 2 }}>
                    <Typography variant="body1">User Name</Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{ mb: 2, fontWeight: 600 }}
                    >
                      {newData?.name || "NA"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3} sx={{ mb: 2 }}>
                    <Typography variant="subtitle1">Email ID</Typography>
                    <Typography
                      color="#1976d2"
                      variant="subtitle1"
                      onClick={() => {
                        if (newData?.email) {
                          window.open(
                            `https://mail.google.com/mail/u/0/?view=cm&fs=1&to=${newData.email}`,
                            "_blank"
                          );
                        }
                      }}
                      sx={{
                        mb: 2,
                        fontWeight: 600,
                        whiteSpace: "pre-line", // Allow line breaks (\n)
                        wordBreak: "break-word",
                        cursor: newData?.email ? "pointer" : "default",
                      }}
                    >
                      {newData?.email || "NA"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3} sx={{ mb: 2 }}>
                    <Typography variant="body1">Mobile Number</Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{ mb: 2, fontWeight: 600 }}
                    >
                      <MobileNumberModule mobileNo={newData?.mobile_number} />
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body1">Role</Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        mb: 2,
                        fontWeight: 600,
                        textTransform: "capitalize",
                      }}
                    >
                      {newData?.role || "NA"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3} sx={{ mb: 2 }}>
                    <Typography variant="body1">User Type</Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        mb: 2,
                        fontWeight: 600,
                        textTransform: "capitalize",
                      }}
                    >
                      {newData?.sub_role || "NA"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3} sx={{ mb: 2 }}>
                    <Typography variant="body1">Status</Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{ mb: 2, fontWeight: 600 }}
                    >
                      {newData?.is_active === true
                        ? "Active"
                        : "Inactive" || "NA"}
                    </Typography>
                  </Grid>

                  {/* Address */}
                  <Grid item xs={12} md={3}>
                    <Typography variant="body1">Address</Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{ mb: 2, fontWeight: 600 }}
                    >
                      {newData?.address || "NA"}
                      {newData?.city && `, ${newData.city}`}
                      {newData?.state && `, ${newData.state}`}
                      {newData?.pincode && ` - ${newData.pincode}`}
                      {!newData?.address &&
                        !newData?.city &&
                        !newData?.state &&
                        !newData?.pincode &&
                        "NA"}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={3} sx={{ mb: 2 }}>
                    <Typography variant="body1">Aadhar Card Number </Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{ mb: 2, fontWeight: 600 }}
                    >
                      {newData?.aadhar_number || "NA"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3} sx={{ mb: 2 }}>
                    <Typography variant="body1">PAN Number </Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{ mb: 2, fontWeight: 600 }}
                    >
                      {newData?.pan_number || "NA"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3} sx={{ mb: 2 }}>
                    <Typography variant="body1">GST Number </Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{ mb: 2, fontWeight: 600 }}
                    >
                      {newData?.gst_number || "NA"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3} sx={{ mb: 2 }}>
                    <Typography variant="body1">Account Number</Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{ mb: 2, fontWeight: 600 }}
                    >
                      {newData?.account_number || "NA"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3} sx={{ mb: 2 }}>
                    <Typography variant="body1">Bank Name</Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{ mb: 2, fontWeight: 600 }}
                    >
                      {newData?.bank_name || "NA"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3} sx={{ mb: 2 }}>
                    <Typography variant="body1">Branch Name</Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{ mb: 2, fontWeight: 600 }}
                    >
                      {newData?.branch_name || "NA"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3} sx={{ mb: 2 }}>
                    <Typography variant="body1">IFSC Code </Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{ mb: 2, fontWeight: 600 }}
                    >
                      {newData?.ifsc_code || "NA"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3} sx={{ mb: 2 }}>
                    <Typography variant="body1">Commission Per Ton </Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{ mb: 2, fontWeight: 600 }}
                    >
                      {newData?.commission_per_ton || "NA"}
                    </Typography>
                  </Grid>
                  {newData.aadhar_document_url && (
                    <Grid item xs={12} md={3} sx={{ mb: 2 }}>
                      <Typography variant="body1">Aadhar Document</Typography>

                      <Box sx={{
                        height: "170px",
                        width: "170px",
                      }}>
                        <img
                          src={newData?.aadhar_document_url || ""}
                          alt="Aadhar Document"
                          style={{
                            objectFit: 'contain', // This ensures the image fills the entire area, but it may crop part of the image
                            cursor: 'pointer',
                            height: "100%",
                            width: "100%",
                            marginTop: '20px'
                          }}
                        />
                      </Box>
                    </Grid>

                  )}
                  {newData.pan_document_url && (
                    <Grid item xs={12} md={3} sx={{ mb: 2 }}>
                      <Typography variant="body1">Pan Document</Typography>
                      <Box sx={{
                        height: "170px",
                        width: "170px",
                      }}>
                        <img
                          src={newData?.pan_document_url || ""}
                          alt="Pan Document"
                          style={{
                            objectFit: 'contain', // This ensures the image fills the entire area, but it may crop part of the image
                            cursor: 'pointer',
                            height: "100%",
                            marginTop: '20px',
                            width: "100%"
                          }}
                        />
                      </Box>
                    </Grid>
                  )}
                  {newData.gst_certificate_url && (
                    <Grid item xs={12} md={3} sx={{ mb: 2 }}>
                      <Typography variant="body1">GST Document</Typography>
                      <Box sx={{
                        height: "170px",
                        width: "170px",
                        marginTop: '4px'
                      }}>
                        <img
                          src={newData?.gst_certificate_url || ""}
                          alt="Gst Document"
                          style={{
                            objectFit: 'contain', // This ensures the image fills the entire area, but it may crop part of the image
                            cursor: 'pointer',
                            height: "100%",
                            marginTop: '20px',
                            width: "100%"
                          }}
                        />
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* <Grid container spacing={2} padding={2}>
          <Grid item xs={12} md={12}>
            {resolvedUserId && <UserPlants userId={resolvedUserId} />}
          </Grid>
        </Grid> */}

        {(
          (newData?.sub_role === "seller" && newData?.role === "manufacturer") ||
          (newData?.sub_role === "buyer" && newData?.role === "trader")
        ) && resolvedUserId && (<Grid container spacing={2} padding={2}>
          <Grid item xs={12} md={12}>
            {/* <UserPlants userId={resolvedUserId} /> */}
          </Grid>
        </Grid>
          )}

      </Grid>
    </>
  );
}
