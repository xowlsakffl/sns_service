import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';

function Feed() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const hasToken = useMemo(() => Boolean(token), [token]);

  const fetchPosts = async (nextPage = 1) => {
    if (!hasToken) {
      setErrorMessage('로그인이 필요합니다.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');
      const response = await axios.get(`/api/v1/posts?size=6&sort=id,desc&page=${nextPage - 1}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const pageInfo = response?.data?.result;
      setPosts(pageInfo?.content || []);
      setTotalPages(Math.max(1, pageInfo?.totalPages || 1));
    } catch (error) {
      if (error?.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/authentication/sign-in');
        return;
      }

      const apiMessage = error?.response?.data?.resultMessage;
      setErrorMessage(apiMessage || '피드를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  return (
    <DashboardLayout>
      <Box className="gh-page">
        <Box className="gh-hero">
          <Typography variant="h3" fontWeight={700}>
            SNS 피드
          </Typography>
          <Typography variant="body1" color="text.secondary">
            최신 게시글을 확인하고 댓글과 좋아요로 소통하세요.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} sx={{ mt: 2 }}>
            <Button variant="contained" onClick={() => navigate('/post')}>
              글 작성
            </Button>
            <Button variant="outlined" onClick={() => navigate('/my-post')}>
              내 글 관리
            </Button>
          </Stack>
        </Box>

        {!hasToken && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            로그인 후 피드를 확인할 수 있습니다.
          </Alert>
        )}
        {errorMessage && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <Stack spacing={2} sx={{ mt: 2.5 }}>
          {posts.map((post) => {
            const writer = post?.user?.username || post?.user?.userName || post?.user?.name || 'unknown';
            return (
              <Card key={post.id} className="gh-card" elevation={0}>
                <CardContent>
                  <Stack spacing={1.2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="h5" fontWeight={700}>
                        {post.title}
                      </Typography>
                      <Chip label={writer} size="small" />
                    </Stack>
                    <Typography className="gh-body-clamp" color="text.secondary">
                      {post.body}
                    </Typography>
                  </Stack>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => navigate('/post-detail', { state: post })}>
                    상세 보기
                  </Button>
                </CardActions>
              </Card>
            );
          })}
        </Stack>

        {!loading && posts.length === 0 && hasToken && (
          <Alert severity="info" sx={{ mt: 2 }}>
            아직 등록된 글이 없습니다. 첫 글을 작성해보세요.
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            color="primary"
            page={page}
            count={totalPages}
            onChange={(event, nextPage) => setPage(nextPage)}
          />
        </Box>
      </Box>
    </DashboardLayout>
  );
}

export default Feed;

