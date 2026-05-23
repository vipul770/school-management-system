import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Tabs,
  Tab,
  Grid,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import {
  School,
  Email,
  Send,
  CheckCircle,
  Cancel,
  MoreVert,
  PersonAdd,
  Visibility
} from '@mui/icons-material';
import { apiFetch } from '../services/api';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`saas-tabpanel-${index}`}
      aria-labelledby={`saas-tab-${index}`}
      {...other}
    }
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function SaaSManagement() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const [activeTab, setActiveTab] = useState(0);
  const [registrations, setRegistrations] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Dialog states
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  
  // Form data
  const [inviteForm, setInviteForm] = useState({
    email: '',
    school_name_hint: '',
    message: ''
  });
  
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [tempPassword, setTempPassword] = useState('school123');

  useEffect(() => {
    loadRegistrations();
    loadInvitations();
  }, []);

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/saas/registration-requests?status=pending', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (response.ok) {
        const data = await response.json();
        setRegistrations(data);
      } else {
        setError('Failed to load registrations');
      }
    } catch (err) {
      setError('Error loading registrations');
    } finally {
      setLoading(false);
    }
  };

  const loadInvitations = async () => {
    try {
      const response = await apiFetch('/saas/invitations', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (response.ok) {
        const data = await response.json();
        setInvitations(data);
      }
    } catch (err) {
      console.error('Error loading invitations:', err);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleInvite = async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/saas/invite-school', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(inviteForm),
      });

      if (response.ok) {
        setSuccess('Invitation sent successfully!');
        setInviteDialogOpen(false);
        setInviteForm({ email: '', school_name_hint: '', message: '' });
        loadInvitations();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to send invitation');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setLoading(true);
      const response = await apiFetch(`/saas/approve-registration/${selectedRegistration.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ temp_password: tempPassword }),
      });

      if (response.ok) {
        setSuccess('School registration approved successfully!');
        setApprovalDialogOpen(false);
        setRegistrations((prev) => prev.filter((registration) => registration.id !== selectedRegistration.id));
        await loadRegistrations();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to approve registration');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setLoading(true);
      const response = await apiFetch(`/saas/reject-registration/${selectedRegistration.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ reason: rejectionReason }),
      });

      if (response.ok) {
        setSuccess('School registration rejected.');
        setRejectionDialogOpen(false);
        setRejectionReason('');
        setRegistrations((prev) => prev.filter((registration) => registration.id !== selectedRegistration.id));
        await loadRegistrations();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to reject registration');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeInvitation = async (invitationId) => {
    if (window.confirm('Are you sure you want to revoke this invitation?')) {
      try {
        const response = await apiFetch(`/saas/revoke-invitation/${invitationId}`, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (response.ok) {
          setSuccess('Invitation revoked successfully!');
          await loadInvitations();
        } else {
          setError('Failed to revoke invitation');
        }
      } catch (err) {
        setError('Network error. Please try again.');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'suspended':
        return 'default';
      default:
        return 'default';
    }
  };

  const getInvitationStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'accepted':
        return 'success';
      case 'expired':
        return 'error';
      case 'revoked':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        SaaS Management
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Manage school registrations, invitations, and tenant accounts
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Registration Requests" />
          <Tab label="Invitations" />
        </Tabs>
      </Box>

      {/* Registration Requests Tab */}
      <TabPanel value={activeTab} index={0}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">
            School Registration Requests
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {registrations.length} total requests
          </Typography>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>School Name</TableCell>
                <TableCell>Admin Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {registrations.map((registration) => (
                <TableRow key={registration.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {registration.school_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {registration.school_type} • {registration.student_capacity} students
                    </Typography>
                  </TableCell>
                  <TableCell>{registration.admin_name}</TableCell>
                  <TableCell>{registration.admin_email}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {registration.school_city}, {registration.school_state}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={registration.status}
                      color={getStatusColor(registration.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(registration.registration_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedRegistration(registration);
                        setViewDialogOpen(true);
                      }}
                    >
                      <Visibility />
                    </IconButton>
                    {registration.status === 'pending' && (
                      <>
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => {
                            setSelectedRegistration(registration);
                            setApprovalDialogOpen(true);
                          }}
                        >
                          <CheckCircle />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setSelectedRegistration(registration);
                            setRejectionDialogOpen(true);
                          }}
                        >
                          <Cancel />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Invitations Tab */}
      <TabPanel value={activeTab} index={1}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">
            School Invitations
          </Typography>
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={() => setInviteDialogOpen(true)}
          >
            Send Invitation
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Invitation Code</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>School Hint</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Sent Date</TableCell>
                <TableCell>Expires</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invitations.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {invitation.invitation_code}
                    </Typography>
                  </TableCell>
                  <TableCell>{invitation.invited_email}</TableCell>
                  <TableCell>{invitation.school_name_hint || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={invitation.status}
                      color={getInvitationStatusColor(invitation.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(invitation.sent_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(invitation.expires_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    {invitation.status === 'pending' && (
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleRevokeInvitation(invitation.id)}
                      >
                        Revoke
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Send Invitation Dialog */}
      <Dialog open={inviteDialogOpen} onClose={() => setInviteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send School Invitation</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="School Name (Optional)"
                value={inviteForm.school_name_hint}
                onChange={(e) => setInviteForm({ ...inviteForm, school_name_hint: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Personal Message (Optional)"
                multiline
                rows={3}
                value={inviteForm.message}
                onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleInvite} variant="contained" disabled={loading}>
            {loading ? 'Sending...' : 'Send Invitation'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={approvalDialogOpen} onClose={() => setApprovalDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Approve School Registration</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Are you sure you want to approve the registration for <strong>{selectedRegistration?.school_name}</strong>?
          </Typography>
          <TextField
            fullWidth
            label="Temporary Password"
            value={tempPassword}
            onChange={(e) => setTempPassword(e.target.value)}
            helperText="This will be the initial password for the school admin"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleApprove} variant="contained" color="success" disabled={loading}>
            {loading ? 'Approving...' : 'Approve'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={rejectionDialogOpen} onClose={() => setRejectionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject School Registration</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Please provide a reason for rejecting the registration for <strong>{selectedRegistration?.school_name}</strong>:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Rejection Reason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectionDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleReject} variant="contained" color="error" disabled={loading}>
            {loading ? 'Rejecting...' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Registration Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Registration Details</DialogTitle>
        <DialogContent>
          {selectedRegistration && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">School Name:</Typography>
                <Typography variant="body1">{selectedRegistration.school_name}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">School Type:</Typography>
                <Typography variant="body1">{selectedRegistration.school_type}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Address:</Typography>
                <Typography variant="body1">
                  {selectedRegistration.school_address}<br />
                  {selectedRegistration.school_city}, {selectedRegistration.school_state} {selectedRegistration.school_postal_code}<br />
                  {selectedRegistration.school_country}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Phone:</Typography>
                <Typography variant="body1">{selectedRegistration.school_phone}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Email:</Typography>
                <Typography variant="body1">{selectedRegistration.school_email}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Admin Name:</Typography>
                <Typography variant="body1">{selectedRegistration.admin_name}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Admin Email:</Typography>
                <Typography variant="body1">{selectedRegistration.admin_email}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Admin Phone:</Typography>
                <Typography variant="body1">{selectedRegistration.admin_phone}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Student Capacity:</Typography>
                <Typography variant="body1">{selectedRegistration.student_capacity}</Typography>
              </Grid>
              {selectedRegistration.notes && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Notes:</Typography>
                  <Typography variant="body1">{selectedRegistration.notes}</Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
