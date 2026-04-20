import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import CreateRoundedIcon from '@mui/icons-material/CreateRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';

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
    icon: <HomeRoundedIcon fontSize="small" />,
    route: '/feed',
    component: <Feed />,
  },
  {
    type: 'collapse',
    name: 'Write',
    key: 'post',
    icon: <CreateRoundedIcon fontSize="small" />,
    route: '/post',
    component: <Post />,
  },
  {
    type: 'collapse',
    name: 'My Posts',
    key: 'my-posts',
    icon: <DescriptionRoundedIcon fontSize="small" />,
    route: '/my-post',
    component: <MyPosts />,
  },
  {
    type: 'collapse',
    name: 'Alarms',
    key: 'alarms',
    icon: <NotificationsRoundedIcon fontSize="small" />,
    route: '/alarms',
    component: <Alarm />,
  },
  {
    type: 'collapse',
    name: 'Login',
    key: 'sign-in',
    icon: <LoginRoundedIcon fontSize="small" />,
    route: '/authentication/sign-in',
    component: <SignIn />,
  },
  {
    type: 'collapse',
    name: 'Sign Up',
    key: 'sign-up',
    icon: <PersonAddRoundedIcon fontSize="small" />,
    route: '/authentication/sign-up',
    component: <SignUp />,
  },
];

export default routes;
