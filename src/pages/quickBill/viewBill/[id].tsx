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
import AllDocuments from "src/components/AllDocuments/allDocument";
import ImageModal from "src/components/ImageModal";
import ProductPlants from "src/components/productplant/ProductPlants";

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
  const [selectedData, setSelectedData] = useState<any>({})
  const [newData, setNewData] = useState<any>({})
  const [open, setOpen] = React.useState(false);
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
  const plantDetails: any = (newData as any)?.value ?? newData ?? {}
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

  const statusKey = (plantDetails?.status?.toLowerCase?.() as keyof typeof colorMap) ?? "pending"
  const { text, background } = colorMap[statusKey] || colorMap.pending;

  const [open1, setOpen1] = useState(false);
  const handleClose1 = () => setOpen1(false);
  const dispatch = useDispatch<AppDispatch>();
  //const handleButtonClick = (data: any) => {
    setOpen1(true);
    //};

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
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
  //       // ////       setSelectedData('')
  //       getAllData()
  //     } else {
  //       setIsLoading(false)
  //     }
  //   } catch (error) {
  //     // ////   }
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

  const getAllData = async () => {
    try {
      setIsLoading(true);
      // //const limit = `limit=${rowsPerPage}`;
      const pageNo = `pageNo=${page}`;
      const url = `/api/v1/admin/products/getProductsById/${id}`;
      const response = await get(url, "");
      if (response["success"]) {
        setIsLoading(false);
        setNewData(response["data"]);
        // setCount(response['data']['count'])
        // } else {
        setIsLoading(false);
      }
    } catch (error) {
      // //}
  };
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    getAllData();
  }, []);

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
      }
  };

  const plantCategories = Array.isArray(plantDetails?.categories) ? plantDetails.categories : []
  const normalizedId = Array.isArray(id) ? id[0] : id

  return (
    <>
      {/* {isLoading && <Loader open={isLoading} />} */}
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
              Product Details
            </Typography>
          </Box>
        </Grid>
        {/* <Grid item xs={12} md={2}>
          <ActionButtonBox
            newData={plantDetails}
            id={plantDetails?.id}
            apiEndpoint="/api/v1/admin/approveDriver"
            getAllData={getAllData}
          />
        </Grid> */}
      </Grid>{" "}
      {/* <Card sx={{ height: "auto", p: 2 }} className="bg-gray-50">
        <CardContent>
          <Box sx={{ width: "100%" }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4} sx={{ mb: 2 }}>
                <Box sx={{ width: "100px", heigth: "100px", mx: "auto" }}>
                  <ImageModal
                    imageUrl={
                      `${BASE_URL}/${plantDetails?.profile_picture}` ||
                      "/images/demopic.jpg"
                    }
                    altText="Light Logo"
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={4} sx={{ mb: 2 }}>
                <Typography variant="body1"> Name</Typography>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  {plantDetails?.plant_name || plantDetails?.name || "NA"}
                </Typography>
              </Grid>

              <Grid item xs={12} md={4} sx={{ mb: 2 }}>
                <Typography variant="body1"> Email ID</Typography>
                <Typography
                  variant="fontWeight: 600"
                  sx={{ mb: 2, fontWeight: 600 }}>
                  <EmailModule email={plantDetails?.email ?? ""} />
                </Typography>
              </Grid>
              <Grid item xs={12} md={4} sx={{ mb: 2 }}>
                <Typography variant="body1"> Mobile Number</Typography>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  <MobileNumberModule mobileNo={plantDetails?.mobile} />
                </Typography>
              </Grid>
              <Grid item xs={12} md={4} sx={{ mb: 2 }}>
                <Typography variant="body1">City</Typography>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  {plantDetails?.addresses ? plantDetails?.addresses[0]?.city : plantDetails?.city || "NA"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4} sx={{ mb: 2 }}>
                <Typography variant="body1">Pincode</Typography>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  {plantDetails?.addresses ? plantDetails?.addresses[0]?.pincode : plantDetails?.pincode || "NA"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4} sx={{ mb: 2 }}>
                <Typography variant="body1">State</Typography>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  {plantDetails?.addresses ? plantDetails?.addresses[0]?.state : plantDetails?.state || "NA"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4} sx={{ mb: 2 }}>
                <Typography variant="body1"> PAN Number</Typography>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  {plantDetails?.pan_number || "NA"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4} sx={{ mb: 2 }}>
                <Typography variant="body1" >
                  {" "}
                  GST Number
                </Typography>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  {plantDetails?.gst_number || "NA"}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card> */}

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
              Product Details
            </Typography>
            <Grid container spacing={2}>
              {/* <Grid
                item
                xs={12}
                md={3}
                sx={{
                  mb: 2,
                  // match height of right section

                }}
              >
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Product Photo
                </Typography>

                <ImageModal
                  imageUrl={
                    `${plantDetails?.profile_picture}` ||
                    "/images/demopic.jpg"
                  }
                  altText="Light Logo"
                />

              </Grid> */}

              <Grid item xs={12} md={12} sx={{ mb: 2 }}>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={4} sx={{ mb: 2 }}>

                    <Typography variant="body1">Product Name</Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{ mb: 2, fontWeight: 600 }}
                    >
                      {plantDetails?.name || plantDetails?.name || "NA"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4} sx={{ mb: 2 }}>
                    <Typography variant="body1">Categories Name</Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{ mb: 2, fontWeight: 600 }}
                    >
                      {plantDetails?.categories?.name || "NA"}

                      {/* <MobileNumberModule mobileNo={plantDetails?.mobile} /> */}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body1" >
                      Product Grade
                    </Typography>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                      {plantDetails?.grade?.name || "NA"}

                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body1" >
                      Polish Type
                    </Typography>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                      {plantDetails?.polish_type?.name || "NA"}

                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4} sx={{ mb: 2 }}>

                    <Typography variant="body1">Moisture Level (%)</Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{ mb: 2, fontWeight: 600 }}
                    >
                      {plantDetails?.default_moisture_content ?? "NA"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4} sx={{ mb: 2 }}>

                    <Typography variant="body1">Purity (%)</Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{ mb: 2, fontWeight: 600 }}
                    >
                      {plantDetails?.purity ?? "NA"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4} sx={{ mb: 2 }}>

                    <Typography variant="body1">Foreign Matter (%) </Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{ mb: 2, fontWeight: 600 }}
                    >
                      {plantDetails?.default_foreign_matter ?? "NA"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4} sx={{ mb: 2 }}>

                    <Typography variant="body1">Packaging (kg) </Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{ mb: 2, fontWeight: 600 }}
                    >
                      {plantDetails?.default_packaging_kg ?? "NA"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4} sx={{ mb: 2 }}>

                    <Typography variant="body1">Grain Size (MM) </Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{ mb: 2, fontWeight: 600 }}
                    >
                      {plantDetails?.grain_size ?? "NA"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={12} sx={{ mb: 2 }}>

                    <Typography variant="body1"> Product Description </Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{ mb: 2, fontWeight: 600 }}
                    >
                      {plantDetails?.description || plantDetails?.description || "NA"}
                    </Typography>
                  </Grid>
                  {/* <Grid item xs={12} md={6}>
                    <Typography variant="body1" >
                      PAN Number
                    </Typography>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                      {plantDetails?.pan_number || "NA"}
                    </Typography>
                  </Grid> */}
                  {/* <Grid item xs={12} md={6} sx={{ mb: 2 }}>
                    <Typography variant="subtitle1">Email ID</Typography>
                    <Typography
                      color="primary.main"
                      variant="subtitle1"
                      onClick={() => {
                        if (plantDetails?.owner?.email) {
                          window.open(`https://mail.google.com/mail/u/0/?view=cm&fs=1&to=${plantDetails.email}`, '_blank');
                        }
                      }}
                      sx={{
                        mb: 2,
                        fontWeight: 600,
                        whiteSpace: 'pre-line', // Allow line breaks (\n)
                        wordBreak: 'break-word', cursor: plantDetails?.email ? 'pointer' : 'default'
                      }}
                    >
                    {plantDetails?.email || 'NA'}
                    </Typography>

                  </Grid> */}


                  {/* City */}
                  {/* <Grid item xs={12} md={4}>
                    <Typography variant="body1" >
                      Address
                    </Typography>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                      {plantDetails?.address || plantDetails?.addresses?.[0]?.address_line1 || "NA"}, {plantDetails?.district || plantDetails?.addresses?.[0]?.district || "NA"}, {plantDetails?.city || plantDetails?.addresses?.[0]?.city || "NA"},<br />
                      {plantDetails?.state || plantDetails?.addresses?.[0]?.state || "NA"}, {plantDetails?.pincode || plantDetails?.addresses?.[0]?.pincode || "NA"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body1" >
                      Plant Categories
                    </Typography>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                      {Array.isArray(plantDetails?.categories) && plantDetails.categories.length
                        ? plantDetails.categories.map((cat: any) => cat?.name).join(', ')
                        : 'NA'}
                    </Typography>
                  </Grid> */}


                </Grid>
              </Grid>



            </Grid>
          </Card>
        </Grid>

        {/* <Grid item xs={12} md={4} >
          <Card sx={{ height: "325px", p: 4, mr: 1 }} className="bg-gray-50">
            <Typography sx={{ fontWeight: 600, fontSize: 20, mb: 3 }}>
              Organisation Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6} sx={{ mb: 2 }}>
                <Typography variant="body1">Organisation Name</Typography>
                <Typography
                  variant="subtitle1"
                  sx={{ mb: 2, fontWeight: 600 }}
                >
                  {plantDetails?.organization_name || "NA"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6} sx={{ mb: 2 }}>
                <Typography variant="body1" >Organisation Type</Typography>
                <Typography
                  variant="subtitle1"
                  sx={{ mb: 2, fontWeight: 600 }}
                >
                  {plantDetails?.organization_type?.name || "NA"}
                </Typography>
              </Grid>

              {plantDetails?.reason == "approved" && <Grid item xs={12} md={12} sx={{ mb: 2 }}>
                <Typography variant="body1">Approve Comment</Typography>
                <Typography
                  variant="subtitle1"
                  sx={{ mb: 2, fontWeight: 600 }}
                >
                  {plantDetails?.reason == "approved" ? plantDetails?.reason : "NA"}
                </Typography>
              </Grid>}
              {plantDetails?.reason == "rejected" && <Grid item xs={12} md={12} sx={{ mb: 2 }}>
                <Typography variant="body1">Rejected Reason</Typography>
                <Typography
                  variant="subtitle1"
                  sx={{ mb: 2, fontWeight: 600 }}
                >
                  {plantDetails?.reason == "rejected" ? plantDetails?.reason : "NA"}
                </Typography>
              </Grid>}
            </Grid>
          </Card>
        </Grid> */}

        {/* {plantCategories.length > 0 && (
          <Grid item xs={12}>
            <Card sx={{ mt: 4, p: 4 }}>
              <Typography sx={{ fontWeight: 600, fontSize: 20, mb: 3 }}>
                Plant Categories
              </Typography>
              <Grid container spacing={2}>
                {plantCategories.map((category: any) => (
                  <Grid item xs={12} md={6} lg={4} key={category.id}>
                    <Box
                      sx={{
                        border: '1px solid #E0E0E0',
                        borderRadius: 2,
                        p: 3,
                        height: '100%'
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        {category.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        ID: {category.id}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {category.description || 'No description provided.'}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Card>
          </Grid>
        )} */}


      </Grid>
      <Grid container spacing={2} marginBottom={4}>
        <Grid item xs={12} md={8}>
          {plantDetails?.documents?.length > 0 && (
            <Card sx={{ height: "auto", p: 4, mr: 1, mt: 4 }} className="bg-gray-50">

              <Box sx={{ mt: 4 }}>
                <Typography sx={{ fontWeight: 600, fontSize: 20, mb: 2 }}>
                  Plant Documents
                </Typography>

                <Grid container spacing={2}>
                  {plantDetails?.documents?.map((doc: any, index: number) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                      <Typography
                        variant="subtitle1"

                      >
                        {doc.remarks || "Document"}
                      </Typography>
                      <Box
                        sx={{
                          position: "relative",
                          width: "100%",
                          aspectRatio: "4 / 3",
                          overflow: "hidden",
                          p: 2, // Adds space between border and image
                          backgroundColor: "#fafafa",
                          mb: 2,
                        }}
                      >
                        {/* ✅ Download Button (Top Right) */}
                        <IconButton
                          size="small"
                          sx={{
                            position: "absolute",
                            top: 7,
                            right: 7,
                            backgroundColor: "rgba(255,255,255,0.8)",
                            "&:hover": { backgroundColor: "rgba(255,255,255,1)" },
                            zIndex: 2,
                          }}
                          onClick={() => handleDownload(doc.document_path, doc.remarks)}
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>

                        {/* ✅ Document Image */}
                        <img
                          src={doc.document_path}
                          alt={doc.remarks || "Document"}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "8px",
                            display: "block",
                          }}
                        />
                      </Box>

                      {/* ✅ Document Name */}

                    </Grid>
                  ))}
                </Grid>
              </Box>

            </Card>)}
        </Grid>
      </Grid>

      {/* <ProductPlants customerId={normalizedId}/> */}
      {/* <Box sx={{ width: "100%" }}>
        <Card sx={{ mt: 4, p: 4 }} className="bg-gray-50">

          <Tabs
            value={value}
            onChange={handleChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="profile tabs"
            sx={{ mb: 2, mt: 4 }}
          >
            <Tab label="Customer Documents" {...a11yProps(0)} />
            <Tab label="Organisation Documents" {...a11yProps(1)} />
          </Tabs>

          <Divider sx={{ mb: 3 }} />

          <CustomTabPanel value={value} index={0}>
            <AllDocuments
              document_type="App\Models\Customer"
              documentable_id={`${normalizedId}`}
            />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            <AllDocuments
              document_type="App\Models\Vendor"
              documentable_id={`${plantDetails?.owner_id}`} getAllData={getAllData}
            />
          </CustomTabPanel>
        </Card>
      </Box> */}

    </>
  );
}
