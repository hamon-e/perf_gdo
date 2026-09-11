import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import type { Theme } from '@mui/material/styles';

import { memberItems } from './navigationItems';

interface MobileNavigationProps {
  onNavigate: (path: string) => void;
  pathname: string;
  theme: Theme;
}

export default function MobileNavigation({ onNavigate, pathname, theme }: MobileNavigationProps) {
  const selectedPath = memberItems.some(({ path }) => path === pathname) ? pathname : false;

  return (
    <BottomNavigation
      showLabels
      value={selectedPath}
      onChange={(_, path: string) => onNavigate(path)}
      sx={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: theme.zIndex.appBar,
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      {memberItems.map(({ icon: Icon, label, path }) => (
        <BottomNavigationAction key={path} label={label} value={path} icon={<Icon />} />
      ))}
    </BottomNavigation>
  );
}
