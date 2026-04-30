import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';
import useInfiniteScroll from 'hooks/useInfiniteScroll';
import mergeUniqueById from 'utils/mergeUniqueById';
import { getRelativeHint, getUserProfile } from 'utils/socialMeta';

function MyPosts() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';
  const isFetchingRef = useRef(false);

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(-1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const loadPosts = useCallback(
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
          `/api/v1/posts/my?size=6&sort=id,desc&page=${nextPage}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const pageInfo = response?.data?.result;
        const nextItems = pageInfo?.content || [];
        const totalPages = Math.max(1, pageInfo?.totalPages || 1);

        setPosts((previousPosts) =>
          reset ? nextItems : mergeUniqueById(previousPosts, nextItems),
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
        setMessage({ type: 'error', text: apiMessage || '내 게시물을 불러오지 못했습니다.' });
      } finally {
        isFetchingRef.current = false;
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [navigate, token],
  );

  useEffect(() => {
    if (!token) {
      navigate('/authentication/sign-in');
      return;
    }

    setPosts([]);
    setPage(-1);
    setHasMore(true);
    loadPosts(0, { reset: true });
  }, [loadPosts, navigate, token]);

  const handleDelete = async (postId) => {
    if (!window.confirm('이 게시글을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await axios.delete(`/api/v1/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage({ type: 'success', text: '게시글이 삭제되었습니다.' });
      setPosts([]);
      setPage(-1);
      setHasMore(true);
      loadPosts(0, { reset: true });
    } catch (error) {
      const apiMessage = error?.response?.data?.resultMessage;
      setMessage({ type: 'error', text: apiMessage || '게시글 삭제에 실패했습니다.' });
    }
  };

  const loadMoreRef = useInfiniteScroll({
    enabled: Boolean(token),
    hasMore,
    loading: loading || loadingMore,
    onLoadMore: () => loadPosts(page + 1),
  });

  return (
    <DashboardLayout>
      <Box className="gh-page">
        <Box className="gh-hero">
          <Typography variant="h5" fontWeight={700}>
            내 게시물
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            작성한 글을 검토하고 수정하거나 삭제할 수 있습니다.
          </Typography>
        </Box>

        {message.text && (
          <Alert severity={message.type || 'info'} sx={{ mt: 2 }}>
            {message.text}
          </Alert>
        )}

        <Stack spacing={2} sx={{ mt: 2.4 }}>
          {posts.map((post) => {
            const writer = post?.user?.username || post?.user?.userName || post?.user?.name || 'me';
            const profile = getUserProfile(writer);

            return (
              <Card key={post.id} className="gh-card" elevation={0}>
                <CardContent>
                  <Stack spacing={1.4}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={1.2} alignItems="center">
                        <Avatar src={profile.avatar} alt={profile.displayName} />
                        <Box>
                          <Typography fontWeight={700}>{profile.displayName}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {getRelativeHint(post.id)}
                          </Typography>
                        </Box>
                      </Stack>
                      <Chip label="내 글" size="small" />
                    </Stack>
                    <Typography variant="h6" fontWeight={700}>
                      {post.title}
                    </Typography>
                    <Typography className="gh-body-clamp" color="text.secondary">
                      {post.body}
                    </Typography>
                  </Stack>
                </CardContent>
                <CardActions sx={{ px: 2, pb: 2 }}>
                  <Button size="small" onClick={() => navigate('/post-detail', { state: post })}>
                    보기
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

        {!loading && posts.length === 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            등록된 내 게시물이 없습니다.
          </Alert>
        )}

        {posts.length > 0 && (
          <Box ref={loadMoreRef} className="gh-infinite-trigger">
            {loadingMore && (
              <Typography variant="body2" color="text.secondary">
                내 게시물을 더 불러오는 중입니다...
              </Typography>
            )}
            {!hasMore && (
              <Typography variant="body2" color="text.secondary">
                내 게시물을 모두 확인했습니다.
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </DashboardLayout>
  );
}

export default MyPosts;
