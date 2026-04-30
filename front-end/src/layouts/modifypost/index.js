import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';

function ModifyPost() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const token = localStorage.getItem('token') || '';

  const [title, setTitle] = useState(state?.title || '');
  const [body, setBody] = useState(state?.body || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const postId = state?.id;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!postId) {
      setMessage({ type: 'error', text: '수정할 게시글 정보를 찾을 수 없습니다.' });
      return;
    }

    if (!title.trim() || !body.trim()) {
      setMessage({ type: 'error', text: '제목과 본문을 모두 입력해 주세요.' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      await axios.put(
        `/api/v1/posts/${postId}`,
        { title: title.trim(), body: body.trim() },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setMessage({ type: 'success', text: '게시글이 수정되었습니다.' });
      setTimeout(() => navigate('/my-post'), 500);
    } catch (error) {
      const apiMessage = error?.response?.data?.resultMessage;
      setMessage({ type: 'error', text: apiMessage || '게시글 수정에 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  if (!postId) {
    return (
      <DashboardLayout>
        <Box className="gh-page">
          <Alert severity="warning">수정할 게시글 정보가 없습니다. 내 게시물에서 다시 선택해 주세요.</Alert>
          <Button sx={{ mt: 2 }} variant="contained" onClick={() => navigate('/my-post')}>
            내 게시물로 이동
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
            <Stack spacing={2.2}>
              <Typography variant="h4" fontWeight={700}>
                게시글 수정
              </Typography>
              {message.text && <Alert severity={message.type || 'info'}>{message.text}</Alert>}

              <Box component="form" onSubmit={handleSubmit}>
                <Stack spacing={2}>
                  <TextField
                    label="제목"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="본문"
                    value={body}
                    onChange={(event) => setBody(event.target.value)}
                    multiline
                    minRows={10}
                    fullWidth
                  />
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
                    <Button type="submit" variant="contained" disabled={loading}>
                      {loading ? '수정 중...' : '수정 저장'}
                    </Button>
                    <Button variant="outlined" onClick={() => navigate('/my-post')}>
                      취소
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
}

export default ModifyPost;
