import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import Sidenav from 'examples/Sidenav';
import theme from 'assets/theme';
import themeDark from 'assets/theme-dark';
import routes from 'routes';
import { useMaterialUIController, setMiniSidenav } from 'context';

import brandWhite from 'assets/images/logo-ct.png';
import brandDark from 'assets/images/logo-ct-dark.png';

import ModifyPost from 'layouts/modifypost';
import PostDetail from 'layouts/postdetail';

import 'styles/app.css';

export default function App() {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, layout, transparentSidenav, whiteSidenav, darkMode } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const { pathname } = useLocation();
  const isAuthRoute = pathname.startsWith('/authentication');

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  const menuRoutes = routes.map((route) => (
    <Route key={route.key} path={route.route} element={route.component} />
  ));

  return (
    <ThemeProvider theme={darkMode ? themeDark : theme}>
      <CssBaseline />
      <div className="gh-shell">
        {layout === 'dashboard' && !isAuthRoute && (
          <Sidenav
            color="info"
            brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
            brandName="SNS Service"
            routes={routes}
            onMouseEnter={handleOnMouseEnter}
            onMouseLeave={handleOnMouseLeave}
          />
        )}
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

