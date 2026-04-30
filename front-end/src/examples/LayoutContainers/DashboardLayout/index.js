import { useEffect, useMemo } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

import PropTypes from 'prop-types';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import CreateRoundedIcon from '@mui/icons-material/CreateRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';

import MDBox from 'components/MDBox';

import { useMaterialUIController, setLayout } from 'context';
import { getUserProfile } from 'utils/socialMeta';

const APP_NAV_ITEMS = [
  {
    key: 'feed',
    label: '홈',
    shortLabel: '홈',
    to: '/feed',
    matches: ['/feed', '/post-detail'],
    icon: HomeRoundedIcon,
  },
  {
    key: 'post',
    label: '작성',
    shortLabel: '작성',
    to: '/post',
    matches: ['/post'],
    icon: CreateRoundedIcon,
  },
  {
    key: 'mypost',
    label: '내 글',
    shortLabel: '내 글',
    to: '/my-post',
    matches: ['/my-post', '/modify-post'],
    icon: DescriptionRoundedIcon,
  },
  {
    key: 'alarms',
    label: '알림',
    shortLabel: '알림',
    to: '/alarms',
    matches: ['/alarms'],
    icon: NotificationsRoundedIcon,
  },
];

const AUTH_NAV_ITEMS = [
  {
    key: 'signin',
    label: '로그인',
    shortLabel: '로그인',
    to: '/authentication/sign-in',
    matches: ['/authentication/sign-in'],
    icon: LoginRoundedIcon,
  },
  {
    key: 'signup',
    label: '회원가입',
    shortLabel: '가입',
    to: '/authentication/sign-up',
    matches: ['/authentication/sign-up'],
    icon: PersonAddRoundedIcon,
  },
];

const ROUTE_META = [
  { matches: ['/feed'], title: '홈', subtitle: '최신 게시글과 반응을 확인합니다.' },
  { matches: ['/post-detail'], title: '게시글', subtitle: '댓글과 좋아요를 한 화면에서 봅니다.' },
  { matches: ['/post'], title: '작성', subtitle: '새 게시글을 등록합니다.' },
  { matches: ['/my-post'], title: '내 글', subtitle: '작성한 글을 수정하고 정리합니다.' },
  { matches: ['/modify-post'], title: '게시글 수정', subtitle: '선택한 글을 바로 수정합니다.' },
  { matches: ['/alarms'], title: '알림', subtitle: '최신 댓글과 좋아요 알림을 확인합니다.' },
  { matches: ['/authentication/sign-in'], title: '로그인', subtitle: '계정으로 바로 접속합니다.' },
  { matches: ['/authentication/sign-up'], title: '회원가입', subtitle: '새 계정을 만듭니다.' },
];

function matchesPath(pathname, targets) {
  return targets.some((target) => pathname.startsWith(target));
}

function readSessionUser() {
  const token = localStorage.getItem('token');

  if (!token) {
    return '';
  }

  try {
    const payload = token.split('.')[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(window.atob(normalized));
    return decoded?.username || '';
  } catch (error) {
    return '';
  }
}

function NavigationLinks({ items, pathname }) {
  return (
    <>
      {items.map((item) => {
        const isActive = matchesPath(pathname, item.matches);
        const IconComponent = item.icon;

        return (
          <NavLink
            key={item.key}
            to={item.to}
            className="gh-mobile-tab-link"
            data-active={isActive ? 'true' : 'false'}
          >
            <IconComponent fontSize="small" />
            <span>{item.shortLabel}</span>
          </NavLink>
        );
      })}
    </>
  );
}

NavigationLinks.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  pathname: PropTypes.string.isRequired,
};

function DashboardLayout({ children }) {
  const [, dispatch] = useMaterialUIController();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isAuthRoute = pathname.startsWith('/authentication');
  const sessionUser = readSessionUser();
  const currentMeta = useMemo(
    () => ROUTE_META.find((item) => matchesPath(pathname, item.matches)) || ROUTE_META[0],
    [pathname],
  );
  const currentProfile = getUserProfile(sessionUser || 'demo');

  useEffect(() => {
    setLayout(dispatch, 'dashboard');
  }, [dispatch, pathname]);

  return (
    <MDBox className={`gh-app-shell ${isAuthRoute ? 'gh-app-shell--auth' : ''}`}>
      <MDBox className={`gh-stage ${isAuthRoute ? 'gh-stage--auth' : ''}`}>
        <Box className={`gh-main-column ${isAuthRoute ? 'gh-main-column--auth' : ''}`}>
          <Box className="gh-main-header">
            <Box>
              <Typography variant="caption" color="text.secondary">
                SNS 서비스
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {currentMeta.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {currentMeta.subtitle}
              </Typography>
            </Box>
            {sessionUser ? (
              <Avatar src={currentProfile.avatar} alt={currentProfile.displayName} />
            ) : (
              <Button
                variant="text"
                size="small"
                startIcon={<LoginRoundedIcon />}
                onClick={() => navigate('/authentication/sign-in')}
              >
                로그인
              </Button>
            )}
          </Box>

          <Box className="gh-main-content">{children}</Box>

          <Box className={`gh-mobile-tabbar ${isAuthRoute ? 'gh-mobile-tabbar--auth' : ''}`}>
            <NavigationLinks
              items={isAuthRoute ? AUTH_NAV_ITEMS : APP_NAV_ITEMS}
              pathname={pathname}
            />
          </Box>
        </Box>
      </MDBox>
    </MDBox>
  );
}

DashboardLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default DashboardLayout;
