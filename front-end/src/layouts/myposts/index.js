import { useEffect, useState } from 'react';
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

function MyPosts() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchPosts = async (nextPage = 1) => {
    try {
      const response = await axios.get(`/api/v1/posts/my?size=6&sort=id,desc&page=${nextPage - 1}`, {
        headers: { Authorization: `Bearer ${token}` },
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
      setMessage({ type: 'error', text: apiMessage || '내 글 목록을 불러오지 못했습니다.' });
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/authentication/sign-in');
      return;
    }

    fetchPosts(page);
  }, [page]);

  const handleDelete = async (postId) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) {
      return;
    }

    try {
      await axios.delete(`/api/v1/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage({ type: 'success', text: '게시글이 삭제되었습니다.' });
      fetchPosts(page);
    } catch (error) {
      const apiMessage = error?.response?.data?.resultMessage;
      setMessage({ type: 'error', text: apiMessage || '삭제에 실패했습니다.' });
    }
  };

  return (
    <DashboardLayout>
      <Box className="gh-page">
        <Box className="gh-hero">
          <Typography variant="h4" fontWeight={700}>
            내 글 관리
          </Typography>
          <Typography color="text.secondary">작성한 글을 수정하거나 삭제할 수 있습니다.</Typography>
        </Box>

        {message.text && (
          <Alert severity={message.type || 'info'} sx={{ mt: 2 }}>
            {message.text}
          </Alert>
        )}

        <Stack spacing={2} sx={{ mt: 2.4 }}>
          {posts.map((post) => {
            const writer = post?.user?.username || post?.user?.userName || post?.user?.name || 'me';
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
                    상세
                  </Button>
                  <Button size="small" onClick={() => navigate('/modify-post', { state: post })}>
                    수정
                  </Button>
                  <Button color="error" size="small" onClick={() => handleDelete(post.id)}>
                    삭제
                  </Button>
                </CardActions>
              </Card>
            );
          })}
        </Stack>

        {posts.length === 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            작성한 글이 없습니다.
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

export default MyPosts;

