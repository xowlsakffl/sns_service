import Icon from '@mui/material/Icon';

import Feed from 'layouts/feed';
import Post from 'layouts/post';
import MyPosts from 'layouts/myposts';
import Alarm from 'layouts/alarm';
import SignIn from 'layouts/authentication/sign-in';
import SignUp from 'layouts/authentication/sign-up';

const routes = [
  {
    type: 'collapse',
    name: '피드',
    key: 'feed',
    icon: <Icon fontSize="small">dynamic_feed</Icon>,
    route: '/feed',
    component: <Feed />,
  },
  {
    type: 'collapse',
    name: '글쓰기',
    key: 'post',
    icon: <Icon fontSize="small">edit_square</Icon>,
    route: '/post',
    component: <Post />,
  },
  {
    type: 'collapse',
    name: '내 글',
    key: 'my-posts',
    icon: <Icon fontSize="small">article</Icon>,
    route: '/my-post',
    component: <MyPosts />,
  },
  {
    type: 'collapse',
    name: '알림',
    key: 'alarms',
    icon: <Icon fontSize="small">notifications</Icon>,
    route: '/alarms',
    component: <Alarm />,
  },
  {
    type: 'collapse',
    name: '로그인',
    key: 'sign-in',
    icon: <Icon fontSize="small">login</Icon>,
    route: '/authentication/sign-in',
    component: <SignIn />,
  },
  {
    type: 'collapse',
    name: '회원가입',
    key: 'sign-up',
    icon: <Icon fontSize="small">person_add</Icon>,
    route: '/authentication/sign-up',
    component: <SignUp />,
  },
];

export default routes;
