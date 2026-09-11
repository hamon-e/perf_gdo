import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link as RouterLink } from 'react-router-dom';

import { ACCESS_TOKEN_NAME, API_BASE_URL } from '../../constants/apiConstants';
import { useContextObject } from '../Context/Context';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CloseIcon from '@mui/icons-material/Close';

const authorization = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}` },
});

export default function UserGroups() {
  const { headerTitleHook, showBarHook, errorMessageHook } = useContextObject();
  const [, setHeaderTitle] = headerTitleHook;
  const [, setShowBar] = showBarHook;
  const [, setErrorMessage] = errorMessageHook;
  const [groups, setGroups] = useState([]);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
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

  useEffect(() => {
    setShowBar(true);
    setHeaderTitle('Groupes utilisateurs');
    loadGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setHeaderTitle, setShowBar]);

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

  return (
    <Box sx={{ width: '100%', maxWidth: 900, mx: 'auto', p: { xs: 2, md: 4 } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 850 }}>Groupes utilisateurs</Typography>
          <Typography color="text.secondary">Créez et renommez les groupes proposés aux adhérents.</Typography>
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
                  <IconButton aria-label={`Renommer ${group.name}`} onClick={() => { setEditingId(group.id); setEditingName(group.name); }}><EditOutlinedIcon /></IconButton>
                )}
              </Box>
            ))}
          </Stack>
        )}
      </Paper>
    </Box>
  );
}
