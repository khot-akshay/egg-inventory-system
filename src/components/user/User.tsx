import {
  Box,
  Button,
  Card,
  Grid,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import { GridCellParams, GridColDef } from "@mui/x-data-grid";
import React, { useEffect, useState } from "react";
import CommonDatagrid from "src/components/common/DatagridData.tsx/CommonDatagrid";

import GoBack from "src/components/common/goBack/GoBackButton";
import axiosInstance from "src/services/axios";
import Icon from "src/@core/components/icon";
import DeleteDialogPopup from "src/components/common/DeletePopup/DeleteModalPopup";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

import DateFormateComponent from "src/components/common/dateFormat/DateFromatModule";
import SearchInput from "src/components/common/SearchInput";
import toast from "react-hot-toast";
import AddUser from "./AddUser";
import { useRouter } from "next/router";

interface UserRow {
  id: number;
  name: string;
  email: string;
  phone?: string;
  mobile_number?: string;
  is_active?: boolean;
  created_at?: string | null;
  shop?: { name: string };
  roles?: { name: string }[];
  [key: string]: any;
}

const User = () => {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);
  const [openAdd, setOpenAdd] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState<UserRow | null>(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [searchQuery, setQuery] = useState("");

  const router = useRouter();

  const fetchGame = async () => {
    setLoading(true);
    try {
      let url = `/api/v1/admin/getAllUsers?pageNo=${page}&limit=${pageSize}`;

      if (searchQuery) {
        url = `${url}&global_search=${searchQuery}`;
      }

      const response = await axiosInstance.get(url);
      setRows((response.data.data?.users ?? []) as UserRow[]);
      setTotalRows(response.data.data?.count ?? 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGame();
  }, [page, pageSize, searchQuery]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
  };

  const handleEditClick = (params: GridCellParams) => {
    setSelectedItem(params.row as UserRow);
    setOpenEdit(true);
  };

  const handleDeleteOpen = (params: GridCellParams) => {
    setSelectedItem(params.row as UserRow);
    setOpenDelete(true);
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
      toast.success(response.data.message || "Status updated successfully.");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to set active");
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
      minWidth: 80,
      sortable: false,
      renderCell: (index) => {
        const rowIndex = index.api.getRowIndex(index.row.id);
        return page * pageSize + (rowIndex % pageSize) + 1;
      },
      hideable: false,
    },
    {
      field: "name",
      headerName: "User Name",
      flex: 1,
      minWidth: 200,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            cursor: "pointer",
            alignItems: "center",
            height: "100%",
          }}
          onClick={() => handleViewUser(params.row.id)}
        >
          <Typography color="primary.main">
            {params.row?.name || "NA"}
          </Typography>
          <Icon
            icon="solar:arrow-right-up-linear"
            style={{ color: "primary", fontSize: 15 }}
          />
        </Box>
      ),
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      minWidth: 220,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <div style={{ whiteSpace: "normal", wordBreak: "break-word", lineHeight: 1.5 }}>
          {params.row?.email || "NA"}
        </div>
      ),
    },
    {
      field: "phone",
      headerName: "Phone Number",
      flex: 1,
      minWidth: 150,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <div style={{ whiteSpace: "normal", wordBreak: "break-word", lineHeight: 1.5 }}>
          {params.row?.phone || params.row?.mobile_number || "NA"}
        </div>
      ),
    },
    {
      field: "role",
      headerName: "Role",
      flex: 1,
      minWidth: 150,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <div style={{ whiteSpace: "normal", wordBreak: "break-word", lineHeight: 1.5, textTransform: "capitalize" }}>
          {params.row?.roles?.[0]?.name || params.row?.role || "NA"}
        </div>
      ),
    },
    {
      field: "shop",
      headerName: "Shop",
      flex: 1,
      minWidth: 150,
      sortable: false,
      renderCell: (params: GridCellParams) => (
        <div style={{ whiteSpace: "normal", wordBreak: "break-word", lineHeight: 1.5 }}>
          {params.row?.shop?.name || "NA"}
        </div>
      ),
    },
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
          <Button
            style={{ color: "#84919d", margin: "-10px" }}
            onClick={() => handleViewUser(params.row.id)}
          >
            <Icon icon={"ph:eye"} fontSize={24} />
          </Button>
          <Tooltip title="Update User." placement="bottom">
            <Button
              sx={{ color: "#84919d", margin: "-10px" }}
              onClick={() => handleEditClick(params)}
            >
              <Icon icon={"circum:edit"} fontSize={24} />
            </Button>
          </Tooltip>
          <Tooltip title="Delete User." placement="bottom">
            <Button
              style={{ color: "#84919d", margin: "-10px" }}
              onClick={() => handleDeleteOpen(params)}
            >
              <Icon icon={"ic:outline-delete"} fontSize={24} color="#FC4E4E" />
            </Button>
          </Tooltip>
        </>
      ),
    },
  ];

  const handleSearch = (query: string) => {
    setQuery(query);
    setPage(0);
  };

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
          <Box display="flex" alignItems="center" gap={2}>
            <GoBack label="Users" isBack={false} />
          </Box>

          <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
            <Grid item xs={12} sm="auto">
              <SearchInput
                handleSearch={handleSearch}
                placeHolder="Search..."
              />
            </Grid>

            <Grid item xs={12} sm="auto">
              <Button
                onClick={() => setOpenAdd(true)}
                variant="contained"
                startIcon={<AddCircleOutlineIcon />}
              >
                Add User
              </Button>
            </Grid>
          </Box>
        </Box>

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
          fetchData={fetchGame}
        />
      )}
      {openDelete && (
        <DeleteDialogPopup
          show={openDelete}
          handleclose={() => setOpenDelete(false)}
          selectedItems={selectedItem?.id}
          fetchData={fetchGame}
          label={"Are you sure you want to delete this user?"}
          apiUrl={"api/v1/admin/users/delete/"}
        />
      )}
      {openEdit && (
        <AddUser
          open={openEdit}
          handleClose={() => setOpenEdit(false)}
          fetchData={fetchGame}
          selectedItem={selectedItem ?? undefined}
        />
      )}
    </>
  );
};

export default User;
