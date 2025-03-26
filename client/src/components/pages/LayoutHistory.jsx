import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Box
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import { SERVER_URL } from '../../Urls';

const LayoutHistory = () => {
  // State for history entries and filters
  const [historyEntries, setHistoryEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [titleFilter, setTitleFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [actionTypeFilter, setActionTypeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  // Fetch layout history from API based on filter changes
  useEffect(() => {
    const fetchLayoutHistory = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem('userId');
        const response = await fetch(`${SERVER_URL}/api/layout-history?userId=${userId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify({
            title: titleFilter,
            city: cityFilter,
            actionType: actionTypeFilter,
            dateFrom: dateFrom,
            dateTo: dateTo,
            status: statusFilter,
            // userId: userId,
          })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch layout history');
        }
        const data = await response.json();
        setHistoryEntries(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchLayoutHistory();
  }, [titleFilter, cityFilter, actionTypeFilter, dateFrom, dateTo, statusFilter]);

  // Create unique list of cities for filtering
  const uniqueCities = useMemo(() => {
    return [...new Set(historyEntries.map(entry => entry.metadata?.city).filter(Boolean))];
  }, [historyEntries]);

  const actionTypes = ['created', 'updated', 'deleted', 'viewed'];
  const layoutStatuses = ['pending', 'in-progress', 'completed', 'archived'];

  // Reset filters
  const resetFilters = () => {
    setTitleFilter('');
    setCityFilter('');
    setActionTypeFilter('');
    setDateFrom(null);
    setDateTo(null);
    setStatusFilter('');
  };

  if (loading) {
    return (
      <Card sx={{ maxWidth: 800, margin: 'auto', mt: 4 }}>
        <CardHeader title="Layout History" subheader="Loading history entries..." />
        <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
          <RefreshIcon sx={{ fontSize: 40, animation: 'spin 2s linear infinite' }} />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ maxWidth: 800, margin: 'auto', mt: 4 }}>
        <CardHeader title="Layout History" subheader="Error fetching history" />
        <CardContent>
          <Typography color="error">{error}</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Card sx={{ maxWidth: 1200, margin: 'auto', mt: 4 }}>
        <CardHeader
          title="Layout History"
          subheader={`${historyEntries.length} entries found`}
          action={
            <Button variant="outlined" startIcon={<FilterAltOffIcon />} onClick={resetFilters}>
              Reset Filters
            </Button>
          }
        />
        <CardContent>
          {/* Filters Section */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Filter by Title"
                variant="outlined"
                value={titleFilter}
                onChange={(e) => setTitleFilter(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="city-label">City</InputLabel>
                <Select
                  labelId="city-label"
                  label="City"
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {uniqueCities.map((city) => (
                    <MenuItem key={city} value={city}>
                      {city}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="action-type-label">Action Type</InputLabel>
                <Select
                  labelId="action-type-label"
                  label="Action Type"
                  value={actionTypeFilter}
                  onChange={(e) => setActionTypeFilter(e.target.value)}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {actionTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="From Date"
                value={dateFrom}
                onChange={(newValue) => setDateFrom(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="To Date"
                value={dateTo}
                onChange={(newValue) => setDateTo(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="status-label">Layout Status</InputLabel>
                <Select
                  labelId="status-label"
                  label="Layout Status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {layoutStatuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* History Table */}
          <Paper>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>City</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Edited</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {historyEntries.map((entry) => (
                  <TableRow key={entry._id}>
                    <TableCell>{new Date(entry.timestamp).toLocaleString()}</TableCell>
                    <TableCell>{entry.metadata?.title || 'Untitled'}</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          px: 1,
                          py: 0.5,
                          borderRadius: '12px',
                          backgroundColor:
                            entry.actionType === 'created'
                              ? 'success.light'
                              : entry.actionType === 'updated'
                              ? 'info.light'
                              : entry.actionType === 'deleted'
                              ? 'error.light'
                              : 'grey.300',
                          color:
                            entry.actionType === 'created'
                              ? 'success.dark'
                              : entry.actionType === 'updated'
                              ? 'info.dark'
                              : entry.actionType === 'deleted'
                              ? 'error.dark'
                              : 'grey.800',
                          fontWeight: 'bold',
                          fontSize: '0.8rem',
                          display: 'inline-block'
                        }}
                      >
                        {entry.actionType}
                      </Box>
                    </TableCell>
                    <TableCell>{entry.metadata?.city || 'N/A'}</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          px: 1,
                          py: 0.5,
                          borderRadius: '12px',
                          backgroundColor:
                            entry.metadata?.status === 'completed'
                              ? 'success.light'
                              : entry.metadata?.status === 'in-progress'
                              ? 'warning.light'
                              : entry.metadata?.status === 'pending'
                              ? 'info.light'
                              : 'grey.300',
                          color:
                            entry.metadata?.status === 'completed'
                              ? 'success.dark'
                              : entry.metadata?.status === 'in-progress'
                              ? 'warning.dark'
                              : entry.metadata?.status === 'pending'
                              ? 'info.dark'
                              : 'grey.800',
                          fontWeight: 'bold',
                          fontSize: '0.8rem',
                          display: 'inline-block'
                        }}
                      >
                        {entry.metadata?.status || 'N/A'}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {entry.metadata?.lastEditedTime
                        ? new Date(entry.metadata.lastEditedTime).toLocaleString()
                        : 'Never'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>

          {/* No entries message */}
          {historyEntries.length === 0 && (
            <Typography align="center" sx={{ mt: 2, color: 'text.secondary' }}>
              No history entries found. Try adjusting your filters.
            </Typography>
          )}
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
};

export default LayoutHistory;
