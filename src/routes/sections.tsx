import { lazy, Suspense } from 'react';
import { Navigate, Outlet, useRoutes } from 'react-router-dom';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { varAlpha } from 'src/theme/styles';
import { AuthLayout } from 'src/layouts/auth';
import { DashboardLayout } from 'src/layouts/dashboard';
import Users from 'src/pages/users';
import AddFeedback from 'src/pages/add-feedback';
import UpdateFeedback from 'src/pages/update-feedback';
import { useAuth } from 'src/contexts/AuthContext';

export const HomePage = lazy(() => import('src/pages/home'));
export const SignInPage = lazy(() => import('src/pages/sign-in'));
export const SignUpPage = lazy(() => import('src/pages/sign-up'));
export const Feedbacks = lazy(() => import('src/pages/feedbacks'));

const renderFallback = (
  <Box display="flex" alignItems="center" justifyContent="center" flex="1 1 auto">
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
      }}
    />
  </Box>
);

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/sign-in" />;
  }

  return children;
}

export function Router() {
  return useRoutes([
    {
      element: (
        <DashboardLayout>
          <Suspense fallback={renderFallback}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      ),
      children: [
        {
          element: (
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          ),
          index: true,
        },
        {
          path: 'feedbacks',
          element: (
            <PrivateRoute>
              <Feedbacks />
            </PrivateRoute>
          ),
        },
        {
          path: 'add-feedback',
          element: (
            <PrivateRoute>
              <AddFeedback />
            </PrivateRoute>
          ),
        },
        {
          path: 'update-feedback/:id',
          element: (
            <PrivateRoute>
              <UpdateFeedback />
            </PrivateRoute>
          ),
        },
        {
          path: 'users',
          element: (
            <PrivateRoute>
              <Users />
            </PrivateRoute>
          ),
        },
      ],
    },
    {
      path: 'sign-in',
      element: (
        <AuthLayout>
          <SignInPage />
        </AuthLayout>
      ),
    },
    {
      path: 'sign-up',
      element: (
        <AuthLayout>
          <SignUpPage />
        </AuthLayout>
      ),
    },
  ]);
}
