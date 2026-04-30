import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';

import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';
import useInfiniteScroll from 'hooks/useInfiniteScroll';
import mergeUniqueById from 'utils/mergeUniqueById';
import { getPostMedia, getRelativeHint, getUserProfile } from 'utils/socialMeta';

function PostDetail() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const token = localStorage.getItem('token') || '';
  const isFetchingCommentsRef = useRef(false);

  const postId = state?.id;
  const title = state?.title || '';
  const writer = state?.user?.username || state?.user?.userName || state?.user?.name || 'unknown';
  const body = state?.body || '';

  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentPage, setCommentPage] = useState(-1);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMoreComments, setLoadingMoreComments] = useState(false);
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const canRequest = useMemo(() => Boolean(token && postId), [token, postId]);
  const profile = useMemo(() => getUserProfile(writer), [writer]);

  const fetchLikes = useCallback(async () => {
    if (!canRequest) {
      return;
    }

    const response = await axios.get(`/api/v1/posts/${postId}/likes`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setLikes(response?.data?.result || 0);
  }, [canRequest, postId, token]);

  const loadComments = useCallback(
    async (nextPage = 0, { reset = false } = {}) => {
      if (!canRequest || isFetchingCommentsRef.current) {
        return;
      }

      isFetchingCommentsRef.current = true;
      const appendMode = !reset && nextPage > 0;

      if (appendMode) {
        setLoadingMoreComments(true);
      } else {
        setLoading(true);
      }

      try {
        const response = await axios.get(
          `/api/v1/posts/${postId}/comments?size=5&sort=id,desc&page=${nextPage}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const pageInfo = response?.data?.result;
        const nextComments = pageInfo?.content || [];
        const totalPages = Math.max(1, pageInfo?.totalPages || 1);

        setComments((previousComments) =>
          reset ? nextComments : mergeUniqueById(previousComments, nextComments),
        );
        setCommentPage(nextPage);
        setHasMoreComments(nextPage + 1 < totalPages);
      } catch (error) {
        if (error?.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/authentication/sign-in');
          return;
        }

        const apiMessage = error?.response?.data?.resultMessage;
        setMessage({ type: 'error', text: apiMessage || '댓글을 불러오지 못했습니다.' });
      } finally {
        isFetchingCommentsRef.current = false;
        setLoading(false);
        setLoadingMoreComments(false);
      }
    },
    [canRequest, navigate, postId, token],
  );

  useEffect(() => {
    if (!postId) {
      return;
    }

    const boot = async () => {
      try {
        setMessage({ type: '', text: '' });
        await Promise.all([fetchLikes(), loadComments(0, { reset: true })]);
      } catch (error) {
        if (error?.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/authentication/sign-in');
          return;
        }

        const apiMessage = error?.response?.data?.resultMessage;
        setMessage({ type: 'error', text: apiMessage || '선택한 게시글을 불러오지 못했습니다.' });
      }
    };

    setComments([]);
    setCommentPage(-1);
    setHasMoreComments(true);
    boot();
  }, [fetchLikes, loadComments, navigate, postId]);

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
      setMessage({ type: 'error', text: '댓글 내용을 입력해 주세요.' });
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
      setComments([]);
      setCommentPage(-1);
      setHasMoreComments(true);
      await loadComments(0, { reset: true });
    } catch (error) {
      const apiMessage = error?.response?.data?.resultMessage;
      setMessage({ type: 'error', text: apiMessage || '댓글 등록에 실패했습니다.' });
    }
  };

  const loadMoreCommentsRef = useInfiniteScroll({
    enabled: canRequest,
    hasMore: hasMoreComments,
    loading: loading || loadingMoreComments,
    onLoadMore: () => loadComments(commentPage + 1),
  });

  if (!postId) {
    return (
      <DashboardLayout>
        <Box className="gh-page">
          <Alert severity="warning">게시글 정보가 없습니다. 피드에서 다시 선택해 주세요.</Alert>
          <Button sx={{ mt: 2 }} variant="contained" onClick={() => navigate('/feed')}>
            피드로 돌아가기
          </Button>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box className="gh-page">
        <Card className="gh-card" elevation={0}>
          <Box className="gh-post-header">
            <Box className="gh-post-header-main">
              <Avatar src={profile.avatar} alt={profile.displayName} />
              <Box className="gh-post-meta">
                <Box className="gh-post-meta-row">
                  <span className="gh-post-username">{profile.displayName}</span>
                  <span className="gh-post-dot" />
                  <span className="gh-post-time">{getRelativeHint(postId)}</span>
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

          <Box component="img" src={getPostMedia(postId)} alt={title} className="gh-post-media" />

          <Box className="gh-post-actions">
            <Box className="gh-post-actions-left">
              <IconButton size="small" onClick={handleLike}>
                <FavoriteBorderRoundedIcon />
              </IconButton>
              <IconButton size="small">
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

          <Box className="gh-detail-body">
            <Typography className="gh-post-stats">좋아요 {likes}개</Typography>
            <Typography className="gh-post-caption">
              <strong>{profile.displayName}</strong>
              {title}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75, whiteSpace: 'pre-wrap' }}>
              {body}
            </Typography>
          </Box>
        </Card>

        {message.text && (
          <Alert severity={message.type || 'info'} sx={{ mt: 2 }}>
            {message.text}
          </Alert>
        )}

        <Card className="gh-card" elevation={0} sx={{ mt: 2 }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={700}>
              댓글
            </Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              {comments.map((item) => {
                const commentUser =
                  item.username ||
                  item.userName ||
                  item.user?.username ||
                  item.user?.userName ||
                  'unknown';
                const commentProfile = getUserProfile(commentUser);

                return (
                  <Box key={item.id || `${commentUser}-${item.comment}`} className="gh-comment-row">
                    <Avatar src={commentProfile.avatar} alt={commentProfile.displayName} />
                    <Box className="gh-comment-copy">
                      <Typography variant="body2">
                        <strong>{commentProfile.displayName}</strong> {item.comment || ''}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {getRelativeHint(item.id)}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
              {!loading && comments.length === 0 && (
                <Alert severity="info">등록된 댓글이 없습니다.</Alert>
              )}
            </Stack>

            {comments.length > 0 && (
              <Box ref={loadMoreCommentsRef} className="gh-infinite-trigger gh-infinite-trigger--compact">
                {loadingMoreComments && (
                  <Typography variant="body2" color="text.secondary">
                    댓글을 더 불러오는 중입니다...
                  </Typography>
                )}
                {!hasMoreComments && (
                  <Typography variant="body2" color="text.secondary">
                    마지막 댓글까지 모두 확인했습니다.
                  </Typography>
                )}
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            <Box component="form" onSubmit={handleWriteComment}>
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
          </Box>
        </Card>
      </Box>
    </DashboardLayout>
  );
}

export default PostDetail;
