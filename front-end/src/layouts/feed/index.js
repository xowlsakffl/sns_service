import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';

import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';
import useInfiniteScroll from 'hooks/useInfiniteScroll';
import mergeUniqueById from 'utils/mergeUniqueById';
import {
  buildStoryItems,
  getEngagementHints,
  getPostMedia,
  getRelativeHint,
  getUserProfile,
} from 'utils/socialMeta';

function Feed() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';
  const isFetchingRef = useRef(false);

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(-1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const hasToken = useMemo(() => Boolean(token), [token]);

  const loadPosts = useCallback(
    async (nextPage = 0, { reset = false } = {}) => {
      if (!hasToken) {
        setErrorMessage('로그인해야 피드를 확인할 수 있습니다.');
        return;
      }

      if (isFetchingRef.current) {
        return;
      }

      isFetchingRef.current = true;
      const appendMode = !reset && nextPage > 0;

      if (appendMode) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setErrorMessage('');
      }

      try {
        const response = await axios.get(`/api/v1/posts?size=6&sort=id,desc&page=${nextPage}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

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
        setErrorMessage(apiMessage || '피드를 불러오지 못했습니다.');
      } finally {
        isFetchingRef.current = false;
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [hasToken, navigate, token],
  );

  useEffect(() => {
    setPosts([]);
    setPage(-1);
    setHasMore(true);

    if (!hasToken) {
      setErrorMessage('로그인해야 피드를 확인할 수 있습니다.');
      return;
    }

    loadPosts(0, { reset: true });
  }, [hasToken, loadPosts]);

  const stories = useMemo(() => buildStoryItems(posts), [posts]);
  const loadMoreRef = useInfiniteScroll({
    enabled: hasToken,
    hasMore,
    loading: loading || loadingMore,
    onLoadMore: () => loadPosts(page + 1),
  });

  return (
    <DashboardLayout>
      <Box className="gh-page">
        <Card className="gh-hero" elevation={0}>
          <Box className="gh-story-strip">
            {stories.map((story) => (
              <Box key={story.key} className="gh-story-item">
                <Box className="gh-story-ring" data-seen={story.seen ? 'true' : 'false'}>
                  <Avatar
                    src={story.avatar}
                    alt={story.displayName}
                    className="gh-story-avatar"
                  />
                </Box>
                <span className="gh-story-name">{story.displayName}</span>
              </Box>
            ))}
            {stories.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                로그인하면 시드 계정의 스토리를 볼 수 있습니다.
              </Typography>
            )}
          </Box>
        </Card>

        {!hasToken && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            로그인해야 피드 데이터가 로드됩니다.
          </Alert>
        )}
        {errorMessage && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <Box sx={{ mt: 2 }}>
          {posts.map((post) => {
            const writer =
              post?.user?.username || post?.user?.userName || post?.user?.name || 'unknown';
            const profile = getUserProfile(writer);
            const engagement = getEngagementHints(post.id);

            return (
              <Card key={post.id} className="gh-card gh-feed-card" elevation={0}>
                <Box className="gh-post-header">
                  <Box className="gh-post-header-main">
                    <Avatar src={profile.avatar} alt={profile.displayName} />
                    <Box className="gh-post-meta">
                      <Box className="gh-post-meta-row">
                        <span className="gh-post-username">{profile.displayName}</span>
                        <span className="gh-post-dot" />
                        <span className="gh-post-time">{getRelativeHint(post.id)}</span>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {profile.note}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton size="small">
                    <MoreHorizRoundedIcon fontSize="small" />
                  </IconButton>
                </Box>

                <Box
                  component="img"
                  src={getPostMedia(post.id)}
                  alt={post.title}
                  className="gh-post-media"
                />

                <Box className="gh-post-actions">
                  <Box className="gh-post-actions-left">
                    <IconButton size="small">
                      <FavoriteBorderRoundedIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => navigate('/post-detail', { state: post })}
                    >
                      <ChatBubbleOutlineRoundedIcon />
                    </IconButton>
                    <IconButton size="small">
                      <SendRoundedIcon />
                    </IconButton>
                  </Box>
                  <IconButton size="small">
                    <BookmarkBorderRoundedIcon />
                  </IconButton>
                </Box>

                <Box className="gh-post-copy">
                  <Typography className="gh-post-stats">좋아요 {engagement.likes}개</Typography>
                  <Typography className="gh-post-caption">
                    <strong>{profile.displayName}</strong>
                    {post.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" className="gh-body-clamp">
                    {post.body}
                  </Typography>
                  <Typography className="gh-post-link">
                    댓글 {engagement.comments}개 모두 보기
                  </Typography>
                  <Button
                    size="small"
                    variant="text"
                    sx={{ px: 0, mt: 0.5 }}
                    onClick={() => navigate('/post-detail', { state: post })}
                  >
                    게시글 보기
                  </Button>
                </Box>
              </Card>
            );
          })}
        </Box>

        {!loading && posts.length === 0 && hasToken && (
          <Alert severity="info" sx={{ mt: 2 }}>
            등록된 게시글이 없습니다.
          </Alert>
        )}

        {hasToken && posts.length > 0 && (
          <Box ref={loadMoreRef} className="gh-infinite-trigger">
            {loadingMore && (
              <Typography variant="body2" color="text.secondary">
                게시글을 더 불러오는 중입니다...
              </Typography>
            )}
            {!hasMore && (
              <Typography variant="body2" color="text.secondary">
                마지막 게시글까지 모두 확인했습니다.
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </DashboardLayout>
  );
}

export default Feed;
