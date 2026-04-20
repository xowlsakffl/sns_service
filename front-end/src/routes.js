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
    name: 'Feed',
    key: 'feed',
    icon: <Icon fontSize="small">home</Icon>,
    route: '/feed',
    component: <Feed />,
  },
  {
    type: 'collapse',
    name: 'Write',
    key: 'post',
    icon: <Icon fontSize="small">edit_note</Icon>,
    route: '/post',
    component: <Post />,
  },
  {
    type: 'collapse',
    name: 'My Posts',
    key: 'my-posts',
    icon: <Icon fontSize="small">article</Icon>,
    route: '/my-post',
    component: <MyPosts />,
  },
  {
    type: 'collapse',
    name: 'Alarms',
    key: 'alarms',
    icon: <Icon fontSize="small">notifications_active</Icon>,
    route: '/alarms',
    component: <Alarm />,
  },
  {
    type: 'collapse',
    name: 'Login',
    key: 'sign-in',
    icon: <Icon fontSize="small">login</Icon>,
    route: '/authentication/sign-in',
    component: <SignIn />,
  },
  {
    type: 'collapse',
    name: 'Sign Up',
    key: 'sign-up',
    icon: <Icon fontSize="small">person_add_alt_1</Icon>,
    route: '/authentication/sign-up',
    component: <SignUp />,
  },
];

export default routes;
