import Box from '@mui/material/Box';
import CloseIcon from '@mui/icons-material/Close';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import LogoutIcon from '@mui/icons-material/Logout';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';

import type { NavigationItem } from './navigationItems';

export const DRAWER_WIDTH = 264;

interface SideNavigationProps {
  desktop: boolean;
  items: NavigationItem[];
  onClose: () => void;
  onLogout: () => void;
  open: boolean;
  pathname: string;
}

export default function SideNavigation({
  desktop,
  items,
  onClose,
  onLogout,
  open,
  pathname,
}: SideNavigationProps) {
  return (
    <Drawer
      variant={desktop ? 'persistent' : 'temporary'}
      anchor="left"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Toolbar sx={{ minHeight: 72, px: 2.5 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 1.4 }}>
              GDO
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
              Carnet de grimpe
            </Typography>
          </Box>
          <IconButton aria-label="Fermer le menu" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Toolbar>
        <Divider />
        <List sx={{ px: 1.5, py: 2 }}>
          {items.map(({ icon: Icon, label, path }) => (
            <ListItem key={path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={RouterLink}
                to={path}
                selected={pathname === path}
                onClick={desktop ? undefined : onClose}
                sx={{ borderRadius: 2, '&.Mui-selected': { color: '#1f6b45', backgroundColor: '#e5f3eb' } }}
              >
                <ListItemIcon sx={{ minWidth: 42, color: 'inherit' }}><Icon /></ListItemIcon>
                <ListItemText primary={label} slotProps={{ primary: { sx: { fontWeight: 600 } } }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Box sx={{ mt: 'auto', p: 1.5 }}>
          <ListItemButton onClick={onLogout} sx={{ borderRadius: 2 }}>
            <ListItemIcon sx={{ minWidth: 42 }}><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Déconnexion" />
          </ListItemButton>
        </Box>
      </Box>
    </Drawer>
  );
}
