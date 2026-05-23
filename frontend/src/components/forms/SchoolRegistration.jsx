import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Divider
} from '@mui/material';
import { School, Phone, Email, Person } from '@mui/icons-material';
import { apiFetch } from '../../services/api';

const grades = [
  'Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'
];

const schoolTypes = [
  { value: 'public', label: 'Public School' },
  { value: 'private', label: 'Private School' },
  { value: 'charter', label: 'Charter School' },
  { value: 'international', label: 'International School' }
];

const gradeMenuProps = {
  PaperProps: {
    sx: {
      maxHeight: 280,
      mt: 1,
      borderRadius: 3,
      background: 'rgba(15,23,42,0.98)',
      color: '#e5eef9',
      border: '1px solid rgba(255,255,255,0.08)',
      backdropFilter: 'blur(18px)',
      '& .MuiMenuItem-root': {
        fontSize: 14,
      },
      '& .MuiMenuItem-root.Mui-selected': {
        backgroundColor: 'rgba(56,189,248,0.18)',
      },
      '& .MuiMenuItem-root.Mui-selected:hover': {
        backgroundColor: 'rgba(56,189,248,0.24)',
      },
      '& .MuiMenuItem-root:hover': {
        backgroundColor: 'rgba(255,255,255,0.06)',
      },
    },
  },
};

