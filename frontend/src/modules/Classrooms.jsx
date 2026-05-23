import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  Alert,
  Fab,
  Tooltip
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  School,
  People,
  LocationOn,
  Business
} from '@mui/icons-material';
import { apiFetch } from '../services/api';
import { ProtectedRoute, IfCanWrite, IfCanRead } from '../components/guards/ProtectedRoute';
import { MODULES } from '../components/guards/ProtectedRoute';

export default function Classrooms() {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    section: '',
    capacity: 30,
    room_number: '',
    floor: '',
    building: '',
    description: '',
    status: 'active'
  });

  useEffect(() => {
    loadClassrooms();
  }, []);

  const loadClassrooms = async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/api/classrooms/');
      if (response.ok) {
        const data = await response.json();
        setClassrooms(data);
      } else {
        setError('Failed to load classrooms');
      }
    } catch (err) {
      setError('Error loading classrooms');
      console.error('Error loading classrooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingClassroom(null);
    setFormData({
      name: '',
      grade: '',
      section: '',
      capacity: 30,
      room_number: '',
      floor: '',
      building: '',
      description: '',
      status: 'active'
    });
    setOpenDialog(true);
  };

  const handleEdit = (classroom) => {
    setEditingClassroom(classroom);
    setFormData({
      name: classroom.name,
      grade: classroom.grade,
      section: classroom.section,
      capacity: classroom.capacity,
      room_number: classroom.room_number,
      floor: classroom.floor,
      building: classroom.building,
      description: classroom.description || '',
      status: classroom.status
    });
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      const url = editingClassroom 
        ? `/api/classrooms/${editingClassroom.id}`
        : '/api/classrooms/';
      
      const method = editingClassroom ? 'PUT' : 'POST';
      
      const response = await apiFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setOpenDialog(false);
        loadClassrooms();
      } else {
        const error = await response.json();
        setError(error.detail || 'Failed to save classroom');
      }
    } catch (err) {
      setError('Error saving classroom');
      console.error('Error saving classroom:', err);
    }
  };

  const handleDelete = async (classroomId) => {
    if (window.confirm('Are you sure you want to delete this classroom?')) {
      try {
        const response = await apiFetch(`/api/classrooms/${classroomId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          loadClassrooms();
        } else {
          setError('Failed to delete classroom');
        }
      } catch (err) {
        setError('Error deleting classroom');
        console.error('Error deleting classroom:', err);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'maintenance':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography>Loading classrooms...</Typography>
      </Box>
    );
  }

  return (
    <ProtectedRoute requiredModule={MODULES.CLASSROOMS} requiredPermission="read">
      <Box>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Classrooms
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage classroom information and capacity
            </Typography>
          </Box>
          
          <IfCanWrite module={MODULES.CLASSROOMS}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreate}
            >
              Add Classroom
            </Button>
          </IfCanWrite>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <School color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h4">{classrooms.length}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Classrooms
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <People color="success" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h4">
                      {classrooms.reduce((sum, room) => sum + room.capacity, 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Capacity
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <LocationOn color="warning" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h4">
                      {new Set(classrooms.map(room => room.building)).size}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Buildings
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Business color="info" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h4">
                      {classrooms.filter(room => room.status === 'active').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Classrooms Table */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Classroom List
            </Typography>
            
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Grade</TableCell>
                    <TableCell>Section</TableCell>
                    <TableCell>Room</TableCell>
                    <TableCell>Building</TableCell>
                    <TableCell>Capacity</TableCell>
                    <TableCell>Status</TableCell>
                    <IfCanWrite module={MODULES.CLASSROOMS}>
                      <TableCell align="right">Actions</TableCell>
                    </IfCanWrite>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {classrooms.map((classroom) => (
                    <TableRow key={classroom.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {classroom.name}
                        </Typography>
                      </TableCell>
                      <TableCell>{classroom.grade}</TableCell>
                      <TableCell>{classroom.section}</TableCell>
                      <TableCell>{classroom.room_number}</TableCell>
                      <TableCell>{classroom.building}</TableCell>
                      <TableCell>{classroom.capacity}</TableCell>
                      <TableCell>
                        <Chip
                          label={classroom.status}
                          color={getStatusColor(classroom.status)}
                          size="small"
                        />
                      </TableCell>
                      <IfCanWrite module={MODULES.CLASSROOMS}>
                        <TableCell align="right">
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(classroom)}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(classroom.id)}
                              color="error"
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </IfCanWrite>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingClassroom ? 'Edit Classroom' : 'Create Classroom'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Classroom Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Grade"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Section"
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Room Number"
                    value={formData.room_number}
                    onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Floor"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Building"
                    value={formData.building}
                    onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    margin="normal"
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="maintenance">Maintenance</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    margin="normal"
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} variant="contained">
              {editingClassroom ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ProtectedRoute>
  );
}
