import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

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
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SearchIcon from '@mui/icons-material/Search';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';

const authorization = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}` },
});

// Cotations are stored as numbers for sorting and statistics.  Keep the mapping
// explicit here so that the management UI always speaks the climbers' notation.
const gradeSuffixes = [
  [0.25, 'a'],
  [0.35, 'a+'],
  [0.5, 'b'],
  [0.6, 'b+'],
  [0.75, 'c'],
  [0.85, 'c+'],
];

// Palette historically available while building a wall topo.  Keep the values
// as hexadecimal colours so they can also be used by the native colour input.
const TOPO_PRESET_COLORS = [
  { label: 'Rouge', value: '#ff0000' },
  { label: 'Bleu', value: '#0000ff' },
  { label: 'Vert', value: '#00ff00' },
  { label: 'Jaune', value: '#ffff00' },
  { label: 'Cyan', value: '#00ffff' },
  { label: 'Gris', value: '#808080' },
  { label: 'Orange', value: '#ffa500' },
  { label: 'Violet', value: '#800080' },
  { label: 'Noir', value: '#000000' },
  { label: 'Blanc', value: '#ffffff' },
  { label: 'Rose', value: '#ffc0cb' },
  { label: 'Bleu foncé', value: '#00008b' },
];

const isHexColor = (color) => /^#[0-9a-f]{6}$/i.test(color || '');

const emptyForm = { id: null, couloir_id: 1, difficulty: '5a', color: '#e53935' };

export function formatDifficulty(value) {
  const difficulty = Number(value);
  if (!Number.isFinite(difficulty)) return '—';

  const grade = gradeSuffixes.find(([decimal]) => (
    Math.abs((difficulty - Math.floor(difficulty)) - decimal) < 0.001
  ));

  return grade ? `${Math.floor(difficulty)}${grade[1]}` : String(difficulty).replace('.', ',');
}

export function parseDifficulty(value) {
  const match = String(value).trim().toLowerCase().match(/^(\d+)(a|b|c)(\+)?$/);
  if (!match) return null;

  const [, level, letter, plus] = match;
  const suffix = `${letter}${plus || ''}`;
  const grade = gradeSuffixes.find(([, candidate]) => candidate === suffix);
  const numericLevel = Number(level);

  if (!grade || numericLevel < 3 || numericLevel > 9) return null;
  return numericLevel + grade[0];
}

function sectorForLane(lane) {
  if (lane <= 3) return 'Plexi + toit';
  if (lane <= 8) return 'Vérin gauche';
  if (lane <= 19) return 'Dévers';
  if (lane <= 22) return 'Vérin droit';
  if (lane <= 27) return 'Dalle';
  return 'Mur de 9 m';
}

const SECTORS = ['Plexi + toit', 'Vérin gauche', 'Dévers', 'Vérin droit', 'Dalle', 'Mur de 9 m'];

export function versionLabel(version) {
  const date = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(version.date));
  return `${date} · v1${version.subversion ? `.${version.subversion}` : ''}`;
}

const frDate = (value) => new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(value));

function periodLabel(version) {
  const start = version.date ? frDate(version.date) : '';
  const end = version.end_date ? frDate(version.end_date) : '';
  if (version.end_date && new Date(version.end_date) <= new Date(version.date)) return 'Période non configurée';
  if (!end) return start ? `À partir du ${start}` : 'Période non configurée';
  return `Du ${start} au ${end}`;
}

function coversDate(version, date) {
  const start = version.date ? new Date(version.date) : null;
  const end = version.end_date ? new Date(version.end_date) : null;
  return (!start || start <= date) && (!end || end > date);
}

export function findVersionAt(versions, date) {
  return versions
    .filter((version) => coversDate(version, date))
    .sort((a, b) => new Date(b.date) - new Date(a.date) || a.id - b.id)[0] || null;
}

function toDateInput(value) {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
}

export default function ListVoie() {
  const history = useHistory();
  const { headerTitleHook, showBarHook, errorMessageHook } = useContextObject();
  const [, setHeaderTitle] = headerTitleHook;
  const [, setShowBar] = showBarHook;
  const [, setErrorMessage] = errorMessageHook;
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState('');
  const [routes, setRoutes] = useState([]);
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');
  const [sortField, setSortField] = useState('couloir_id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [registeredColors, setRegisteredColors] = useState([]);
  const [calendarDate, setCalendarDate] = useState('');
  const [periodOpen, setPeriodOpen] = useState(false);
  const [periodForm, setPeriodForm] = useState({ date: '', end_date: '' });

  const showError = (error, fallback) => setErrorMessage(error.response?.data?.detail || fallback);

  const loadRoutes = async (versionId) => {
    if (!versionId) {
      setRoutes([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/voies?version_id=${versionId}`, authorization());
      setRoutes(response.data);
    } catch (error) {
      showError(error, 'Impossible de charger les voies.');
    } finally {
      setLoading(false);
    }
  };

  const loadVersions = async (preferredVersionId = null) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/versionvoie`, authorization());
      setVersions(response.data);
      const preferredVersion = response.data.find((version) => Number(version.id) === Number(preferredVersionId));
      const nextVersion = preferredVersion?.id || response.data.find((version) => version.active)?.id || response.data[0]?.id || '';
      setSelectedVersion(nextVersion);
      await loadRoutes(nextVersion);
    } catch (error) {
      showError(error, 'Impossible de charger les versions du mur.');
      setLoading(false);
    }
  };

  const loadRegisteredColors = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/colors`, authorization());
      setRegisteredColors(response.data.filter(isHexColor));
    } catch (_) {
      // The palette remains usable offline or with an older API thanks to the
      // built-in topo colours.
    }
  };

  useEffect(() => {
    setShowBar(true);
    setHeaderTitle('Gestion des voies');
    loadVersions();
    loadRegisteredColors();
    // Initial loading only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setHeaderTitle, setShowBar]);

  const filteredRoutes = useMemo(() => {
    const query = search.trim().toLowerCase();
    let result = routes;
    if (query) {
      result = result.filter((route) => [
        route.couloir_id,
        formatDifficulty(route.difficulty),
        route.color,
        sectorForLane(route.couloir_id),
      ].join(' ').toLowerCase().includes(query));
    }
    if (sectorFilter) result = result.filter((route) => sectorForLane(route.couloir_id) === sectorFilter);
    const direction = sortDirection === 'asc' ? 1 : -1;
    result = [...result].sort((a, b) => {
      if (sortField === 'difficulty') return direction * (a.difficulty - b.difficulty || a.couloir_id - b.couloir_id);
      if (sortField === 'sector') return direction * (sectorForLane(a.couloir_id).localeCompare(sectorForLane(b.couloir_id), 'fr') || a.couloir_id - b.couloir_id);
      return direction * (a.couloir_id - b.couloir_id);
    });
    return result;
  }, [routes, search, sectorFilter, sortField, sortDirection]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection((direction) => (direction === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const colorOptions = useMemo(() => {
    const seen = new Set();
    return [...TOPO_PRESET_COLORS, ...registeredColors.map((value) => ({ label: 'Couleur enregistrée', value }))]
      .filter(({ value }) => {
        const normalized = value.toLowerCase();
        if (seen.has(normalized)) return false;
        seen.add(normalized);
        return true;
      });
  }, [registeredColors]);

  const openCreate = () => {
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (route) => {
    setForm({ id: route.id, couloir_id: route.couloir_id, difficulty: formatDifficulty(route.difficulty), color: route.color });
    setDialogOpen(true);
  };

  const saveRoute = async () => {
    const difficulty = parseDifficulty(form.difficulty);
    if (!selectedVersion || !form.couloir_id || !form.difficulty || !isHexColor(form.color)) {
      setErrorMessage('Renseignez le couloir, la cotation et une couleur hexadécimale valide.');
      return;
    }
    if (difficulty === null) {
      setErrorMessage('Utilisez une cotation entre 3a et 9c+ (par exemple 5a ou 6b+).');
      return;
    }
    setSaving(true);
    try {
      await axios.post(`${API_BASE_URL}/voie`, {
        ...(form.id ? { id: form.id } : {}),
        versionvoie_id: Number(selectedVersion),
        couloir_id: Number(form.couloir_id),
        difficulty,
        color: form.color,
      }, authorization());
      setRegisteredColors((colors) => isHexColor(form.color) && !colors.some((color) => color.toLowerCase() === form.color.toLowerCase())
        ? [...colors, form.color]
        : colors);
      setDialogOpen(false);
      await loadRoutes(selectedVersion);
    } catch (error) {
      showError(error, "Impossible d'enregistrer la voie.");
    } finally {
      setSaving(false);
    }
  };

  const deleteRoute = async (route) => {
    if (!window.confirm(`Supprimer la voie ${formatDifficulty(route.difficulty)} du couloir ${route.couloir_id} ?`)) return;
    try {
      await axios.delete(`${API_BASE_URL}/voie?id=${route.id}`, authorization());
      await loadRoutes(selectedVersion);
    } catch (error) {
      showError(error, 'Impossible de supprimer la voie.');
    }
  };

  const createTopo = async () => {
    if (!window.confirm('Créer un nouveau topo vide ? Configurez ensuite ses dates de validité pour le rendre actif.')) return;
    setSaving(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/versionvoie`, { date: new Date().toISOString() }, authorization());
      await loadVersions(response.data.id);
    } catch (error) {
      showError(error, 'Impossible de créer un topo.');
    } finally {
      setSaving(false);
    }
  };

  const createRevision = async () => {
    if (!selectedVersion) return;
    if (!window.confirm('Créer une révision de ce topo ? Toutes les voies seront reprises et pourront être modifiées séparément.')) return;
    setSaving(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/versionvoie/${selectedVersion}/subversion`, {}, authorization());
      await loadVersions(response.data.id);
    } catch (error) {
      showError(error, 'Impossible de créer la révision.');
    } finally {
      setSaving(false);
    }
  };

  const downloadTopo = async () => {
    if (!selectedVersion) return;
    setSaving(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/topo.pdf?version_id=${selectedVersion}`, {
        ...authorization(),
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      const version = versions.find((item) => String(item.id) === String(selectedVersion));
      const versionDate = new Date(version?.date);
      const dateForFilename = Number.isNaN(versionDate.getTime())
        ? selectedVersion
        : versionDate.toISOString().slice(0, 10);
      link.href = url;
      link.download = `topo-voies-${dateForFilename}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      showError(error, "Impossible d'exporter le topo.");
    } finally {
      setSaving(false);
    }
  };

  const viewWallAt = (value) => {
    setCalendarDate(value);
    if (!value) return;
    const target = findVersionAt(versions, new Date(`${value}T12:00:00`));
    if (!target) {
      setSelectedVersion('');
      setRoutes([]);
      setErrorMessage(`Aucune version du mur n'était active au ${frDate(`${value}T12:00:00`)}.`);
      return;
    }
    setSelectedVersion(target.id);
    loadRoutes(target.id);
  };

  const openPeriodDialog = () => {
    const version = versions.find((item) => String(item.id) === String(selectedVersion));
    setPeriodForm({
      date: toDateInput(version?.date) || toDateInput(new Date().toISOString()),
      end_date: toDateInput(version?.end_date),
    });
    setPeriodOpen(true);
  };

  const savePeriod = async () => {
    if (!selectedVersion || !periodForm.date) {
      setErrorMessage('Renseignez une date de début de validité.');
      return;
    }
    setSaving(true);
    try {
      await axios.put(`${API_BASE_URL}/versionvoie/${selectedVersion}`, {
        date: new Date(`${periodForm.date}T00:00:00`).toISOString(),
        end_date: periodForm.end_date ? new Date(`${periodForm.end_date}T23:59:59`).toISOString() : null,
      }, authorization());
      setPeriodOpen(false);
      await loadVersions(selectedVersion);
    } catch (error) {
      showError(error, "Impossible d'enregistrer la période de validité.");
    } finally {
      setSaving(false);
    }
  };

  const selectedVersionData = versions.find((version) => String(version.id) === String(selectedVersion)) || null;
  const currentActiveId = findVersionAt(versions, new Date())?.id ?? null;

  return (
    <Box sx={{ width: '100%', maxWidth: 1240, mx: 'auto', p: { xs: 2, md: 4 } }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 850 }}>Voies du mur</Typography>
          <Typography color="text.secondary">Créez et mettez à jour les voies disponibles par couloir.</Typography>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Button variant="contained" startIcon={<InsightsOutlinedIcon />} onClick={() => history.push(`/analyse-mur?version=${selectedVersion}`)} disabled={!selectedVersion} sx={{ backgroundColor: '#1f6b45', '&:hover': { backgroundColor: '#185538' } }}>Analyse du mur</Button>
          <Button variant="outlined" startIcon={<PictureAsPdfOutlinedIcon />} onClick={downloadTopo} disabled={!selectedVersion || saving}>Exporter le topo PDF</Button>
          <Button variant="outlined" startIcon={<AccountTreeOutlinedIcon />} onClick={createTopo} disabled={saving}>Nouveau topo</Button>
          <Button variant="outlined" startIcon={<AccountTreeOutlinedIcon />} onClick={createRevision} disabled={!selectedVersion || saving}>Nouvelle révision</Button>
          <Button variant="outlined" startIcon={<EventOutlinedIcon />} onClick={openPeriodDialog} disabled={!selectedVersion || saving}>Configurer les dates</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} disabled={!selectedVersion} sx={{ backgroundColor: '#1f6b45' }}>Ajouter une voie</Button>
        </Stack>
      </Stack>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <TextField
            select
            label="Version du mur"
            size="small"
            value={selectedVersion}
            onChange={(event) => { setSelectedVersion(event.target.value); setCalendarDate(''); loadRoutes(event.target.value); }}
            sx={{ minWidth: 220 }}
          >
            {versions.map((version) => (
              <MenuItem key={version.id} value={version.id}>
                <Stack>
                  <Typography variant="body2">{versionLabel(version)}{version.id === currentActiveId ? ' · Active' : ''}</Typography>
                  <Typography variant="caption" color="text.secondary">{periodLabel(version)}</Typography>
                </Stack>
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Voir le mur au"
            type="date"
            size="small"
            value={calendarDate}
            onChange={(event) => viewWallAt(event.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 180 }}
          />
          <TextField
            placeholder="Couloir, secteur, cotation ou couleur"
            size="small"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            fullWidth
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
          />
          <TextField
            select
            label="Secteur"
            size="small"
            value={sectorFilter}
            onChange={(event) => setSectorFilter(event.target.value)}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">Tous les secteurs</MenuItem>
            {SECTORS.map((sector) => <MenuItem key={sector} value={sector}>{sector}</MenuItem>)}
          </TextField>
        </Stack>

        {selectedVersionData && (
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary">Période de validité :</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>{periodLabel(selectedVersionData)}</Typography>
            {selectedVersionData.id === currentActiveId && <Chip size="small" color="success" label="Version active" />}
            {Boolean(calendarDate) && (
              <Typography variant="caption" color="text.secondary">(version consultée au {frDate(`${calendarDate}T12:00:00`)})</Typography>
            )}
          </Stack>
        )}

        {loading ? (
          <Box sx={{ minHeight: 320, display: 'grid', placeItems: 'center' }}><CircularProgress /></Box>
        ) : filteredRoutes.length === 0 ? (
          <Box sx={{ py: 9, textAlign: 'center' }}>
            <RouteOutlinedIcon sx={{ fontSize: 52, color: 'text.disabled' }} />
            <Typography sx={{ mt: 1, fontWeight: 750 }}>Aucune voie trouvée</Typography>
            <Typography color="text.secondary">Ajoutez la première voie de cette version ou modifiez votre recherche.</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8faf9' }}>
                  <TableCell>Couleur</TableCell>
                  <TableCell sortDirection={sortField === 'couloir_id' ? sortDirection : false}>
                    <TableSortLabel active={sortField === 'couloir_id'} direction={sortField === 'couloir_id' ? sortDirection : 'asc'} onClick={() => toggleSort('couloir_id')}>Couloir</TableSortLabel>
                  </TableCell>
                  <TableCell sortDirection={sortField === 'sector' ? sortDirection : false}>
                    <TableSortLabel active={sortField === 'sector'} direction={sortField === 'sector' ? sortDirection : 'asc'} onClick={() => toggleSort('sector')}>Secteur</TableSortLabel>
                  </TableCell>
                  <TableCell sortDirection={sortField === 'difficulty' ? sortDirection : false}>
                    <TableSortLabel active={sortField === 'difficulty'} direction={sortField === 'difficulty' ? sortDirection : 'asc'} onClick={() => toggleSort('difficulty')}>Cotation</TableSortLabel>
                  </TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRoutes.map((route) => (
                  <TableRow key={route.id} hover>
                    <TableCell>
                      <Box sx={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: route.color, border: '2px solid white', boxShadow: '0 0 0 1px rgba(0,0,0,.2)' }} />
                    </TableCell>
                    <TableCell><Chip size="small" label={route.couloir_id} /></TableCell>
                    <TableCell>{sectorForLane(route.couloir_id)}</TableCell>
                    <TableCell><Typography sx={{ fontWeight: 800, color: '#1f6b45' }}>{formatDifficulty(route.difficulty)}</Typography></TableCell>
                    <TableCell align="right">
                      <Tooltip title="Modifier"><IconButton aria-label={`Modifier la voie ${route.id}`} onClick={() => openEdit(route)}><EditOutlinedIcon /></IconButton></Tooltip>
                      <Tooltip title="Supprimer"><IconButton color="error" aria-label={`Supprimer la voie ${route.id}`} onClick={() => deleteRoute(route)}><DeleteOutlineIcon /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{form.id ? 'Modifier la voie' : 'Ajouter une voie'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <TextField select label="Couloir" value={form.couloir_id} onChange={(event) => setForm({ ...form, couloir_id: event.target.value })} fullWidth>
              {[...Array(31).keys()].map((lane) => <MenuItem key={lane + 1} value={lane + 1}>Couloir {lane + 1} · {sectorForLane(lane + 1)}</MenuItem>)}
            </TextField>
            <TextField
              label="Cotation"
              value={form.difficulty}
              onChange={(event) => setForm({ ...form, difficulty: event.target.value })}
              placeholder="5a"
              helperText="Saisissez une cotation de 3a à 9c+ (par exemple 5a, 6b+ ou 7c)."
              inputProps={{ autoCapitalize: 'none', spellCheck: false }}
              fullWidth
            />
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Couleurs enregistrées</Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {colorOptions.map(({ label, value }) => {
                  const selected = form.color.toLowerCase() === value.toLowerCase();
                  return (
                    <Tooltip key={value} title={label}>
                      <IconButton
                        aria-label={`${label} ${value}`}
                        aria-pressed={selected}
                        onClick={() => setForm({ ...form, color: value })}
                        sx={{
                          width: 34,
                          height: 34,
                          backgroundColor: value,
                          border: selected ? '3px solid #1f6b45' : '1px solid rgba(0,0,0,.28)',
                          boxShadow: selected ? '0 0 0 2px white, 0 0 0 3px #1f6b45' : 'none',
                          '&:hover': { backgroundColor: value, opacity: 0.82 },
                        }}
                      />
                    </Tooltip>
                  );
                })}
              </Stack>
            </Box>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box component="input" type="color" aria-label="Couleur personnalisée de la voie" value={isHexColor(form.color) ? form.color : emptyForm.color} onChange={(event) => setForm({ ...form, color: event.target.value })} sx={{ width: 58, height: 52, p: 0.5, border: '1px solid', borderColor: 'divider', borderRadius: 1, backgroundColor: 'white', cursor: 'pointer' }} />
              <TextField label="Couleur" value={form.color} onChange={(event) => setForm({ ...form, color: event.target.value })} fullWidth />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)}>Annuler</Button>
          <Button variant="contained" onClick={saveRoute} disabled={saving} sx={{ backgroundColor: '#1f6b45' }}>{saving ? 'Enregistrement…' : 'Enregistrer'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={periodOpen} onClose={() => setPeriodOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Période de validité de la version</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <TextField
              label="Début de validité"
              type="date"
              value={periodForm.date}
              onChange={(event) => setPeriodForm({ ...periodForm, date: event.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Fin de validité"
              type="date"
              value={periodForm.end_date}
              onChange={(event) => setPeriodForm({ ...periodForm, end_date: event.target.value })}
              InputLabelProps={{ shrink: true }}
              helperText="Laissez vide pour une version encore en cours."
              fullWidth
            />
            <Typography variant="body2" color="text.secondary">
              Les adhérents verront automatiquement la version dont la période contient la date du jour.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setPeriodOpen(false)}>Annuler</Button>
          <Button variant="contained" onClick={savePeriod} disabled={saving || !periodForm.date} sx={{ backgroundColor: '#1f6b45' }}>{saving ? 'Enregistrement…' : 'Enregistrer'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
