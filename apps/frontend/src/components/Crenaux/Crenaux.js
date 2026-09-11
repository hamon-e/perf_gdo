import React,{ useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { ACCESS_TOKEN_NAME, API_BASE_URL, RESTAURANT_ID } from '../../constants/apiConstants';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import './Crenaux.css';
import deleteProd from '../../delete.svg';
import modifyProd from '../../edit.svg';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import CustomNoResultsOverlay from '../DataGrid/CustomNoResultsOverlay.js'

import Typography from '@mui/material/Typography';

import Slider from '@mui/material/Slider';

import Grid from '@mui/material/Grid';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import Checkbox from '@mui/material/Checkbox';
import Select from '@mui/material/Select';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';

import InboxIcon from '@mui/icons-material/Inbox';
import DraftsIcon from '@mui/icons-material/Drafts';

import Skeleton from '@mui/material/Skeleton';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import Autocomplete from '@mui/material/Autocomplete';

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';

import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

import {
  DataGrid,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
} from '@mui/x-data-grid';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import PropTypes from 'prop-types';
import {Context, useContextObject} from '../Context/Context';

import { styled } from '@mui/material/styles';

import FullCalendar from '@fullcalendar/react' // must go before plugins
import dayGridPlugin from '@fullcalendar/daygrid' // a plugin!

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';


import { ColorPicker, createColor } from "mui-color";

function Crenaux(props) {
    const {isAdminHook, userHook, restaurantHook, headerTitleHook} = useContextObject();
    const [headerTitle, setHeaderTitle] = headerTitleHook;

  const [crenaux, setCrenaux] = React.useState([]);
  const [crenauType, setCrenauType] = React.useState([]);

  const [open, setOpen] = React.useState(false);
  const [newCrenaux, setNewCrenaux] = React.useState('');
  const [newCrenauType, setNewCrenauType] = React.useState('');

  const [openNewType, setOpenNewType] = React.useState(false);
  const [newCrenauTypeName, setNewCrenauTypeName] = React.useState('');

    function handleAddNewType() {
        setOpenNewType(true)
    }

    function handleCloseNewType() {
        setOpenNewType(false)
    }


    function handleNewCrenauxChange(event) {
        setNewCrenaux(event.target.value)
    }

    function handleNewCrenauTypeNameChange(event) {
        setNewCrenauTypeName(event.target.value)
    }

    function handleNewCrenauTypeChange(event) {
        setNewCrenauType(event.target.value)
    }


    const fabStyle = {
        position: 'absolute',
        bottom: 16,
        right: 16,
    };

  const handleClose = () => {
    setOpen(false);
  };

    function handleAdd(event) {
        setOpen(true)
    }

    async function handleAddCrenaux() {
        setOpen(false);
        const payload = {
            cron: newCrenaux,
            type_id: newCrenauType
        }

        var response = await axios.post(API_BASE_URL+'/crenau', payload, { headers: { 'Authorization': "bearer "+localStorage.getItem(ACCESS_TOKEN_NAME) }})
        refreshCrenaux()
    }

    async function handleAddCrenauType() {
        setOpenNewType(false);
        const payload = {
            name: newCrenauTypeName,
        }

        var response = await axios.post(API_BASE_URL+'/crenautype', payload, { headers: { 'Authorization': "bearer "+localStorage.getItem(ACCESS_TOKEN_NAME) }})
        refreshCrenauType()
    }


    async function refreshCrenaux() {
        var response = await axios.get(API_BASE_URL+'/crenaux', { headers: { 'Authorization': "bearer "+localStorage.getItem(ACCESS_TOKEN_NAME) }})
        setCrenaux(response.data)
    }

    async function refreshCrenauType() {
        var response = await axios.get(API_BASE_URL+'/crenautype', { headers: { 'Authorization': "bearer "+localStorage.getItem(ACCESS_TOKEN_NAME) }})
        setCrenauType(response.data)
    }



       
    useEffect(() => {
        async function start() {
            await Promise.all([refreshCrenaux(), refreshCrenauType()])
        }
        start()
        setHeaderTitle("Crenaux")
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return(
        <div className="crenaux">

            <Box sx={{ flexGrow: 1 }} sx={{ flexGrow: 1, width: '85%', marginLeft: 'auto', marginRight: 'auto', paddingTop: '40px' }}>

                <Grid container spacing={2}>

                    <Grid item xs={10}>
                        <List>
                            { crenaux.map((e) => 
                                <ListItem disablePadding>
                                    <ListItemButton>
                                        <ListItemIcon>
                                            <InboxIcon />
                                        </ListItemIcon>
                                        <ListItemText primary={e} />
                                    </ListItemButton>
                                </ListItem>
                            )}
                            </List>


                        </Grid>
                        </Grid>
                    </Box>

    <Fab sx={fabStyle} aria-label='Add' color='primary'> <IconButton size="large" onClick={handleAdd} > <AddIcon /> </IconButton> </Fab>

        <Dialog open={open} onClose={handleClose} >
            <DialogTitle id="alert-dialog-title"> {"Editer"} </DialogTitle>
            <DialogContent>
                <Box sx={{ flexGrow: 1 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={10}>
                            <Box sx={{ width: '25ch' }} component="form" >
                                <div>
                                    <TextField fullWidth 
                                    value={newCrenaux}
                                    label="Cron"
                                    onChange={handleNewCrenauxChange}
                                />
                                </div>
                                <div>

                                    <TextField fullWidth select 
                                    value={newCrenauType}
                                    label="Crenau Type"
                                    onChange={handleNewCrenauTypeChange}
                                >
                                        { [ ...crenauType ].map((x) => <MenuItem value={x.id}>{x.name}</MenuItem>) }
                                    </TextField>
                                </div>

                                <div>
    <Fab aria-label='Add' color='primary'> <IconButton size="large" onClick={handleAddNewType} > <AddIcon /> </IconButton> </Fab>
</div>
                                </Box>

                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button variant="contained" onClick={handleAddCrenaux}>Ajouter</Button>
                </DialogActions>
            </Dialog>

        <Dialog open={openNewType} onClose={handleCloseNewType} >
            <DialogTitle id="alert-dialog-title"> {"Add New Type"} </DialogTitle>
            <DialogContent>
                <Box sx={{ flexGrow: 1 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={10}>
                            <Box sx={{ width: '25ch' }} component="form" >
                                <div>
                                    <TextField fullWidth 
                                    value={newCrenauTypeName}
                                    label="Cron"
                                    onChange={handleNewCrenauTypeNameChange}
                                />
                                </div>
                                </Box>

                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseNewType}>Cancel</Button>
                    <Button variant="contained" onClick={handleAddCrenauType}>Ajouter</Button>
                </DialogActions>
            </Dialog>




           </div> 
    )
}

export default withRouter(Crenaux);
