import React, { useState, useEffect } from 'react';
import {
  Box,
  Modal,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  RadioGroup,
  Radio,
  FormControlLabel,
  Switch,
  Slider,
  DatePicker,
  TimePicker,
  Avatar,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Chip,
  Divider,
  Alert,
  Snackbar,
  useTheme,
  alpha,
  InputAdornment,
  FormHelperText,
  CircularProgress,
  Backdrop,
} from '@mui/material';
import {
  Close,
  Save,
  Cancel,
  Add,
  Remove,
  Upload,
  Email,
  Phone,
  Person,
  School,
  CalendarToday,
  AccessTime,
  Visibility,
  VisibilityOff,
  CheckCircle,
  Error,
  Info,
  Warning,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const ProfessionalForms = () => {
  const theme = useTheme();
  const [openModal, setOpenModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formLoading, setFormLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: null,
    gender: '',
    
    // Academic Information
    studentId: '',
    grade: '',
    section: '',
    rollNumber: '',
    admissionDate: null,
    
    // Parent Information
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    parentOccupation: '',
    
    // Address Information
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    
    // Additional Information
    bloodGroup: '',
    allergies: '',
    medicalConditions: '',
    emergencyContact: '',
    relationship: '',
    
    // Settings
    notifications: true,
    smsAlerts: false,
    emailUpdates: true,
    
    // Documents
    profilePicture: null,
    birthCertificate: null,
    medicalRecords: null,
  });

  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState(new Set());

  const steps = [
    {
      label: 'Personal Information',
      description: 'Basic student details and contact information',
    },
    {
      label: 'Academic Details',
      description: 'Grade, section, and enrollment information',
    },
    {
      label: 'Parent Information',
      description: 'Parent/Guardian contact details',
    },
    {
      label: 'Address & Medical',
      description: 'Residential address and medical information',
    },
    {
      label: 'Documents & Settings',
      description: 'Upload documents and configure preferences',
    },
  ];

  const validateField = (fieldName, value) => {
    const errors = { ...formErrors };
    
    switch (fieldName) {
      case 'firstName':
      case 'lastName':
        if (!value || value.trim() === '') {
          errors[fieldName] = 'This field is required';
        } else if (value.length < 2) {
          errors[fieldName] = 'Must be at least 2 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          errors[fieldName] = 'Only letters and spaces allowed';
        } else {
          delete errors[fieldName];
        }
        break;
        
      case 'email':
        if (!value) {
          errors[fieldName] = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors[fieldName] = 'Invalid email format';
        } else {
          delete errors[fieldName];
        }
        break;
        
      case 'phone':
        if (!value) {
          errors[fieldName] = 'Phone number is required';
        } else if (!/^\+?[\d\s\-\(\)]+$/.test(value)) {
          errors[fieldName] = 'Invalid phone number format';
        } else if (value.replace(/\D/g, '').length < 10) {
          errors[fieldName] = 'Phone number must be at least 10 digits';
        } else {
          delete errors[fieldName];
        }
        break;
        
      case 'studentId':
        if (!value) {
          errors[fieldName] = 'Student ID is required';
        } else if (!/^[A-Z0-9]+$/.test(value)) {
          errors[fieldName] = 'Only uppercase letters and numbers allowed';
        } else {
          delete errors[fieldName];
        }
        break;
        
      case 'grade':
        if (!value) {
          errors[fieldName] = 'Grade is required';
        } else {
          delete errors[fieldName];
        }
        break;
        
      case 'parentEmail':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors[fieldName] = 'Invalid email format';
        } else {
          delete errors[fieldName];
        }
        break;
        
      default:
        break;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFieldChange = (fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    if (touchedFields.has(fieldName)) {
      validateField(fieldName, value);
    }
  };

  const handleFieldBlur = (fieldName) => {
    setTouchedFields(prev => new Set(prev).add(fieldName));
    validateField(fieldName, formData[fieldName]);
  };

  const validateCurrentStep = () => {
    let isValid = true;
    
    switch (currentStep) {
      case 0: // Personal Information
        const personalFields = ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'gender'];
        personalFields.forEach(field => {
          if (!validateField(field, formData[field])) {
            isValid = false;
          }
        });
        break;
        
      case 1: // Academic Details
        const academicFields = ['studentId', 'grade', 'section', 'rollNumber', 'admissionDate'];
        academicFields.forEach(field => {
          if (!validateField(field, formData[field])) {
            isValid = false;
          }
        });
        break;
        
      case 2: // Parent Information
        const parentFields = ['parentName', 'parentPhone', 'emergencyContact', 'relationship'];
        parentFields.forEach(field => {
          if (!validateField(field, formData[field])) {
            isValid = false;
          }
        });
        break;
        
      case 3: // Address & Medical
        const addressFields = ['address', 'city', 'state', 'postalCode'];
        addressFields.forEach(field => {
          if (!validateField(field, formData[field])) {
            isValid = false;
          }
        });
        break;
        
      default:
        break;
    }
    
    return isValid;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    } else {
      setSnackbar({
        open: true,
        message: 'Please fix the errors before proceeding',
        severity: 'error',
      });
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      setSnackbar({
        open: true,
        message: 'Please fix the errors before submitting',
        severity: 'error',
      });
      return;
    }
    
    setFormLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSnackbar({
        open: true,
        message: 'Student registered successfully!',
        severity: 'success',
      });
      
      // Reset form
      setFormData({});
      setTouchedFields(new Set());
      setFormErrors({});
      setCurrentStep(0);
      setOpenModal(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error registering student. Please try again.',
        severity: 'error',
      });
    } finally {
      setFormLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0: // Personal Information
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName || ''}
                onChange={(e) => handleFieldChange('firstName', e.target.value)}
                onBlur={() => handleFieldBlur('firstName')}
                error={touchedFields.has('firstName') && !!formErrors.firstName}
                helperText={touchedFields.has('firstName') && formErrors.firstName}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName || ''}
                onChange={(e) => handleFieldChange('lastName', e.target.value)}
                onBlur={() => handleFieldBlur('lastName')}
                error={touchedFields.has('lastName') && !!formErrors.lastName}
                helperText={touchedFields.has('lastName') && formErrors.lastName}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                onBlur={() => handleFieldBlur('email')}
                error={touchedFields.has('email') && !!formErrors.email}
                helperText={touchedFields.has('email') && formErrors.email}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phone || ''}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                onBlur={() => handleFieldBlur('phone')}
                error={touchedFields.has('phone') && !!formErrors.phone}
                helperText={touchedFields.has('phone') && formErrors.phone}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date of Birth"
                  value={formData.dateOfBirth}
                  onChange={(newValue) => handleFieldChange('dateOfBirth', newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      required
                      error={touchedFields.has('dateOfBirth') && !formData.dateOfBirth}
                      helperText={touchedFields.has('dateOfBirth') && !formData.dateOfBirth ? 'Date of birth is required' : ''}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        },
                      }}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={touchedFields.has('gender') && !formData.gender}>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={formData.gender || ''}
                  onChange={(e) => handleFieldChange('gender', e.target.value)}
                  onBlur={() => handleFieldBlur('gender')}
                  label="Gender"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
                {touchedFields.has('gender') && !formData.gender && (
                  <FormHelperText>Gender is required</FormHelperText>
                )}
              </FormControl>
            </Grid>
          </Grid>
        );
        
      case 1: // Academic Details
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Student ID"
                value={formData.studentId || ''}
                onChange={(e) => handleFieldChange('studentId', e.target.value)}
                onBlur={() => handleFieldBlur('studentId')}
                error={touchedFields.has('studentId') && !!formErrors.studentId}
                helperText={touchedFields.has('studentId') && formErrors.studentId}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <School />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={touchedFields.has('grade') && !formData.grade}>
                <InputLabel>Grade</InputLabel>
                <Select
                  value={formData.grade || ''}
                  onChange={(e) => handleFieldChange('grade', e.target.value)}
                  onBlur={() => handleFieldBlur('grade')}
                  label="Grade"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="1">Grade 1</MenuItem>
                  <MenuItem value="2">Grade 2</MenuItem>
                  <MenuItem value="3">Grade 3</MenuItem>
                  <MenuItem value="4">Grade 4</MenuItem>
                  <MenuItem value="5">Grade 5</MenuItem>
                  <MenuItem value="6">Grade 6</MenuItem>
                  <MenuItem value="7">Grade 7</MenuItem>
                  <MenuItem value="8">Grade 8</MenuItem>
                  <MenuItem value="9">Grade 9</MenuItem>
                  <MenuItem value="10">Grade 10</MenuItem>
                  <MenuItem value="11">Grade 11</MenuItem>
                  <MenuItem value="12">Grade 12</MenuItem>
                </Select>
                {touchedFields.has('grade') && !formData.grade && (
                  <FormHelperText>Grade is required</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={touchedFields.has('section') && !formData.section}>
                <InputLabel>Section</InputLabel>
                <Select
                  value={formData.section || ''}
                  onChange={(e) => handleFieldChange('section', e.target.value)}
                  onBlur={() => handleFieldBlur('section')}
                  label="Section"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="A">Section A</MenuItem>
                  <MenuItem value="B">Section B</MenuItem>
                  <MenuItem value="C">Section C</MenuItem>
                  <MenuItem value="D">Section D</MenuItem>
                </Select>
                {touchedFields.has('section') && !formData.section && (
                  <FormHelperText>Section is required</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Roll Number"
                value={formData.rollNumber || ''}
                onChange={(e) => handleFieldChange('rollNumber', e.target.value)}
                onBlur={() => handleFieldBlur('rollNumber')}
                error={touchedFields.has('rollNumber') && !!formErrors.rollNumber}
                helperText={touchedFields.has('rollNumber') && formErrors.rollNumber}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Admission Date"
                  value={formData.admissionDate}
                  onChange={(newValue) => handleFieldChange('admissionDate', newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      required
                      error={touchedFields.has('admissionDate') && !formData.admissionDate}
                      helperText={touchedFields.has('admissionDate') && !formData.admissionDate ? 'Admission date is required' : ''}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        },
                      }}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        );
        
      case 2: // Parent Information
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Parent/Guardian Name"
                value={formData.parentName || ''}
                onChange={(e) => handleFieldChange('parentName', e.target.value)}
                onBlur={() => handleFieldBlur('parentName')}
                error={touchedFields.has('parentName') && !!formErrors.parentName}
                helperText={touchedFields.has('parentName') && formErrors.parentName}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Parent Email"
                type="email"
                value={formData.parentEmail || ''}
                onChange={(e) => handleFieldChange('parentEmail', e.target.value)}
                onBlur={() => handleFieldBlur('parentEmail')}
                error={touchedFields.has('parentEmail') && !!formErrors.parentEmail}
                helperText={touchedFields.has('parentEmail') && formErrors.parentEmail}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Parent Phone"
                value={formData.parentPhone || ''}
                onChange={(e) => handleFieldChange('parentPhone', e.target.value)}
                onBlur={() => handleFieldBlur('parentPhone')}
                error={touchedFields.has('parentPhone') && !!formErrors.parentPhone}
                helperText={touchedFields.has('parentPhone') && formErrors.parentPhone}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Occupation"
                value={formData.parentOccupation || ''}
                onChange={(e) => handleFieldChange('parentOccupation', e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Emergency Contact"
                value={formData.emergencyContact || ''}
                onChange={(e) => handleFieldChange('emergencyContact', e.target.value)}
                onBlur={() => handleFieldBlur('emergencyContact')}
                error={touchedFields.has('emergencyContact') && !!formErrors.emergencyContact}
                helperText={touchedFields.has('emergencyContact') && formErrors.emergencyContact}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required error={touchedFields.has('relationship') && !formData.relationship}>
                <InputLabel>Relationship</InputLabel>
                <Select
                  value={formData.relationship || ''}
                  onChange={(e) => handleFieldChange('relationship', e.target.value)}
                  onBlur={() => handleFieldBlur('relationship')}
                  label="Relationship"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="father">Father</MenuItem>
                  <MenuItem value="mother">Mother</MenuItem>
                  <MenuItem value="guardian">Guardian</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
                {touchedFields.has('relationship') && !formData.relationship && (
                  <FormHelperText>Relationship is required</FormHelperText>
                )}
              </FormControl>
            </Grid>
          </Grid>
        );
        
      case 3: // Address & Medical
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                value={formData.address || ''}
                onChange={(e) => handleFieldChange('address', e.target.value)}
                onBlur={() => handleFieldBlur('address')}
                error={touchedFields.has('address') && !!formErrors.address}
                helperText={touchedFields.has('address') && formErrors.address}
                required
                multiline
                rows={2}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={formData.city || ''}
                onChange={(e) => handleFieldChange('city', e.target.value)}
                onBlur={() => handleFieldBlur('city')}
                error={touchedFields.has('city') && !!formErrors.city}
                helperText={touchedFields.has('city') && formErrors.city}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State"
                value={formData.state || ''}
                onChange={(e) => handleFieldChange('state', e.target.value)}
                onBlur={() => handleFieldBlur('state')}
                error={touchedFields.has('state') && !!formErrors.state}
                helperText={touchedFields.has('state') && formErrors.state}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Postal Code"
                value={formData.postalCode || ''}
                onChange={(e) => handleFieldChange('postalCode', e.target.value)}
                onBlur={() => handleFieldBlur('postalCode')}
                error={touchedFields.has('postalCode') && !!formErrors.postalCode}
                helperText={touchedFields.has('postalCode') && formErrors.postalCode}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Country</InputLabel>
                <Select
                  value={formData.country || ''}
                  onChange={(e) => handleFieldChange('country', e.target.value)}
                  label="Country"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="US">United States</MenuItem>
                  <MenuItem value="UK">United Kingdom</MenuItem>
                  <MenuItem value="CA">Canada</MenuItem>
                  <MenuItem value="AU">Australia</MenuItem>
                  <MenuItem value="IN">India</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Blood Group</InputLabel>
                <Select
                  value={formData.bloodGroup || ''}
                  onChange={(e) => handleFieldChange('bloodGroup', e.target.value)}
                  label="Blood Group"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="A+">A+</MenuItem>
                  <MenuItem value="A-">A-</MenuItem>
                  <MenuItem value="B+">B+</MenuItem>
                  <MenuItem value="B-">B-</MenuItem>
                  <MenuItem value="AB+">AB+</MenuItem>
                  <MenuItem value="AB-">AB-</MenuItem>
                  <MenuItem value="O+">O+</MenuItem>
                  <MenuItem value="O-">O-</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Allergies"
                value={formData.allergies || ''}
                onChange={(e) => handleFieldChange('allergies', e.target.value)}
                placeholder="Enter any known allergies"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Medical Conditions"
                value={formData.medicalConditions || ''}
                onChange={(e) => handleFieldChange('medicalConditions', e.target.value)}
                placeholder="Enter any medical conditions"
                multiline
                rows={3}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>
          </Grid>
        );
        
      case 4: // Documents & Settings
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Upload Documents
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Paper
                  sx={{
                    p: 3,
                    border: `2px dashed ${alpha(theme.palette.primary.main, 0.5)}`,
                    borderRadius: 2,
                    textAlign: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                    },
                  }}
                  onClick={() => {}}
                >
                  <Upload sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Profile Picture
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Click to upload or drag and drop
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    PNG, JPG, GIF up to 10MB
                  </Typography>
                </Paper>
                
                <Paper
                  sx={{
                    p: 3,
                    border: `2px dashed ${alpha(theme.palette.secondary.main, 0.5)}`,
                    borderRadius: 2,
                    textAlign: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.secondary.main, 0.05),
                    },
                  }}
                  onClick={() => {}}
                >
                  <Upload sx={{ fontSize: 48, color: theme.palette.secondary.main, mb: 2 }} />
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Birth Certificate
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Click to upload or drag and drop
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    PDF, PNG, JPG up to 5MB
                  </Typography>
                </Paper>
                
                <Paper
                  sx={{
                    p: 3,
                    border: `2px dashed ${alpha(theme.palette.info.main, 0.5)}`,
                    borderRadius: 2,
                    textAlign: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.info.main, 0.05),
                    },
                  }}
                  onClick={() => {}}
                >
                  <Upload sx={{ fontSize: 48, color: theme.palette.info.main, mb: 2 }} />
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Medical Records
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Click to upload or drag and drop
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    PDF up to 10MB
                  </Typography>
                </Paper>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Notification Preferences
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.notifications}
                      onChange={(e) => handleFieldChange('notifications', e.target.checked)}
                    />
                  }
                  label="Enable email notifications"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.smsAlerts}
                      onChange={(e) => handleFieldChange('smsAlerts', e.target.checked)}
                    />
                  }
                  label="Enable SMS alerts"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.emailUpdates}
                      onChange={(e) => handleFieldChange('emailUpdates', e.target.checked)}
                    />
                  }
                  label="Receive weekly updates"
                />
              </Box>
            </Grid>
          </Grid>
        );
        
      default:
        return null;
    }
  };

  return (
    <Box>
      {/* Button to open modal */}
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={() => setOpenModal(true)}
        sx={{
          borderRadius: 2,
          px: 3,
          py: 1.5,
        }}
      >
        Register New Student
      </Button>

      {/* Modal */}
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        aria-labelledby="student-registration-modal"
        aria-describedby="student-registration-form"
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '95%', sm: '90%', md: '80%', lg: '70%' },
              maxHeight: '90vh',
              overflow: 'auto',
              bgcolor: theme.palette.background.paper,
              borderRadius: 3,
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                p: 3,
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                bgcolor: alpha(theme.palette.primary.main, 0.02),
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                Student Registration
              </Typography>
              <IconButton onClick={() => setOpenModal(false)}>
                <Close />
              </IconButton>
            </Box>

            {/* Stepper */}
            <Box sx={{ p: 3 }}>
              <Stepper activeStep={currentStep} orientation="vertical">
                {steps.map((step, index) => (
                  <Step key={step.label}>
                    <StepLabel>{step.label}</StepLabel>
                    <StepContent>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        {step.description}
                      </Typography>
                      {renderStepContent(index)}
                      <Box sx={{ mb: 2, display: 'flex', gap: 2, mt: 3 }}>
                        <Button
                          disabled={index === 0}
                          onClick={handleBack}
                          variant="outlined"
                          sx={{ borderRadius: 2 }}
                        >
                          Back
                        </Button>
                        <Button
                          variant="contained"
                          onClick={index === steps.length - 1 ? handleSubmit : handleNext}
                          disabled={formLoading}
                          startIcon={formLoading ? <CircularProgress size={16} /> : null}
                          sx={{ borderRadius: 2 }}
                        >
                          {index === steps.length - 1 ? 'Submit' : 'Next'}
                        </Button>
                      </Box>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </Box>
          </Box>
        </motion.div>
      </Modal>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Loading Backdrop */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.modal + 1 }}
        open={formLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
};

export default ProfessionalForms;
