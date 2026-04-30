import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';

function PostDetail() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const token = localStorage.getItem('token') || '';

  const postId = state?.id;
  const title = state?.title || '';
  const writer = state?.user?.username || state?.user?.userName || state?.user?.name || 'unknown';
  const body = state?.body || '';

  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const canRequest = useMemo(() => Boolean(token && postId), [token, postId]);

  const fetchLikes = async () => {
    if (!canRequest) {
      return;
    }

    const response = await axios.get(`/api/v1/posts/${postId}/likes`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setLikes(response?.data?.result || 0);
  };

  const fetchComments = async (nextPage = 1) => {
    if (!canRequest) {
      return;
    }

    const response = await axios.get(
      `/api/v1/posts/${postId}/comments?size=5&sort=id,desc&page=${nextPage - 1}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const pageInfo = response?.data?.result;
    setComments(pageInfo?.content || []);
    setTotalPages(Math.max(1, pageInfo?.totalPages || 1));
  };

  useEffect(() => {
    if (!postId) {
      return;
    }

    const boot = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchLikes(), fetchComments(page)]);
      } catch (error) {
        if (error?.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/authentication/sign-in');
          return;
        }

        const apiMessage = error?.response?.data?.resultMessage;
        setMessage({ type: 'error', text: apiMessage || '상세 정보를 불러오지 못했습니다.' });
      } finally {
        setLoading(false);
      }
    };

    boot();
  }, [postId, page]);

  const handleLike = async () => {
    if (!canRequest) {
      return;
    }

    try {
      await axios.post(
        `/api/v1/posts/${postId}/likes`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      await fetchLikes();
    } catch (error) {
      const apiMessage = error?.response?.data?.resultMessage;
      setMessage({ type: 'error', text: apiMessage || '좋아요 처리에 실패했습니다.' });
    }
  };

  const handleWriteComment = async (event) => {
    event.preventDefault();

    if (!comment.trim()) {
      setMessage({ type: 'error', text: '댓글 내용을 입력해주세요.' });
      return;
    }

    try {
      await axios.post(
        `/api/v1/posts/${postId}/comments`,
        { comment: comment.trim() },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setComment('');
      setMessage({ type: 'success', text: '댓글이 등록되었습니다.' });
      setPage(1);
      await fetchComments(1);
    } catch (error) {
      const apiMessage = error?.response?.data?.resultMessage;
      setMessage({ type: 'error', text: apiMessage || '댓글 등록에 실패했습니다.' });
    }
  };

  if (!postId) {
    return (
      <DashboardLayout>
        <Box className="gh-page">
          <Alert severity="warning">상세 글 정보가 없습니다. 피드에서 다시 진입해주세요.</Alert>
          <Button sx={{ mt: 2 }} variant="contained" onClick={() => navigate('/feed')}>
            피드로 이동
          </Button>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box className="gh-page">
        <Card className="gh-card" elevation={0}>
          <CardContent sx={{ p: { xs: 2.4, sm: 3.2 } }}>
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h4" fontWeight={700}>
                  {title}
                </Typography>
                <Chip label={writer} />
              </Stack>
              <Typography color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                {body}
              </Typography>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Button variant="contained" onClick={handleLike}>
                  좋아요
                </Button>
                <Chip color="info" label={`좋아요 ${likes}`} />
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {message.text && (
          <Alert severity={message.type || 'info'} sx={{ mt: 2 }}>
            {message.text}
          </Alert>
        )}

        <Card className="gh-card" elevation={0} sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700}>
              댓글
            </Typography>
            <Stack spacing={1.2} sx={{ mt: 1.5 }}>
              {comments.map((item) => (
                <Box key={item.id || `${item.username || item.userName}-${item.comment}`}>
                  <Typography fontWeight={600}>
                    {item.username || item.userName || item.user?.username || item.user?.userName || 'unknown'}
                  </Typography>
                  <Typography color="text.secondary">{item.comment || ''}</Typography>
                  <Divider sx={{ mt: 1.1 }} />
                </Box>
              ))}
              {!loading && comments.length === 0 && (
                <Alert severity="info">등록된 댓글이 없습니다.</Alert>
              )}
            </Stack>

            <Box component="form" onSubmit={handleWriteComment} sx={{ mt: 2.2 }}>
              <Stack spacing={1.2}>
                <TextField
                  label="댓글 입력"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  multiline
                  minRows={2}
                  fullWidth
                />
                <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-start' }}>
                  댓글 등록
                </Button>
              </Stack>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2.5 }}>
              <Pagination
                page={page}
                count={totalPages}
                onChange={(event, nextPage) => setPage(nextPage)}
                color="primary"
              />
            </Box>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
}

export default PostDetail;

