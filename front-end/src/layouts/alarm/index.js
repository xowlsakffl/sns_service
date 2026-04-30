import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';
import useInfiniteScroll from 'hooks/useInfiniteScroll';
import mergeUniqueById from 'utils/mergeUniqueById';
import { getRelativeHint, getUserProfile } from 'utils/socialMeta';

function Alarm() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';
  const eventSourceRef = useRef(null);
  const isFetchingRef = useRef(false);

  const [alarms, setAlarms] = useState([]);
  const [page, setPage] = useState(-1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const loadAlarms = useCallback(
    async (nextPage = 0, { reset = false } = {}) => {
      if (isFetchingRef.current) {
        return;
      }

      isFetchingRef.current = true;
      const appendMode = !reset && nextPage > 0;

      if (appendMode) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const response = await axios.get(
          `/api/v1/users/alarm?size=6&sort=id,desc&page=${nextPage}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const pageInfo = response?.data?.result;
        const nextItems = pageInfo?.content || [];
        const totalPages = Math.max(1, pageInfo?.totalPages || 1);

        setAlarms((previousAlarms) =>
          reset ? nextItems : mergeUniqueById(previousAlarms, nextItems),
        );
        setPage(nextPage);
        setHasMore(nextPage + 1 < totalPages);
      } catch (error) {
        if (error?.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/authentication/sign-in');
          return;
        }

        const apiMessage = error?.response?.data?.resultMessage;
        setMessage({ type: 'error', text: apiMessage || '알림을 불러오지 못했습니다.' });
      } finally {
        isFetchingRef.current = false;
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [navigate, token],
  );

  const refreshLatestAlarms = useCallback(async () => {
    try {
      const response = await axios.get('/api/v1/users/alarm?size=6&sort=id,desc&page=0', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const pageInfo = response?.data?.result;
      const headItems = pageInfo?.content || [];
      const totalPages = Math.max(1, pageInfo?.totalPages || 1);

      setAlarms((previousAlarms) => [...headItems, ...previousAlarms].reduce((merged, item) => {
        if (merged.some((existingItem) => existingItem?.id === item?.id)) {
          return merged;
        }

        return [...merged, item];
      }, []));
      setHasMore(page + 1 < totalPages);
    } catch (error) {
      if (error?.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/authentication/sign-in');
      }
    }
  }, [navigate, page, token]);

  useEffect(() => {
    if (!token) {
      navigate('/authentication/sign-in');
      return;
    }

    setAlarms([]);
    setPage(-1);
    setHasMore(true);
    loadAlarms(0, { reset: true });
  }, [loadAlarms, navigate, token]);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    const source = new EventSource(
      `http://localhost:8080/api/v1/users/alarm/subscribe?token=${token}`,
    );
    eventSourceRef.current = source;

    source.addEventListener('alarm', () => {
      refreshLatestAlarms();
    });

    source.addEventListener('error', () => {
      source.close();
    });

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [refreshLatestAlarms, token]);

  const loadMoreRef = useInfiniteScroll({
    enabled: Boolean(token),
    hasMore,
    loading: loading || loadingMore,
    onLoadMore: () => loadAlarms(page + 1),
  });

  return (
    <DashboardLayout>
      <Box className="gh-page">
        <Box className="gh-hero">
          <Typography variant="h5" fontWeight={700}>
            알림
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            댓글과 좋아요 이벤트가 실시간으로 이 화면에 도착합니다.
          </Typography>
        </Box>

        {message.text && (
          <Alert severity={message.type || 'info'} sx={{ mt: 2 }}>
            {message.text}
          </Alert>
        )}

        <Stack spacing={1.6} sx={{ mt: 2.4 }}>
          {alarms.map((alarm) => {
            const fromUserId = alarm?.alarmArgs?.fromUserId || alarm.id;
            const profile = getUserProfile(`user-${fromUserId}`);

            return (
              <Card key={alarm.id || alarm.text} className="gh-card" elevation={0}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1.2} alignItems="center">
                      <Avatar src={profile.avatar} alt={profile.displayName} />
                      <Box>
                        <Typography fontWeight={600}>{alarm.text}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {getRelativeHint(alarm.id)}
                        </Typography>
                      </Box>
                    </Stack>
                    <Chip label="NEW" size="small" color="info" />
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Stack>

        {!loading && alarms.length === 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            도착한 알림이 없습니다.
          </Alert>
        )}

        {alarms.length > 0 && (
          <Box ref={loadMoreRef} className="gh-infinite-trigger">
            {loadingMore && (
              <Typography variant="body2" color="text.secondary">
                알림을 더 불러오는 중입니다...
              </Typography>
            )}
            {!hasMore && (
              <Typography variant="body2" color="text.secondary">
                마지막 알림까지 모두 확인했습니다.
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </DashboardLayout>
  );
}

export default Alarm;
