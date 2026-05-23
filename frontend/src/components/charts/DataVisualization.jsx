import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Paper,
  Chip,
  LinearProgress,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Refresh,
  Download,
  FilterList,
  Fullscreen,
  Info,
  PieChart,
  BarChart,
  Timeline,
  Assessment,
  ShowChart,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap,
  ComposedChart,
} from 'recharts';

const DataVisualization = () => {
  const theme = useTheme();
  const [timeRange, setTimeRange] = useState('month');
  const [chartType, setChartType] = useState('line');
  const [loading, setLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('all');

  // Mock data for different visualizations
  const attendanceData = [
    { month: 'Jan', present: 92, absent: 5, late: 3, total: 100 },
    { month: 'Feb', present: 94, absent: 4, late: 2, total: 100 },
    { month: 'Mar', present: 91, absent: 6, late: 3, total: 100 },
    { month: 'Apr', present: 95, absent: 3, late: 2, total: 100 },
    { month: 'May', present: 93, absent: 4, late: 3, total: 100 },
    { month: 'Jun', present: 96, absent: 2, late: 2, total: 100 },
  ];

  const performanceData = [
    { subject: 'Math', A: 85, B: 65, fullMark: 100 },
    { subject: 'Science', A: 78, B: 88, fullMark: 100 },
    { subject: 'English', A: 92, B: 78, fullMark: 100 },
    { subject: 'History', A: 70, B: 85, fullMark: 100 },
    { subject: 'Geography', A: 88, B: 72, fullMark: 100 },
    { subject: 'Computer', A: 95, B: 90, fullMark: 100 },
  ];

  const feeCollectionData = [
    { month: 'Jan', collected: 45000, pending: 5000, target: 50000 },
    { month: 'Feb', collected: 48000, pending: 2000, target: 50000 },
    { month: 'Mar', collected: 52000, pending: 0, target: 50000 },
    { month: 'Apr', collected: 49000, pending: 1000, target: 50000 },
    { month: 'May', collected: 51000, pending: 0, target: 50000 },
    { month: 'Jun', collected: 47000, pending: 3000, target: 50000 },
  ];

  const gradeDistribution = [
    { grade: 'A', count: 45, color: theme.palette.success.main },
    { grade: 'B', count: 38, color: theme.palette.info.main },
    { grade: 'C', count: 22, color: theme.palette.warning.main },
    { grade: 'D', count: 8, color: theme.palette.error.main },
    { grade: 'F', count: 3, color: theme.palette.grey[500] },
  ];

  const subjectPerformance = [
    { subject: 'Mathematics', students: 120, avgScore: 78, passRate: 85 },
    { subject: 'Science', students: 115, avgScore: 82, passRate: 88 },
    { subject: 'English', students: 125, avgScore: 85, passRate: 92 },
    { subject: 'History', students: 110, avgScore: 75, passRate: 80 },
    { subject: 'Geography', students: 108, avgScore: 80, passRate: 86 },
    { subject: 'Computer', students: 95, avgScore: 90, passRate: 95 },
  ];

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
    theme.palette.grey[500],
  ];

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 2, bgcolor: theme.palette.background.paper, border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Typography key={index} variant="body2" color={entry.color}>
              {entry.name}: {entry.value}
            </Typography>
          ))}
        </Paper>
      );
    }
    return null;
  };

  const AttendanceChart = () => (
    <Card
      sx={{
        height: 400,
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
        border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
        borderRadius: 3,
      }}
    >
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Attendance Trends
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh">
              <IconButton size="small" onClick={handleRefresh}>
                <Refresh />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download">
              <IconButton size="small">
                <Download />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Box sx={{ flex: 1 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
              <XAxis dataKey="month" stroke={theme.palette.text.secondary} />
              <YAxis stroke={theme.palette.text.secondary} />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="present"
                stackId="1"
                stroke={theme.palette.success.main}
                fill={alpha(theme.palette.success.main, 0.6)}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="late"
                stackId="1"
                stroke={theme.palette.warning.main}
                fill={alpha(theme.palette.warning.main, 0.6)}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="absent"
                stackId="1"
                stroke={theme.palette.error.main}
                fill={alpha(theme.palette.error.main, 0.6)}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );

  const PerformanceRadar = () => (
    <Card
      sx={{
        height: 400,
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.info.main, 0.02)} 100%)`,
        border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
        borderRadius: 3,
      }}
    >
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Subject Performance Comparison
          </Typography>
          <Chip label="Class A vs Class B" size="small" />
        </Box>
        
        <Box sx={{ flex: 1 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={performanceData}>
              <PolarGrid stroke={alpha(theme.palette.divider, 0.3)} />
              <PolarAngleAxis dataKey="subject" stroke={theme.palette.text.secondary} />
              <PolarRadiusAxis stroke={theme.palette.text.secondary} />
              <Radar
                name="Class A"
                dataKey="A"
                stroke={theme.palette.primary.main}
                fill={alpha(theme.palette.primary.main, 0.3)}
                strokeWidth={2}
              />
              <Radar
                name="Class B"
                dataKey="B"
                stroke={theme.palette.secondary.main}
                fill={alpha(theme.palette.secondary.main, 0.3)}
                strokeWidth={2}
              />
              <Legend />
              <RechartsTooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );

  const FeeCollectionChart = () => (
    <Card
      sx={{
        height: 400,
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.success.main, 0.02)} 100%)`,
        border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
        borderRadius: 3,
      }}
    >
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Fee Collection Analysis
          </Typography>
          <ToggleButtonGroup
            value={chartType}
            exclusive
            onChange={(e, newType) => newType && setChartType(newType)}
            size="small"
          >
            <ToggleButton value="line">
              <ShowChart />
            </ToggleButton>
            <ToggleButton value="bar">
              <BarChart />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        
        <Box sx={{ flex: 1 }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <ComposedChart data={feeCollectionData}>
                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                <XAxis dataKey="month" stroke={theme.palette.text.secondary} />
                <YAxis stroke={theme.palette.text.secondary} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="pending" fill={alpha(theme.palette.error.main, 0.6)} />
                <Line
                  type="monotone"
                  dataKey="collected"
                  stroke={theme.palette.success.main}
                  strokeWidth={3}
                  dot={{ fill: theme.palette.success.main, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke={theme.palette.primary.main}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </ComposedChart>
            ) : (
              <RechartsBarChart data={feeCollectionData}>
                <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                <XAxis dataKey="month" stroke={theme.palette.text.secondary} />
                <YAxis stroke={theme.palette.text.secondary} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="collected" fill={alpha(theme.palette.success.main, 0.8)} />
                <Bar dataKey="pending" fill={alpha(theme.palette.error.main, 0.8)} />
              </RechartsBarChart>
            )}
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );

  const GradeDistribution = () => (
    <Card
      sx={{
        height: 400,
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.warning.main, 0.02)} 100%)`,
        border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
        borderRadius: 3,
      }}
    >
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Grade Distribution
          </Typography>
          <Tooltip title="Grade distribution across all subjects">
            <IconButton size="small">
              <Info />
            </IconButton>
          </Tooltip>
        </Box>
        
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={gradeDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ grade, count, percent }) => `${grade}: ${count} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="count"
              >
                {gradeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip content={<CustomTooltip />} />
            </RechartsPieChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );

  const SubjectPerformanceTable = () => (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.info.main, 0.02)} 100%)`,
        border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
        borderRadius: 3,
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Subject Performance Overview
          </Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              label="Time Range"
            >
              <MenuItem value="week">Last Week</MenuItem>
              <MenuItem value="month">Last Month</MenuItem>
              <MenuItem value="quarter">Last Quarter</MenuItem>
              <MenuItem value="year">Last Year</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {subjectPerformance.map((subject, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ minWidth: 120 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {subject.subject}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {subject.students} students
                </Typography>
              </Box>
              
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="body2" sx={{ minWidth: 40 }}>
                    {subject.avgScore}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={subject.avgScore}
                    sx={{
                      flex: 1,
                      height: 8,
                      borderRadius: 4,
                      bgcolor: alpha(theme.palette.grey[300], 0.3),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        bgcolor: subject.avgScore >= 80 ? theme.palette.success.main :
                                 subject.avgScore >= 60 ? theme.palette.warning.main :
                                 theme.palette.error.main,
                      },
                    }}
                  />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Pass Rate: {subject.passRate}%
                </Typography>
              </Box>
              
              <Chip
                label={subject.avgScore >= 80 ? 'Excellent' :
                       subject.avgScore >= 60 ? 'Good' : 'Needs Improvement'}
                size="small"
                color={subject.avgScore >= 80 ? 'success' :
                        subject.avgScore >= 60 ? 'warning' : 'error'}
                sx={{ fontSize: '0.7rem' }}
              />
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
            Analytics & Insights
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Comprehensive data visualization and performance metrics
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Metric</InputLabel>
            <Select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              label="Metric"
            >
              <MenuItem value="all">All Metrics</MenuItem>
              <MenuItem value="attendance">Attendance</MenuItem>
              <MenuItem value="performance">Performance</MenuItem>
              <MenuItem value="fees">Fee Collection</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            sx={{ borderRadius: 2 }}
          >
            Filters
          </Button>
          
          <Button
            variant="contained"
            startIcon={<Download />}
            sx={{ borderRadius: 2 }}
          >
            Export Report
          </Button>
        </Box>
      </Box>

      {/* Charts Grid */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <AttendanceChart />
        </Grid>
        <Grid item xs={12} lg={4}>
          <GradeDistribution />
        </Grid>
        <Grid item xs={12} lg={6}>
          <PerformanceRadar />
        </Grid>
        <Grid item xs={12} lg={6}>
          <FeeCollectionChart />
        </Grid>
        <Grid item xs={12}>
          <SubjectPerformanceTable />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DataVisualization;
