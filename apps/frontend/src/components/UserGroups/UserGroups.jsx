import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link as RouterLink } from 'react-router-dom';

import { ACCESS_TOKEN_NAME, API_BASE_URL } from '../../constants/apiConstants';
import { useContextObject } from '../Context/Context';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CloseIcon from '@mui/icons-material/Close';

const authorization = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}` },
});

function displayName(user) {
  return `${user.name || ''} ${user.surname || ''}`.trim() || user.email;
}

export default function UserGroups() {
  const { headerTitleHook, showBarHook, errorMessageHook } = useContextObject();
  const [, setHeaderTitle] = headerTitleHook;
  const [, setShowBar] = showBarHook;
  const [, setErrorMessage] = errorMessageHook;
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [assignGroupId, setAssignGroupId] = useState(null);
  const [assignUserId, setAssignUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/user-groups`);
      setGroups(response.data);
    } catch (error) {
      setErrorMessage(error.response?.data?.detail || 'Impossible de charger les groupes.');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/`, authorization());
      setUsers(response.data);
    } catch (error) {
      setErrorMessage(error.response?.data?.detail || 'Impossible de charger les utilisateurs.');
    }
  };

  useEffect(() => {
    setShowBar(true);
    setHeaderTitle('Groupes utilisateurs');
    loadGroups();
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setHeaderTitle, setShowBar]);

  const membersByGroup = useMemo(() => users.reduce((acc, user) => {
    if (user.group_id != null) acc[user.group_id] = (acc[user.group_id] || 0) + 1;
    return acc;
  }, {}), [users]);

  const assignGroup = groups.find((group) => group.id === assignGroupId) || null;
  const candidateUsers = useMemo(() => {
    if (!assignGroupId) return [];
    return users
      .filter((user) => user.group_id !== assignGroupId)
      .slice()
      .sort((a, b) => displayName(a).localeCompare(displayName(b), 'fr'));
  }, [assignGroupId, users]);

  const createGroup = async (event) => {
    event.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/user-groups`, { name: newName.trim() }, authorization());
      setGroups((current) => [...current, response.data].sort((a, b) => a.name.localeCompare(b.name, 'fr')));
      setNewName('');
    } catch (error) {
      setErrorMessage(error.response?.data?.detail || 'Impossible de créer le groupe.');
    } finally {
      setSaving(false);
    }
  };

  const saveRename = async (group) => {
    if (!editingName.trim() || editingName.trim() === group.name) {
      setEditingId(null);
      return;
    }
    setSaving(true);
    try {
      const response = await axios.put(`${API_BASE_URL}/user-groups/${group.id}`, { name: editingName.trim() }, authorization());
      setGroups((current) => current.map((item) => item.id === group.id ? response.data : item).sort((a, b) => a.name.localeCompare(b.name, 'fr')));
      setEditingId(null);
    } catch (error) {
      setErrorMessage(error.response?.data?.detail || 'Impossible de renommer le groupe.');
    } finally {
      setSaving(false);
    }
  };

  const attachUser = async () => {
    if (!assignGroupId || !assignUserId) return;
    setSaving(true);
    try {
      const response = await axios.put(`${API_BASE_URL}/users/${assignUserId}/group`, { group_id: assignGroupId }, authorization());
      setUsers((current) => current.map((user) => user.id === Number(assignUserId) ? response.data : user));
      setAssignGroupId(null);
      setAssignUserId('');
    } catch (error) {
      setErrorMessage(error.response?.data?.detail || "Impossible de rattacher l'utilisateur au groupe.");
    } finally {
      setSaving(false);
    }
  };

  const closeAssign = () => {
    setAssignGroupId(null);
    setAssignUserId('');
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 900, mx: 'auto', p: { xs: 2, md: 4 } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 850 }}>Groupes utilisateurs</Typography>
          <Typography color="text.secondary">Créez, renommez les groupes et rattachez-y les adhérents.</Typography>
        </Box>
        <Button component={RouterLink} to="/users" variant="outlined">Voir les utilisateurs</Button>
      </Stack>

      <Paper component="form" onSubmit={createGroup} elevation={0} sx={{ p: 2.5, mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Typography sx={{ mb: 1.5, fontWeight: 750 }}>Nouveau groupe</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
          <TextField
            label="Nom du groupe"
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            fullWidth
            required
            disabled={saving}
            InputProps={{ startAdornment: <InputAdornment position="start"><GroupOutlinedIcon /></InputAdornment> }}
          />
          <Button type="submit" variant="contained" startIcon={<AddIcon />} disabled={saving || !newName.trim()} sx={{ minWidth: 130, backgroundColor: '#1f6b45' }}>Créer</Button>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography sx={{ fontWeight: 750 }}>Groupes existants ({groups.length})</Typography>
        </Box>
        {loading ? (
          <Box sx={{ minHeight: 220, display: 'grid', placeItems: 'center' }}><CircularProgress /></Box>
        ) : groups.length === 0 ? (
          <Box sx={{ py: 7, textAlign: 'center' }}><GroupOutlinedIcon sx={{ fontSize: 44, color: 'text.disabled' }} /><Typography color="text.secondary">Aucun groupe créé pour le moment.</Typography></Box>
        ) : (
          <Stack divider={<Box sx={{ borderTop: '1px solid', borderColor: 'divider' }} />}>
            {groups.map((group) => (
              <Box key={group.id} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <GroupOutlinedIcon sx={{ color: '#1f6b45' }} />
                {editingId === group.id ? (
                  <TextField
                    value={editingName}
                    onChange={(event) => setEditingName(event.target.value)}
                    onKeyDown={(event) => { if (event.key === 'Enter') saveRename(group); }}
                    size="small"
                    autoFocus
                    fullWidth
                    disabled={saving}
                  />
                ) : <Typography sx={{ flexGrow: 1, fontWeight: 650 }}>{group.name}</Typography>}
                {editingId === group.id ? (
                  <Stack direction="row" spacing={0.5}>
                    <IconButton aria-label={`Enregistrer ${group.name}`} onClick={() => saveRename(group)} disabled={saving || !editingName.trim()} color="primary"><SaveOutlinedIcon /></IconButton>
                    <IconButton aria-label="Annuler le renommage" onClick={() => setEditingId(null)} disabled={saving}><CloseIcon /></IconButton>
                  </Stack>
                ) : (
                  <>
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`${membersByGroup[group.id] || 0} membre${(membersByGroup[group.id] || 0) > 1 ? 's' : ''}`}
                      sx={{ color: '#1f6b45', borderColor: '#cfe3d8' }}
                    />
                    <IconButton
                      aria-label={`Rattacher un utilisateur à ${group.name}`}
                      onClick={() => { setAssignGroupId(group.id); setAssignUserId(''); }}
                    >
                      <PersonAddAltOutlinedIcon />
                    </IconButton>
                    <IconButton aria-label={`Renommer ${group.name}`} onClick={() => { setEditingId(group.id); setEditingName(group.name); }}><EditOutlinedIcon /></IconButton>
                  </>
                )}
              </Box>
            ))}
          </Stack>
        )}
      </Paper>

      <Dialog open={Boolean(assignGroupId)} onClose={closeAssign} fullWidth maxWidth="xs" aria-labelledby="assign-user-title">
        <DialogTitle id="assign-user-title" sx={{ fontWeight: 800 }}>Rattacher un utilisateur</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              Groupe sélectionné : <Box component="span" sx={{ fontWeight: 700, color: '#1f6b45' }}>{assignGroup?.name}</Box>
            </Typography>
            <TextField
              select
              label="Utilisateur"
              value={assignUserId}
              onChange={(event) => setAssignUserId(event.target.value)}
              fullWidth
              required
              autoFocus
              disabled={saving}
              helperText={candidateUsers.length === 0 ? 'Tous les utilisateurs sont déjà dans ce groupe.' : undefined}
            >
              {candidateUsers.map((user) => (
                <MenuItem key={user.id} value={String(user.id)}>
                  {displayName(user)}{user.group ? ` — ${user.group.name}` : ' — sans groupe'}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeAssign} disabled={saving}>Annuler</Button>
          <Button onClick={attachUser} variant="contained" startIcon={<PersonAddAltOutlinedIcon />} disabled={saving || !assignUserId} sx={{ backgroundColor: '#1f6b45' }}>Rattacher</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
