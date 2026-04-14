"use client";

import React, { useEffect, useState } from "react";
import {
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableContainer,
    Paper,
    CircularProgress,
    Alert,
    Box,
    Typography,
    Grid,
    Card,
    IconButton
} from "@mui/material";
import { useRouter } from "next/router";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { get } from "src/services/apiCall";
import GoBack from "src/components/common/goBack/GoBackButton";

export default function AuditDetailsPage() {
    const router = useRouter();
    const { id } = router.query;

    const [logData, setLogData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Helper function to make labels readable
    const removeUnderScore = (str: string) => str.replace(/_/g, " ").toUpperCase();

    // Fetch Audit by ID
    const fetchAuditLog = async () => {
        try {
            setLoading(true);
            const response = await get(`/api/v1/admin/getAuditById/${id}`);
            if (response.success) {
                setLogData(response.data.data);
            } else {
                setError(response.message || "Failed to fetch audit log details");
            }
        } catch (err) {
            setError("Failed to fetch audit log details");
            console.error("Error fetching audit log:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchAuditLog();
        }
    }, [id]);

    return (
        <Box >
            <Grid container spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
                <Grid item xs={12}>
                    <GoBack label="Log Details" isBack={true} />
                </Grid>
            </Grid>

            {/* Loading */}
            {loading && (
                <Box sx={{ textAlign: "center", mt: 5 }}>
                    <CircularProgress />
                </Box>
            )}

            {/* Error */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Table */}
            {!loading && logData && (
                <Card sx={{ p: 4 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                        Log Information
                    </Typography>
                    <Grid container spacing={4} sx={{ mb: 4 }}>
                        <Grid item xs={12} md={4}>
                            <Typography variant="body2" color="textSecondary">User</Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {logData?.user?.name || "NA"}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="body2" color="textSecondary">Event</Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                                {logData?.event || "NA"}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="body2" color="textSecondary">Module</Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                                {logData?.auditable_type || "NA"}
                            </Typography>
                        </Grid>
                    </Grid>

                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        Changes
                    </Typography>
                    <Paper variant="outlined">
                        <TableContainer>
                            <Table sx={{ minWidth: "100%" }} aria-label="audit table">
                                <TableHead sx={{ backgroundColor: 'action.hover' }}>
                                    <TableRow>
                                        <TableCell><b>Field</b></TableCell>
                                        <TableCell><b>Old Value</b></TableCell>
                                        <TableCell><b>New Value</b></TableCell>
                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {logData?.new_values &&
                                        Object.keys(logData?.new_values).map((key) => (
                                            <TableRow key={key}>
                                                <TableCell sx={{ fontWeight: 500 }}>
                                                    {removeUnderScore(key)}
                                                </TableCell>

                                                <TableCell>
                                                    {logData?.old_values?.[key] !== null && logData?.old_values?.[key] !== undefined
                                                        ? String(logData?.old_values?.[key])
                                                        : "NA"}
                                                </TableCell>

                                                <TableCell>
                                                    {logData?.new_values?.[key] !== null && logData?.new_values?.[key] !== undefined
                                                        ? String(logData?.new_values?.[key])
                                                        : "NA"}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Card>
            )}
        </Box>
    );
}
