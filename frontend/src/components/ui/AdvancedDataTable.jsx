import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  IconButton,
  Chip,
  Avatar,
  Tooltip,
  Menu,
  Checkbox,
  Typography,
  useTheme,
  alpha,
  CircularProgress,
  Backdrop,
  Badge,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Search,
  FilterList,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Download,
  Upload,
  Refresh,
  ArrowUpward,
  ArrowDownward,
  Clear,
  FirstPage,
  LastPage,
  NavigateBefore,
  NavigateNext,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const AdvancedDataTable = ({ 
  data, 
  columns, 
  title, 
  loading = false, 
  onRowEdit, 
  onRowDelete, 
  onRowView,
  onBulkAction,
  enableSelection = true,
  enableSearch = true,
  enableFilter = true,
  enablePagination = true,
  rowsPerPageOptions = [10, 25, 50, 100],
}) => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');
  const [filters, setFilters] = useState({});
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [filterColumn, setFilterColumn] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);

  // Handle sorting
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Handle search
  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  // Handle filter
  const handleFilter = (column, value) => {
    setFilters(prev => ({
      ...prev,
      [column]: value,
    }));
    setPage(0);
    setFilterMenuAnchor(null);
  };

  const clearFilter = (column) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[column];
      return newFilters;
    });
    setPage(0);
  };

  // Handle row selection
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = new Set(currentData.map((row) => row.id));
      setSelectedRows(newSelected);
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleRowSelect = (id) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle row actions
  const handleRowMenuClick = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleRowMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleEdit = () => {
    if (onRowEdit && selectedRow) {
      onRowEdit(selectedRow);
    }
    handleRowMenuClose();
  };

  const handleView = () => {
    if (onRowView && selectedRow) {
      onRowView(selectedRow);
    }
    handleRowMenuClose();
  };

  const handleDelete = () => {
    if (selectedRow) {
      setRowToDelete(selectedRow);
      setDeleteDialogOpen(true);
    }
    handleRowMenuClose();
  };

  const confirmDelete = () => {
    if (onRowDelete && rowToDelete) {
      onRowDelete(rowToDelete);
    }
    setDeleteDialogOpen(false);
    setRowToDelete(null);
  };

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filteredData = [...data];

    // Apply search filter
    if (searchQuery) {
      filteredData = filteredData.filter((row) =>
        Object.values(row).some((value) =>
          value && value.toString().toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Apply column filters
    Object.entries(filters).forEach(([column, value]) => {
      if (value) {
        filteredData = filteredData.filter((row) =>
          row[column] && row[column].toString().toLowerCase() === value.toLowerCase()
        );
      }
    });

    // Apply sorting
    if (orderBy) {
      filteredData.sort((a, b) => {
        const aValue = a[orderBy];
        const bValue = b[orderBy];
        
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        const comparison = aValue.toString().localeCompare(bValue.toString());
        return order === 'asc' ? comparison : -comparison;
      });
    }

    return filteredData;
  }, [data, searchQuery, filters, orderBy, order]);

  // Paginate data
  const currentData = useMemo(() => {
    if (!enablePagination) return filteredAndSortedData;
    
    const startIndex = page * rowsPerPage;
    return filteredAndSortedData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredAndSortedData, page, rowsPerPage, enablePagination]);

  // Get unique values for filter options
  const getFilterOptions = (column) => {
    const uniqueValues = [...new Set(data.map((row) => row[column] || ''))]
      .filter((value) => value !== '')
      .sort();
    return uniqueValues;
  };

  const isSelected = (id) => selectedRows.has(id);
  const isAllSelected = currentData.length > 0 && selectedRows.size === currentData.length;
  const isIndeterminate = selectedRows.size > 0 && selectedRows.size < currentData.length;

  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
        border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
        borderRadius: 3,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 3,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
          bgcolor: alpha(theme.palette.background.default, 0.5),
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {enableSelection && selectedRows.size > 0 && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<Delete />}
                onClick={() => onBulkAction && onBulkAction(Array.from(selectedRows))}
                sx={{ borderRadius: 2 }}
              >
                Delete ({selectedRows.size})
              </Button>
            )}
            <Tooltip title="Refresh">
              <IconButton size="small" sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
                <Refresh />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export">
              <IconButton size="small" sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
                <Download />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Search and Filters */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {enableSearch && (
            <TextField
              size="small"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ fontSize: 18 }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery('')}>
                      <Clear />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                minWidth: 250,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          )}
          
          {enableFilter && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {columns
                .filter((col) => col.filterable !== false)
                .map((column) => (
                  <Box key={column.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={column.label}
                      size="small"
                      clickable
                      onClick={(e) => {
                        setFilterColumn(column);
                        setFilterMenuAnchor(e.currentTarget);
                      }}
                      color={filters[column.id] ? 'primary' : 'default'}
                      variant={filters[column.id] ? 'filled' : 'outlined'}
                      sx={{ borderRadius: 2 }}
                    />
                    {filters[column.id] && (
                      <IconButton size="small" onClick={() => clearFilter(column.id)}>
                        <Clear sx={{ fontSize: 16 }} />
                      </IconButton>
                    )}
                  </Box>
                ))}
            </Box>
          )}
        </Box>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} sx={{ elevation: 0 }}>
        <Table>
          <TableHead>
            <TableRow>
              {enableSelection && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={isIndeterminate}
                    checked={isAllSelected}
                    onChange={handleSelectAllClick}
                    sx={{ borderRadius: 2 }}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  sortDirection={orderBy === column.id ? order : false}
                  sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                  onClick={() => column.sortable !== false && handleRequestSort(column.id)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {column.label}
                    {column.sortable !== false && (
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <ArrowUpward
                          sx={{
                            fontSize: 12,
                            opacity: orderBy === column.id && order === 'asc' ? 1 : 0.3,
                          }}
                        />
                        <ArrowDownward
                          sx={{
                            fontSize: 12,
                            mt: -0.5,
                            opacity: orderBy === column.id && order === 'desc' ? 1 : 0.3,
                          }}
                        />
                      </Box>
                    )}
                  </Box>
                </TableCell>
              ))}
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <AnimatePresence>
              {currentData.map((row, index) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <TableRow
                    hover
                    sx={{
                      '&:hover': {
                        bgcolor: alpha(theme.palette.action.hover, 0.04),
                      },
                    }}
                  >
                    {enableSelection && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isSelected(row.id)}
                          onChange={() => handleRowSelect(row.id)}
                          sx={{ borderRadius: 2 }}
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell key={column.id}>
                        {column.render ? column.render(row[column.id], row) : row[column.id]}
                      </TableCell>
                    ))}
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleRowMenuClick(e, row)}
                        sx={{ borderRadius: 2 }}
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {enablePagination && (
        <Box sx={{ p: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
          <TablePagination
            rowsPerPageOptions={rowsPerPageOptions}
            component="div"
            count={filteredAndSortedData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Rows per page"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`}
            sx={{
              '& .MuiTablePagination-toolbar': {
                pl: 2,
                pr: 2,
              },
            }}
          />
        </Box>
      )}

      {/* Row Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleRowMenuClose}
        PaperProps={{
          sx: {
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            borderRadius: 2,
            minWidth: 200,
          },
        }}
      >
        {onRowView && (
          <MenuItem onClick={handleView}>
            <Visibility sx={{ mr: 2, fontSize: 18 }} />
            View
          </MenuItem>
        )}
        {onRowEdit && (
          <MenuItem onClick={handleEdit}>
            <Edit sx={{ mr: 2, fontSize: 18 }} />
            Edit
          </MenuItem>
        )}
        {onRowDelete && (
          <MenuItem onClick={handleDelete} sx={{ color: theme.palette.error.main }}>
            <Delete sx={{ mr: 2, fontSize: 18 }} />
            Delete
          </MenuItem>
        )}
      </Menu>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={() => setFilterMenuAnchor(null)}
        PaperProps={{
          sx: {
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            borderRadius: 2,
            minWidth: 200,
          },
        }}
      >
        {filterColumn && (
          <>
            <MenuItem onClick={() => clearFilter(filterColumn.id)}>
              <Clear sx={{ mr: 2, fontSize: 18 }} />
              Clear Filter
            </MenuItem>
            <Divider />
            {getFilterOptions(filterColumn.id).map((value) => (
              <MenuItem
                key={value}
                onClick={() => handleFilter(filterColumn.id, value)}
                selected={filters[filterColumn.id] === value}
              >
                {value}
              </MenuItem>
            ))}
          </>
        )}
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this item? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Loading Overlay */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.modal + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Card>
  );
};

// Example usage with student data
export const StudentTable = ({ students, loading, onEdit, onDelete, onView }) => {
  const columns = [
    {
      id: 'name',
      label: 'Name',
      sortable: true,
      filterable: true,
      render: (value, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
            {value.split(' ').map(n => n[0]).join('').toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
              {value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.email}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'grade',
      label: 'Grade',
      sortable: true,
      filterable: true,
      render: (value) => (
        <Chip
          label={value}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ borderRadius: 2 }}
        />
      ),
    },
    {
      id: 'section',
      label: 'Section',
      sortable: true,
      filterable: true,
      render: (value) => (
        <Chip
          label={value}
          size="small"
          color="secondary"
          variant="outlined"
          sx={{ borderRadius: 2 }}
        />
      ),
    },
    {
      id: 'attendance',
      label: 'Attendance',
      sortable: true,
      render: (value) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2">{value}%</Typography>
          <Box
            sx={{
              width: 100,
              height: 4,
              bgcolor: 'grey.200',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                width: `${value}%`,
                height: '100%',
                bgcolor: value >= 90 ? 'success.main' : value >= 70 ? 'warning.main' : 'error.main',
              }}
            />
          </Box>
        </Box>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      sortable: true,
      filterable: true,
      render: (value) => (
        <Chip
          label={value}
          size="small"
          color={value === 'Active' ? 'success' : value === 'Inactive' ? 'error' : 'warning'}
          sx={{ borderRadius: 2 }}
        />
      ),
    },
  ];

  return (
    <AdvancedDataTable
      data={students}
      columns={columns}
      title="Student Management"
      loading={loading}
      onRowEdit={onEdit}
      onRowDelete={onDelete}
      onRowView={onView}
      enableSelection
      enableSearch
      enableFilter
      enablePagination
    />
  );
};

export default AdvancedDataTable;
