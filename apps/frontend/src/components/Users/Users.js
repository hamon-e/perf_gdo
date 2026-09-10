import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

import { ACCESS_TOKEN_NAME, API_BASE_URL } from '../../constants/apiConstants';
import { useContextObject } from '../Context/Context';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';

const authorization = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}` },
});

function initials(user) {
  const value = `${user.name || ''} ${user.surname || ''}`.trim() || user.email;
  return value.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

function StatCard({ icon, value, label }) {
  return (
    <Card elevation={0} sx={{ height: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
      <CardContent>
        <Box sx={{ color: '#1f6b45', mb: 1 }}>{icon}</Box>
        <Typography variant="h4" sx={{ fontWeight: 850 }}>{value}</Typography>
        <Typography color="text.secondary">{label}</Typography>
      </CardContent>
    </Card>
  );
}

export default function Users() {
  const { headerTitleHook, showBarHook, errorMessageHook } = useContextObject();
  const [, setHeaderTitle] = headerTitleHook;
  const [, setShowBar] = showBarHook;
  const [, setErrorMessage] = errorMessageHook;
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/users/`, authorization());
      setUsers(response.data);
    } catch (error) {
      setErrorMessage(error.response?.data?.detail || 'Impossible de charger les utilisateurs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setShowBar(true);
    setHeaderTitle('Utilisateurs');
    loadUsers();
    // loadUsers is stable for the lifetime of this screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setHeaderTitle, setShowBar]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;
    return users.filter((user) => `${user.name} ${user.surname} ${user.email}`.toLowerCase().includes(query));
  }, [search, users]);

  const adminCount = users.filter((user) => user.role_id === 0).length;

  return (
    <Box sx={{ width: '100%', maxWidth: 1180, mx: 'auto', p: { xs: 2, md: 4 } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 850 }}>Utilisateurs</Typography>
          <Typography color="text.secondary">Consultez les comptes et leurs niveaux d’accès.</Typography>
        </Box>
        <Button startIcon={<RefreshIcon />} variant="outlined" onClick={loadUsers} disabled={loading}>Actualiser</Button>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
        <StatCard icon={<PeopleOutlineIcon />} value={users.length} label="comptes au total" />
        <StatCard icon={<PersonOutlineIcon />} value={users.length - adminCount} label="adhérents" />
        <StatCard icon={<AdminPanelSettingsOutlinedIcon />} value={adminCount} label="administrateurs" />
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <TextField
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Rechercher un nom ou un e-mail"
            size="small"
            fullWidth
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
          />
        </Box>

        {loading ? (
          <Box sx={{ minHeight: 280, display: 'grid', placeItems: 'center' }}><CircularProgress /></Box>
        ) : filteredUsers.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <PeopleOutlineIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
            <Typography sx={{ mt: 1, fontWeight: 700 }}>Aucun utilisateur trouvé</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8faf9' }}>
                  <TableCell>Utilisateur</TableCell>
                  <TableCell>E-mail</TableCell>
                  <TableCell align="right">Rôle</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ width: 38, height: 38, bgcolor: user.role_id === 0 ? '#1f6b45' : '#dce9e1', color: user.role_id === 0 ? 'white' : '#1f6b45', fontSize: 14, fontWeight: 800 }}>
                          {initials(user)}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 700 }}>{`${user.name || ''} ${user.surname || ''}`.trim() || 'Utilisateur'}</Typography>
                          <Typography variant="caption" color="text.secondary">ID {user.id}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell align="right">
                      <Chip
                        size="small"
                        label={user.role_id === 0 ? 'Administrateur' : 'Adhérent'}
                        sx={{ fontWeight: 700, color: user.role_id === 0 ? '#155b39' : '#5b6470', backgroundColor: user.role_id === 0 ? '#dff4e8' : '#edf0f2' }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}
