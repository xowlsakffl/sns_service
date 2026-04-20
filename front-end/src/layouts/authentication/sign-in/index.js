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

function SignIn() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const token = localStorage.getItem('token') || '';
  const isLoggedIn = Boolean(token);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!userName.trim() || !password.trim()) {
      setMessage({ type: 'error', text: '아이디와 비밀번호를 입력해주세요.' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      const res = await axios.post('/api/v1/users/login', {
        name: userName.trim(),
        password,
      });

      const nextToken = res?.data?.result?.token;
      if (!nextToken) {
        throw new Error('토큰이 응답에 없습니다.');
      }

      localStorage.setItem('token', nextToken);
      navigate('/feed');
    } catch (error) {
      const apiMessage = error?.response?.data?.resultMessage;
      setMessage({ type: 'error', text: apiMessage || '로그인에 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setMessage({ type: 'success', text: '로그아웃되었습니다.' });
    navigate('/authentication/sign-in');
  };

  return (
    <DashboardLayout>
      <Box className="gh-page gh-auth-wrap">
        <Card className="gh-auth-card" elevation={0}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Stack spacing={2.5}>
              <Chip label="GameHub SNS" className="gh-pill" />
              <Typography variant="h3" fontWeight={700}>
                로그인
              </Typography>
              <Typography variant="body2" color="text.secondary">
                기본 계정은 없습니다. 회원가입 후 로그인하세요.
              </Typography>

              {message.text && <Alert severity={message.type || 'info'}>{message.text}</Alert>}

              {isLoggedIn ? (
                <Stack spacing={2}>
                  <Alert severity="success">현재 로그인 상태입니다.</Alert>
                  <Button variant="contained" size="large" onClick={() => navigate('/feed')}>
                    피드로 이동
                  </Button>
                  <Button variant="outlined" color="error" onClick={handleLogout}>
                    로그아웃
                  </Button>
                </Stack>
              ) : (
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
                      label="비밀번호"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      fullWidth
                      autoComplete="current-password"
                    />
                    <Button type="submit" variant="contained" size="large" disabled={loading}>
                      {loading ? '로그인 중...' : '로그인'}
                    </Button>
                    <Typography variant="body2" color="text.secondary">
                      계정이 없으면{' '}
                      <RouterLink to="/authentication/sign-up" className="gh-inline-link">
                        회원가입
                      </RouterLink>
                    </Typography>
                  </Stack>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
}

export default SignIn;
