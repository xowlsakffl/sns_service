import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import axios from 'axios';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';

function SignUp() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (userName.trim().length < 2) {
      setMessage({ type: 'error', text: '아이디는 2자 이상 입력해주세요.' });
      return;
    }

    if (password.length < 8) {
      setMessage({ type: 'error', text: '비밀번호는 8자 이상이어야 합니다.' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      await axios.post('/api/v1/users/join', {
        name: userName.trim(),
        password,
      });

      setMessage({ type: 'success', text: '회원가입 완료. 로그인 페이지로 이동합니다.' });
      setTimeout(() => navigate('/authentication/sign-in'), 700);
    } catch (error) {
      const apiMessage = error?.response?.data?.resultMessage;
      setMessage({ type: 'error', text: apiMessage || '회원가입에 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <Box className="gh-page gh-auth-wrap">
        <Card className="gh-auth-card" elevation={0}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Stack spacing={2.5}>
              <Chip label="SNS Service" className="gh-pill" />
              <Typography variant="h3" fontWeight={700}>
                회원가입
              </Typography>
              <Typography variant="body2" color="text.secondary">
                SNS Service 계정을 만들고 바로 피드에 참여하세요.
              </Typography>

              {message.text && <Alert severity={message.type || 'info'}>{message.text}</Alert>}

              <Box component="form" onSubmit={handleSubmit}>
                <Stack spacing={2}>
                  <TextField
                    label="아이디"
                    value={userName}
                    onChange={(event) => setUserName(event.target.value)}
                    fullWidth
                    autoComplete="username"
                  />
                  <TextField
                    label="비밀번호 (8자 이상)"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    fullWidth
                    autoComplete="new-password"
                  />
                  <Button type="submit" variant="contained" size="large" disabled={loading}>
                    {loading ? '가입 중...' : '회원가입'}
                  </Button>
                  <Typography variant="body2" color="text.secondary">
                    이미 계정이 있으면{' '}
                    <RouterLink to="/authentication/sign-in" className="gh-inline-link">
                      로그인
                    </RouterLink>
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
}

export default SignUp;

