import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlined';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import HistoryIcon from '@mui/icons-material/History';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutlined';
import type { SvgIconComponent } from '@mui/icons-material';

export interface NavigationItem {
  label: string;
  path: string;
  icon: SvgIconComponent;
}

export const memberItems: NavigationItem[] = [
  { label: 'Accueil', path: '/dashboard', icon: HomeOutlinedIcon },
  { label: 'Séance', path: '/home', icon: AddCircleOutlineIcon },
  { label: 'Historique', path: '/historique', icon: HistoryIcon },
];

const adminMenuItems: NavigationItem[] = [
  { label: 'Utilisateurs', path: '/users', icon: PeopleOutlineIcon },
  { label: 'Groupes', path: '/user-groups', icon: GroupsOutlinedIcon },
  { label: 'Topo', path: '/listevoies', icon: FormatListNumberedIcon },
];

export const adminItems = [...memberItems, ...adminMenuItems];
export { adminMenuItems };