export default function SchoolRegistration() {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [invitationCode, setInvitationCode] = useState('');
  
  const [formData, setFormData] = useState({
    // School Information
    school_name: '',
    school_address: '',
    school_city: '',
    school_state: '',
    school_country: '',
    school_postal_code: '',
    school_phone: '',
    school_email: '',
    school_website: '',
    school_type: '',
    student_capacity: '',
    grades_offered: [],
    
    // Admin Information
    admin_name: '',
    admin_email: '',
    admin_phone: '',
    notes: ''
  });

  const steps = [
    'School Information',
    'Admin Details',
    'Review & Submit'
  ];

  const handleInputChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  const handleGradesChange = (event) => {
    setFormData({
      ...formData,
      grades_offered: event.target.value
    });
  };

  const handleGradeDelete = (gradeToDelete) => {
    setFormData({
      ...formData,
      grades_offered: formData.grades_offered.filter((grade) => grade !== gradeToDelete)
    });
  };

  const validateStep = (step) => {
    switch (step) {
      case 0:
        return formData.school_name && 
               formData.school_address && 
               formData.school_city && 
               formData.school_state && 
               formData.school_country && 
               formData.school_phone && 
               formData.school_email && 
               formData.school_type && 
               formData.student_capacity &&
               formData.grades_offered.length > 0;
      case 1:
        return formData.admin_name && 
               formData.admin_email && 
               formData.admin_phone;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    } else {
      setError('Please fill in all required fields');
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const payload = {
        ...formData,
        student_capacity: parseInt(formData.student_capacity)
      };

      const url = invitationCode 
        ? `/saas/register-school?invitation_code=${invitationCode}`
        : '/saas/register-school';

      const response = await apiFetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSuccess(true);
        setActiveStep(3); // Success step
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      color: '#e5eef9',
      borderRadius: 3,
      background: 'rgba(255,255,255,0.03)',
      '& fieldset': { borderColor: 'rgba(255,255,255,0.10)' },
      '&:hover fieldset': { borderColor: 'rgba(56,189,248,0.35)' },
      '&.Mui-focused fieldset': { borderColor: '#38bdf8' },
    },
    '& .MuiOutlinedInput-input:-webkit-autofill': {
      WebkitBoxShadow: '0 0 0 100px rgba(255,255,255,0.03) inset',
      WebkitTextFillColor: '#e5eef9',
      caretColor: '#e5eef9',
      borderRadius: 'inherit',
      transition: 'background-color 9999s ease-out 0s',
    },
    '& .MuiOutlinedInput-input:-webkit-autofill:hover': {
      WebkitBoxShadow: '0 0 0 100px rgba(255,255,255,0.03) inset',
      WebkitTextFillColor: '#e5eef9',
    },
    '& .MuiOutlinedInput-input:-webkit-autofill:focus': {
      WebkitBoxShadow: '0 0 0 100px rgba(255,255,255,0.03) inset',
      WebkitTextFillColor: '#e5eef9',
    },
    '& .MuiInputLabel-root': { color: 'rgba(226,232,240,0.68)' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#7dd3fc' },
    '& .MuiFormHelperText-root': { color: 'rgba(226,232,240,0.52)' },
  };

  const sectionCardSx = {
    p: { xs: 2.5, md: 3 },
    borderRadius: 4,
    background: 'rgba(255,255,255,0.025)',
    border: '1px solid rgba(255,255,255,0.08)',
  };

  if (success) {
    return (
      <Box maxWidth="md" mx="auto">
        <Card
          sx={{
            borderRadius: 6,
            color: '#e5eef9',
            background: 'linear-gradient(160deg, rgba(8, 54, 56, 0.95), rgba(8, 54, 56, 0.95))',
            border: '1px solid rgba(56,189,248,0.18)',
            boxShadow: '0 28px 80px rgba(2,6,23,0.36)',
            backdropFilter: 'blur(18px)',
          }}
        >
          <CardContent sx={{ textAlign: 'center', py: 7, px: 4 }}>
            <School sx={{ fontSize: 64, color: '#38bdf8', mb: 2 }} />
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>
              Registration Submitted!
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(226,232,240,0.74)' }} paragraph>
              Your school registration request has been submitted successfully.
              Our team will review your application and get back to you within 2-3 business days.
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(226,232,240,0.58)' }}>
              You will receive an email with further instructions once your registration is approved.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box maxWidth="md" mx="auto">
      <Card
        sx={{
          borderRadius: 6,
          color: '#e5eef9',
          background: 'linear-gradient(160deg, rgba(8, 54, 56, 0.95), rgba(8, 54, 56, 0.95))',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 28px 80px rgba(2,6,23,0.36)',
          backdropFilter: 'blur(18px)',
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 800 }}>
            Register Your School
          </Typography>
          <Typography variant="body1" align="center" paragraph sx={{ color: 'rgba(226,232,240,0.70)', mb: 4 }}>
            Join our platform and transform your school management experience
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 3,
                background: 'rgba(127,29,29,0.28)',
                color: '#fecaca',
                border: '1px solid rgba(248,113,113,0.25)',
              }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          {/* Invitation Code Input */}
          <Box mb={3}>
            <TextField
              fullWidth
              label="Invitation Code (Optional)"
              value={invitationCode}
              onChange={(e) => setInvitationCode(e.target.value)}
              helperText="If you received an invitation, enter the code here"
              sx={fieldSx}
            />
          </Box>

          <Stepper
            activeStep={activeStep}
            sx={{
              mb: 4,
              '& .MuiStepLabel-label': { color: 'rgba(226,232,240,0.72)' },
              '& .MuiStepIcon-root': { color: 'rgba(255,255,255,0.18)' },
              '& .MuiStepIcon-root.Mui-active, & .MuiStepIcon-root.Mui-completed': { color: '#38bdf8' },
              '& .MuiStepConnector-line': { borderColor: 'rgba(255,255,255,0.12)' },
            }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Step 1: School Information */}
          {activeStep === 0 && (
            <Box sx={sectionCardSx}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                School Information
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="School Name"
                    value={formData.school_name}
                    onChange={handleInputChange('school_name')}
                    required
                    sx={fieldSx}
                    InputProps={{
                      startAdornment: <School sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="School Address"
                    value={formData.school_address}
                    onChange={handleInputChange('school_address')}
                    required
                    multiline
                    rows={2}
                    sx={fieldSx}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="City"
                    value={formData.school_city}
                    onChange={handleInputChange('school_city')}
                    required
                    sx={fieldSx}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="State/Province"
                    value={formData.school_state}
                    onChange={handleInputChange('school_state')}
                    required
                    sx={fieldSx}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Country"
                    value={formData.school_country}
                    onChange={handleInputChange('school_country')}
                    required
                    sx={fieldSx}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Postal Code"
                    value={formData.school_postal_code}
                    onChange={handleInputChange('school_postal_code')}
                    required
                    sx={fieldSx}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="School Phone"
                    value={formData.school_phone}
                    onChange={handleInputChange('school_phone')}
                    required
                    sx={fieldSx}
                    InputProps={{
                      startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="School Email"
                    type="email"
                    value={formData.school_email}
                    onChange={handleInputChange('school_email')}
                    required
                    sx={fieldSx}
                    InputProps={{
                      startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="School Website"
                    value={formData.school_website}
                    onChange={handleInputChange('school_website')}
                    placeholder="https://www.yourschool.com"
                    sx={fieldSx}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required sx={fieldSx}>
                    <InputLabel>School Type</InputLabel>
                    <Select
                      value={formData.school_type}
                      onChange={handleInputChange('school_type')}
                      label="School Type"
                    >
                      {schoolTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Student Capacity"
                    type="number"
                    value={formData.student_capacity}
                    onChange={handleInputChange('student_capacity')}
                    required
                    sx={fieldSx}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth required sx={fieldSx}>
                    <InputLabel>Grades Offered</InputLabel>
                    <Select
                      multiple
                      value={formData.grades_offered}
                      onChange={handleGradesChange}
                      label="Grades Offered"
                      MenuProps={gradeMenuProps}
                      sx={{
                        '& .MuiSelect-select': {
                          display: 'flex',
                          alignItems: 'flex-start',
                          flexWrap: 'wrap',
                          gap: 0.5,
                          maxHeight: 110,
                          overflowY: 'auto',
                          pr: 4,
                        },
                      }}
                      renderValue={(selected) => (
                        <Box
                          sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 0.5,
                            width: '100%',
                          }}
                        >
                          {selected.map((value) => (
                            <Chip
                              key={value}
                              label={value}
                              size="small"
                              onDelete={() => handleGradeDelete(value)}
                              onMouseDown={(event) => event.stopPropagation()}
                              sx={{
                                bgcolor: 'rgba(56,189,248,0.14)',
                                color: '#bae6fd',
                                border: '1px solid rgba(56,189,248,0.18)',
                                '& .MuiChip-deleteIcon': {
                                  color: '#bae6fd',
                                  '&:hover': {
                                    color: '#ffffff',
                                  },
                                },
                              }}
                            />
                          ))}
                        </Box>
                      )}
                    >
                      {grades.map((grade) => (
                        <MenuItem key={grade} value={grade}>
                          {grade}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Step 2: Admin Details */}
          {activeStep === 1 && (
            <Box sx={sectionCardSx}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                Administrator Information
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Administrator Full Name"
                    value={formData.admin_name}
                    onChange={handleInputChange('admin_name')}
                    required
                    sx={fieldSx}
                    InputProps={{
                      startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Administrator Email"
                    type="email"
                    value={formData.admin_email}
                    onChange={handleInputChange('admin_email')}
                    required
                    sx={fieldSx}
                    InputProps={{
                      startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Administrator Phone"
                    value={formData.admin_phone}
                    onChange={handleInputChange('admin_phone')}
                    required
                    sx={fieldSx}
                    InputProps={{
                      startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Additional Notes (Optional)"
                    value={formData.notes}
                    onChange={handleInputChange('notes')}
                    multiline
                    rows={3}
                    helperText="Any additional information you'd like to share"
                    sx={fieldSx}
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Step 3: Review */}
          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                Review Your Information
              </Typography>
              
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  mb: 3,
                  borderRadius: 4,
                  color: '#e5eef9',
                  background: 'rgba(255,255,255,0.025)',
                  borderColor: 'rgba(255,255,255,0.08)',
                }}
              >
                <Typography variant="subtitle1" gutterBottom>
                  <strong>School Details</strong>
                </Typography>
                <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.08)' }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: 'rgba(226,232,240,0.56)' }}>School Name:</Typography>
                    <Typography variant="body1">{formData.school_name}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: 'rgba(226,232,240,0.56)' }}>School Type:</Typography>
                    <Typography variant="body1">{formData.school_type}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ color: 'rgba(226,232,240,0.56)' }}>Address:</Typography>
                    <Typography variant="body1">{formData.school_address}</Typography>
                    <Typography variant="body1">
                      {formData.school_city}, {formData.school_state}, {formData.school_country} {formData.school_postal_code}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: 'rgba(226,232,240,0.56)' }}>Phone:</Typography>
                    <Typography variant="body1">{formData.school_phone}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: 'rgba(226,232,240,0.56)' }}>Email:</Typography>
                    <Typography variant="body1">{formData.school_email}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: 'rgba(226,232,240,0.56)' }}>Student Capacity:</Typography>
                    <Typography variant="body1">{formData.student_capacity}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ color: 'rgba(226,232,240,0.56)' }}>Grades Offered:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                      {formData.grades_offered.map((grade) => (
                        <Chip
                          key={grade}
                          label={grade}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(34,197,94,0.14)',
                            color: '#bbf7d0',
                            border: '1px solid rgba(34,197,94,0.18)',
                          }}
                        />
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
              
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  borderRadius: 4,
                  color: '#e5eef9',
                  background: 'rgba(255,255,255,0.025)',
                  borderColor: 'rgba(255,255,255,0.08)',
                }}
              >
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Administrator Details</strong>
                </Typography>
                <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.08)' }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: 'rgba(226,232,240,0.56)' }}>Name:</Typography>
                    <Typography variant="body1">{formData.admin_name}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ color: 'rgba(226,232,240,0.56)' }}>Email:</Typography>
                    <Typography variant="body1">{formData.admin_email}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ color: 'rgba(226,232,240,0.56)' }}>Phone:</Typography>
                    <Typography variant="body1">{formData.admin_phone}</Typography>
                  </Grid>
                  {formData.notes && (
                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ color: 'rgba(226,232,240,0.56)' }}>Notes:</Typography>
                      <Typography variant="body1">{formData.notes}</Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Box>
          )}

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{
                borderRadius: 999,
                px: 2.5,
                color: activeStep === 0 ? 'rgba(203,213,225,0.32)' : '#f8fafc',
                border: activeStep === 0 ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(56,189,248,0.36)',
                background: activeStep === 0 ? 'transparent' : 'rgba(56,189,248,0.10)',
                fontWeight: 700,
                '&:hover': {
                  background: activeStep === 0 ? 'transparent' : 'rgba(56,189,248,0.18)',
                  borderColor: activeStep === 0 ? 'rgba(255,255,255,0.08)' : 'rgba(56,189,248,0.5)',
                },
              }}
            >
              Back
            </Button>
            
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  sx={{
                    borderRadius: 999,
                    px: 3,
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #38bdf8, #22c55e)',
                    color: '#03111f',
                  }}
                >
                  {loading ? 'Submitting...' : 'Submit Registration'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{
                    borderRadius: 999,
                    px: 3,
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #38bdf8, #22c55e)',
                    color: '#03111f',
                  }}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
