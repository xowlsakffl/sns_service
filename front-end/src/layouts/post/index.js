import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

function Post() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!token) {
      setMessage({ type: 'error', text: '로그인이 필요합니다.' });
      navigate('/authentication/sign-in');
      return;
    }

    if (!title.trim() || !body.trim()) {
      setMessage({ type: 'error', text: '제목과 본문을 모두 입력해주세요.' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      await axios.post(
        '/api/v1/posts',
        { title: title.trim(), body: body.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setMessage({ type: 'success', text: '게시글이 등록되었습니다.' });
      setTimeout(() => navigate('/feed'), 500);
    } catch (error) {
      if (error?.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/authentication/sign-in');
        return;
      }

      const apiMessage = error?.response?.data?.resultMessage;
      setMessage({ type: 'error', text: apiMessage || '게시글 등록에 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <Box className="gh-page">
        <Card className="gh-card" elevation={0}>
          <CardContent sx={{ p: { xs: 2.4, sm: 3.2 } }}>
            <Stack spacing={2.2}>
              <Typography variant="h4" fontWeight={700}>
                새 글 작성
              </Typography>
              <Typography color="text.secondary">
                공유하고 싶은 내용, 링크, 해시태그를 자유롭게 작성하세요.
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
                      {loading ? '저장 중...' : '등록'}
                    </Button>
                    <Button variant="outlined" onClick={() => navigate('/feed')}>
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

export default Post;

