import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadIcon from '@mui/icons-material/Upload';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// 샘플 데이터
const organizationsData = [
  {
    id: 1,
    name: "진양노인통합지원센터",
    code: "A48170001",
    location: "진주시",
    type: "노인복지",
    status: "active",
    assignedStaff: "김담당",
    lastUpdated: "2024-04-16",
  },
  // ... 더 많은 기관 데이터
];

const staffData = [
  {
    id: 1,
    name: "김담당",
    role: "일반 담당자",
    department: "복지1팀",
    assignedOrgs: 3,
    status: "active",
    contact: "010-1234-5678",
  },
  // ... 더 많은 직원 데이터
];

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`master-tabpanel-${index}`}
      aria-labelledby={`master-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const MasterPage = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          시스템 관리
        </Typography>
        <Typography color="textSecondary">
          기관 및 담당자 관리, 시스템 설정을 할 수 있습니다.
        </Typography>
      </Box>

      <Paper sx={{ width: '100%', mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="master management tabs"
        >
          <Tab label="기관 관리" />
          <Tab label="담당자 관리" />
          <Tab label="배정 관리" />
          <Tab label="시스템 설정" />
        </Tabs>
      </Paper>

      {/* 기관 관리 탭 */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
          >
            기관 등록
          </Button>
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
          >
            일괄 업로드
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>기관명</TableCell>
                <TableCell>코드</TableCell>
                <TableCell>위치</TableCell>
                <TableCell>분류</TableCell>
                <TableCell>담당자</TableCell>
                <TableCell>상태</TableCell>
                <TableCell>최종 수정일</TableCell>
                <TableCell>관리</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {organizationsData.map((org) => (
                <TableRow key={org.id}>
                  <TableCell>{org.name}</TableCell>
                  <TableCell>{org.code}</TableCell>
                  <TableCell>{org.location}</TableCell>
                  <TableCell>
                    <Chip label={org.type} size="small" />
                  </TableCell>
                  <TableCell>{org.assignedStaff}</TableCell>
                  <TableCell>
                    <Chip
                      label={org.status === 'active' ? '활성' : '비활성'}
                      color={org.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{org.lastUpdated}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="수정">
                        <IconButton size="small">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="삭제">
                        <IconButton size="small">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="담당자 배정">
                        <IconButton size="small">
                          <PersonAddIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* 담당자 관리 탭 */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
          >
            담당자 등록
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>이름</TableCell>
                <TableCell>역할</TableCell>
                <TableCell>부서</TableCell>
                <TableCell>담당 기관 수</TableCell>
                <TableCell>상태</TableCell>
                <TableCell>연락처</TableCell>
                <TableCell>관리</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {staffData.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell>{staff.name}</TableCell>
                  <TableCell>{staff.role}</TableCell>
                  <TableCell>{staff.department}</TableCell>
                  <TableCell>{staff.assignedOrgs}</TableCell>
                  <TableCell>
                    <Chip
                      label={staff.status === 'active' ? '근무중' : '휴직'}
                      color={staff.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{staff.contact}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="수정">
                        <IconButton size="small">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="삭제">
                        <IconButton size="small">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* 배정 관리 탭 */}
      <TabPanel value={tabValue} index={2}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            자동 배정 규칙
          </Typography>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography>
                현재 설정: 업무량 기반 자동 배정 (최대 담당 기관 수: 5)
              </Typography>
              <Button
                variant="outlined"
                startIcon={<SettingsIcon />}
              >
                규칙 설정
              </Button>
            </Box>
          </Paper>
        </Box>

        <Typography variant="h6" gutterBottom>
          최근 배정 이력
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>날짜</TableCell>
                <TableCell>기관</TableCell>
                <TableCell>이전 담당자</TableCell>
                <TableCell>새 담당자</TableCell>
                <TableCell>사유</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* 배정 이력 데이터 */}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* 시스템 설정 탭 */}
      <TabPanel value={tabValue} index={3}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              알림 설정
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              모니터링 알림 규칙과 수신자를 설정합니다.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<SettingsIcon />}
            >
              설정 관리
            </Button>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              보고서 템플릿
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              보고서 양식과 자동 생성 규칙을 설정합니다.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<SettingsIcon />}
            >
              템플릿 관리
            </Button>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              모니터링 항목
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              모니터링할 항목과 체크리스트를 관리합니다.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<SettingsIcon />}
            >
              항목 관리
            </Button>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              에스컬레이션
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              문제 발생 시 자동 에스컬레이션 규칙을 설정합니다.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<SettingsIcon />}
            >
              규칙 관리
            </Button>
          </Paper>
        </Box>
      </TabPanel>
    </Container>
  );
};

export default MasterPage; 