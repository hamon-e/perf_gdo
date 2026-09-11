import type { ComponentType } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

/** Temporary compatibility adapter while legacy screens move from router props to hooks. */
export default function withRouter(Component: ComponentType<any>) {
  return function ComponentWithRouterProps(props: Record<string, unknown>) {
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();

    return (
      <Component
        {...props}
        history={{
          push: (path: string) => navigate(path),
          replace: (path: string) => navigate(path, { replace: true }),
        }}
        location={location}
        match={{ params }}
      />
    );
  };
}
