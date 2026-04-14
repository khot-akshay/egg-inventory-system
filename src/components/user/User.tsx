import {
  Box,
  Button,
  Card,
  Grid,
  InputAdornment,
  Menu,
  MenuItem,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { GridCellParams, GridColDef, GridSearchIcon } from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import CommonDatagrid from "src/components/common/DatagridData.tsx/CommonDatagrid";

import GoBack from "src/components/common/goBack/GoBackButton";
import axiosInstance from "src/services/axios";
import Icon from "src/@core/components/icon";
import DeleteDialogPopup from "src/components/common/DeletePopup/DeleteModalPopup";
import checkPermission from "src/configs/CheckPermisstion";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

import DateFormateComponent from "src/components/common/dateFormat/DateFromatModule";
import SearchInput from "src/components/common/SearchInput";
import AddCategories from "./AddUser";
import toast from "react-hot-toast";
import AddProducts from "./AddUser";
import AddUser from "./AddUser";
import Link from "next/link";
import { useRouter } from "next/router";
import RHFAutoComplete from "src/hook-forms/RHFAutoComplete";
import RHFAutoComplete2 from "src/hook-forms/RHFAutoComplete2";

interface CategoryRow {
  id: number;
  name: string;
  slug?: string;
  description?: string | null;
  image_url?: string | null;
  is_active?: boolean;
  created_at?: string | null;
  [key: string]: any;
}

const User = () => {
  const [rows, setRows] = useState<CategoryRow[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);
  const [openAdd, setOpenAdd] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CategoryRow | null>(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [searchQuery, setQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [addUserConfig, setAddUserConfig] = useState<{ role: string; subRole?: string }>({ role: "" });
  const [currentTab, setCurrentTab] = useState("all");
  const [tabCounts, setTabCounts] = useState({ all: 0, manufacturer: 0, trader: 0, financer: 0 });
  const { control, watch } = useForm({
    defaultValues: {
      sub_role: "",
    },
  });
  const selectedSubRole = watch("sub_role");
  const openMenu = Boolean(anchorEl);

  const fetchTabCounts = async () => {
    try {
      let baseUrl = "/api/v1/admin/users/getAllUsers?limit=1";
      if (selectedSubRole) {
        baseUrl += `&sub_role=${selectedSubRole}`;
      }

      const [allRes, manufacturerRes, traderRes, financerRes] = await Promise.all([
        axiosInstance.get(baseUrl),
        axiosInstance.get(`${baseUrl}&tab=manufacturer`),
        axiosInstance.get(`${baseUrl}&tab=trader`),
        axiosInstance.get(`${baseUrl}&tab=financer`),
      ]);

      setTabCounts({
        all: allRes.data.data?.count ?? 0,
        manufacturer: manufacturerRes.data.data?.count ?? 0,
        trader: traderRes.data.data?.count ?? 0,
        financer: financerRes.data.data?.count ?? 0,
      });
    } catch (e) {
      console.error("Failed to fetch tab counts", e);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
    setPage(0); // Reset page when tab changes
  };

  const handleClickAdd = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleSelectUserType = (role: string, subRole?: string) => {
    setAddUserConfig({ role, subRole });
    setOpenAdd(true);
    handleCloseMenu();
  };

  const router = useRouter();

  // const fetchGame = async () => {
  //   setLoading(true)
  //   try {
  //     const response = await axiosInstance.get(`/api/v1/admin/getAllBrands?pageNo=${page}&limit=${pageSize}`)

  //     setRows(response.data.data.brands ?? [])
  //     setTotalRows(response.data.data?.count ?? 0)
  //   } catch (e) {
  //     console.log(e)
  //   } finally {
  //     setLoading(false)
  //   }
  // }
  // const fetchGame = async () => {
  //   setLoading(true);
  //   try {

  //     const response = await axiosInstance.get(`/api/v1/admin/getAllBrands?pageNo=${page}&limit=${pageSize}`);

  //     setRows(response.data.data.brands ?? []);
  //     setTotalRows(response.data.data?.count ?? 0);
  //   } catch (e) {
  //     console.log(e);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const fetchGame = async () => {
    setLoading(true);
    try {
      let url = `/api/v1/admin/users/getAllUsers?pageNo=${page}&limit=${pageSize}`;

      if (currentTab !== 'all') {
        url += `&tab=${currentTab}`;
      }

      // if (searchQuery) {
      //   url += `&search=${encodeURIComponent(searchQuery)}`;
      // }
      if (searchQuery) {
        url = `${url}&global_search=${searchQuery}`;
      }

      if (selectedSubRole) {
        url += `&sub_role=${selectedSubRole}`;
      }

      const response = await axiosInstance.get(url);
      setRows((response.data.data?.data ?? []) as CategoryRow[]);
      const count = response.data.data?.count ?? 0;
      setTotalRows(count);

      // Update the count for the current tab in tabCounts as well to keep it in sync
      setTabCounts(prev => ({
        ...prev,
        [currentTab]: count
      }));
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGame();
  }, [page, pageSize, searchQuery, currentTab, selectedSubRole]);

  useEffect(() => {
    fetchTabCounts();
  }, [selectedSubRole]); // Fetch counts on mount and when sub_role filter changes

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
  };
  const handleEditClick = (params: GridCellParams) => {
    setSelectedItem(params.row as CategoryRow);
    setOpenEdit(true);
  };
  const handleDeleteOpen = (params: GridCellParams) => {
    console.log("Delete Clicked:", params.row);
    setSelectedItem(params.row as CategoryRow);
    setOpenDelete(true);
    console.log("Selected Item for delete:", selectedItem);
  };

  const handleSwitchChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    params: any
  ) => {
    const { checked } = event.target;

    try {
      const response = await axiosInstance.post(
        `/api/v1/admin/users/updateUser/${params.id}`,
        { is_active: checked ? 1 : 0 }
      );

      fetchGame();
      fetchTabCounts(); // Refresh counts after update

      toast.success(response.data.message || "Status updated successfully.");
    } catch (e: any) {
      const errorMessage = e?.response?.data?.message || "Failed to set active";
      toast.error(errorMessage);
    }
  };

  const handleViewUser = (id: number) => {
    router.push(`/user/viewUser/${id}`);
  };
  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "Sr. No.",
      flex: 1,
      minWidth: 100,

      sortable: false,
      renderCell: (index) => {
        const rowIndex = index.api.getRowIndex(index.row.id);
        return page * pageSize + (rowIndex % pageSize) + 1;
      },
      hideable: false,
    },
    {
      field: "name",
      headerName: " User Name",
      flex: 1,

      minWidth: 250,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        //  <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
        //   {params.row?.name || 'NA'}
        // </div>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            cursor: "pointer",
            alignItems: "start",
            height: "100%",
          }}
          onClick={() => handleViewUser(params.row.id)}
        >
          <Typography color="primary.main">
            {" "}
            {params.row?.name || "NA"}
          </Typography>

          <Icon
            icon="solar:arrow-right-up-linear"
            style={{ color: "primary", fontSize: 15 }}
          ></Icon>
        </Box>
      ),
    },
    {
      field: "categories.name",
      headerName: "Organization Name",
      flex: 1,

      minWidth: 250,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <div
          style={{
            whiteSpace: "normal",
            wordBreak: "break-word",
            lineHeight: 1.5,
          }}
        >
          {params.row?.organization_name || "NA"}
        </div>
      ),
    },

    // {
    //   field: "default_grade",
    //   headerName: "Email ID",
    //   flex: 1,

    //   minWidth: 350,
    //   sortable: false,
    //   renderCell: (params: GridCellParams) => (
    //     <div
    //       style={{
    //         whiteSpace: "normal",
    //         wordBreak: "break-word",
    //         lineHeight: 1.5,
    //       }}
    //     >
    //       {params.row?.email || "NA"}
    //     </div>
    //   ),
    // },
    {
      field: "default_polish_type",
      headerName: "Whatsapp Number  ",
      flex: 1,

      minWidth: 250,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <div
          style={{
            whiteSpace: "normal",
            wordBreak: "break-word",
            lineHeight: 1.5,
          }}
        >
          {params.row?.mobile_number || "NA"}
        </div>
      ),
    },
    ...(currentTab !== 'financer' ? [{
      field: "role",
      headerName: "role  ",
      flex: 1,

      minWidth: 150,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <div
          style={{
            whiteSpace: "normal",
            wordBreak: "break-word",
            lineHeight: 1.5,
            textTransform: "capitalize",
          }}
        >
          {params.row?.role || "NA"}
        </div>
      ),
    }] : []),
    {
      field: "sub_role",
      headerName: "User Type   ",
      flex: 1,

      minWidth: 150,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <div
          style={{
            whiteSpace: "normal",
            wordBreak: "break-word",
            lineHeight: 1.5,
            textTransform: "capitalize",
          }}
        >
          {params.row?.sub_role || "NA"}
        </div>
      ),
    },

    // {
    //   field: 'code',
    //   headerName: 'Role ',
    //   flex: 1,

    //   minWidth: 250,
    //   sortable: false,
    //   renderCell: (params: GridCellParams) => <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
    //     {params.row?.role || 'NA'}
    //   </div>
    // },
    // {
    //   field: 'sub_role',
    //   headerName: 'sub Role ',
    //   flex: 1,

    //   minWidth: 250,
    //   sortable: false,
    //   renderCell: (params: GridCellParams) => <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.5 }}>
    //     {params.row?.sub_role || 'NA'}
    //   </div>
    // },

    {
      field: "status",
      headerName: "Status",
      minWidth: 150,
      sortable: false,
      renderCell: (params: GridCellParams) => {
        const isActive =
          params.row.is_active === true ||
          params.row.is_active === 1 ||
          params.row.is_active === "1";
        return (
          <Stack direction="row" alignItems="center" spacing={5}>
            <p>{isActive ? "Active" : "Inactive"}</p>
            <Switch
              checked={isActive}
              onChange={(event) => handleSwitchChange(event, params.row)}
            />
          </Stack>
        );
      },
      flex: 1,
    },
    {
      field: "created_at",
      headerName: "Created Date",
      flex: 1,
      minWidth: 150,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <DateFormateComponent date={params.row?.created_at ?? ""} />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 150,
      sortable: false,
      flex: 1,
      renderCell: (params: GridCellParams) => (
        <>
          {/* <TooltipOnly title="View details of this Individual."> */}
          <Button
            style={{ color: "#84919d", margin: "-10px" }}
            onClick={() => handleViewUser(params.row.id)}
          >
            <Icon icon={"ph:eye"} fontSize={24} />
          </Button>
          {/* </TooltipOnly> */}
          {/* {checkPermission('update_brand') && ( */}

          <Tooltip title="Update User." placement="bottom">
            <Button
              sx={{ color: "#84919d", margin: "-10px" }}
              onClick={() => handleEditClick(params)}
            >
              <Icon icon={"circum:edit"} fontSize={24} />
            </Button>
          </Tooltip>
          {/* )} */}
          {/* {checkPermission('delete_brand') && (  */}

          <Tooltip title="Delete User." placement="bottom">
            <Button
              style={{ color: "#84919d", margin: "-10px" }}
              onClick={() => handleDeleteOpen(params)}
            >
              <Icon icon={"ic:outline-delete"} fontSize={24} color="#FC4E4E" />
            </Button>
          </Tooltip>
          {/* )} */}
        </>
      ),
    },
  ];
  const handleSearch = (query: string) => {
    setQuery(query);
    setPage(0);
  };

  const options = [
    { label: 'Buyer', value: 'buyer' },
    { label: 'Seller', value: 'seller' },
    { label: 'Financer', value: 'financer' },
  ]

  return (
    <>
      <Card sx={{ p: 5 }}>


        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          sx={{ mb: 3 }}
        >
          {/* Left Side: Back Button and Title */}
          <Box display="flex" alignItems="center" gap={2}>
            <GoBack label="Users" isBack={false} />
          </Box>

          {/* Right Side: Search and Add Button */}
          <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
            {/* <Grid item xs={12} sm="auto" sx={{ minWidth: 250 }}>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setPage(0);
                  setSearchQuery(e.target.value);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <GridSearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid> */}
            <Grid item xs={12} sm="auto">
              <SearchInput
                handleSearch={handleSearch}
                placeHolder="Search..."
              />
            </Grid>


            <Grid item xs={12} sm="auto">
              {/* <Button onClick={() => setOpenAdd(true)} variant="contained" startIcon={<AddCircleOutlineIcon />}>
                Add Brand
              </Button> */}
              {/* {checkPermission('add_brand') && ( */}
              {/* {checkPermission('add_brand') && ( */}
              <Button
                onClick={handleClickAdd}
                variant="contained"
                aria-controls={openMenu ? "basic-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={openMenu ? "true" : undefined}
              >
                Add User <AddCircleOutlineIcon sx={{ ml: 1 }} />
              </Button>
              <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={openMenu}
                onClose={handleCloseMenu}
                MenuListProps={{
                  "aria-labelledby": "basic-button",
                }}
              >
                <MenuItem onClick={() => handleSelectUserType("manufacturer")}>
                  Manufacturer
                </MenuItem>
                <MenuItem onClick={() => handleSelectUserType("trader")}>
                  Trader
                </MenuItem>
                <MenuItem onClick={() => handleSelectUserType("trader", "financer")}>
                  Financer
                </MenuItem>
              </Menu>

              {/* )} */}
            </Grid>
          </Box>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} md={10}>
            <Tabs
              value={currentTab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label={`All Users (${tabCounts.all})`} value="all" />
              <Tab label={`Manufacturers (${tabCounts.manufacturer})`} value="manufacturer" />
              <Tab label={`Traders (${tabCounts.trader})`} value="trader" />
              <Tab label={`Financers (${tabCounts.financer})`} value="financer" />
            </Tabs>
          </Grid>
          <Grid item xs={12} md={2}>
            <RHFAutoComplete2
              control={control}
              name="sub_role"
              options={options}
              placeholder="Select User Type"
              label="Select User Type"
              loading={false}
              mandatory={false}
            />
          </Grid>

        </Grid>


        <CommonDatagrid
          totalRows={totalRows}
          pageSize={pageSize}
          currentPage={page}
          handleChangePage={handlePageChange}
          handleChangeRowsPerPage={handlePageSizeChange}
          columns={columns}
          rows={rows}
          checkboxSelection={false}
          loading={loading}
        />
      </Card>
      {openAdd && (
        <AddUser
          open={openAdd}
          handleClose={() => setOpenAdd(false)}
          fetchData={() => {
            fetchGame();
            fetchTabCounts();
          }}
          userType={addUserConfig.role}
          userSubRole={addUserConfig.subRole}
        />
      )}
      {openDelete && (
        <DeleteDialogPopup
          show={openDelete}
          handleclose={() => setOpenDelete(false)}
          selectedItems={selectedItem?.id}
          fetchData={() => {
            fetchGame();
            fetchTabCounts();
          }}
          label={"Are you sure! You want to delete."}
          apiUrl={"api/v1/admin/users/delete/"}
        />
      )}
      {openEdit && (
        <AddUser
          open={openEdit}
          handleClose={() => setOpenEdit(false)}
          fetchData={() => {
            fetchGame();
            fetchTabCounts();
          }}
          selectedItem={selectedItem ?? undefined}
        />
      )}
    </>
  );
};

export default User;
