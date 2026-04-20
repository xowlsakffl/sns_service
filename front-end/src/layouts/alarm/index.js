import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';

function Alarm() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';
  const eventSourceRef = useRef(null);

  const [alarms, setAlarms] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchAlarms = async (nextPage = 1) => {
    try {
      const response = await axios.get(
        `/api/v1/users/alarm?size=6&sort=id,desc&page=${nextPage - 1}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const pageInfo = response?.data?.result;
      setAlarms(pageInfo?.content || []);
      setTotalPages(Math.max(1, pageInfo?.totalPages || 1));
    } catch (error) {
      if (error?.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/authentication/sign-in');
        return;
      }

      const apiMessage = error?.response?.data?.resultMessage;
      setMessage({ type: 'error', text: apiMessage || '알림을 불러오지 못했습니다.' });
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/authentication/sign-in');
      return;
    }

    fetchAlarms(page);
  }, [page]);

  useEffect(() => {
    if (!token) {
      return;
    }

    const source = new EventSource(
      `http://localhost:8080/api/v1/users/alarm/subscribe?token=${token}`,
    );
    eventSourceRef.current = source;

    source.addEventListener('alarm', () => {
      fetchAlarms(page);
    });

    source.addEventListener('error', () => {
      source.close();
    });

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [token, page]);

  return (
    <DashboardLayout>
      <Box className="gh-page">
        <Box className="gh-hero">
          <Typography variant="h4" fontWeight={700}>
            실시간 알림
          </Typography>
          <Typography color="text.secondary">
            댓글, 좋아요 등 이벤트 알림을 최신순으로 확인합니다.
          </Typography>
        </Box>

        {message.text && (
          <Alert severity={message.type || 'info'} sx={{ mt: 2 }}>
            {message.text}
          </Alert>
        )}

        <Stack spacing={1.6} sx={{ mt: 2.4 }}>
          {alarms.map((alarm) => (
            <Card key={alarm.id || alarm.text} className="gh-card" elevation={0}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography>{alarm.text}</Typography>
                  <Chip label="NEW" size="small" color="info" />
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>

        {alarms.length === 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            새로운 알림이 없습니다.
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            page={page}
            count={totalPages}
            onChange={(event, nextPage) => setPage(nextPage)}
            color="primary"
          />
        </Box>
      </Box>
    </DashboardLayout>
  );
}

export default Alarm;
