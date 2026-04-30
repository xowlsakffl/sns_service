import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import theme from 'assets/theme';
import themeDark from 'assets/theme-dark';
import routes from 'routes';
import { useMaterialUIController } from 'context';

import ModifyPost from 'layouts/modifypost';
import PostDetail from 'layouts/postdetail';

import 'styles/app.css';

export default function App() {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;
  const { pathname } = useLocation();

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  const menuRoutes = routes.map((route) => (
    <Route key={route.key} path={route.route} element={route.component} />
  ));

  return (
    <ThemeProvider theme={darkMode ? themeDark : theme}>
      <CssBaseline />
      <div className="gh-shell">
        <Routes>
          {menuRoutes}
          <Route path="/post-detail" element={<PostDetail />} />
          <Route path="/modify-post" element={<ModifyPost />} />
          <Route path="/" element={<Navigate to="/feed" replace />} />
          <Route path="*" element={<Navigate to="/feed" replace />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}

