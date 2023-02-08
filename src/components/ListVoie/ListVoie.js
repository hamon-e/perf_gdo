import React,{ useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { ACCESS_TOKEN_NAME, API_BASE_URL, RESTAURANT_ID } from '../../constants/apiConstants';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import './ListVoie.css';
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

function ListVoie(props) {
    const {isAdminHook, userHook, restaurantHook, headerTitleHook} = useContextObject();
    const [headerTitle, setHeaderTitle] = headerTitleHook;

  const [selectedNumber, setSelectedNumber] = React.useState(0);
  const [selectedColor, setSelectedColor] = React.useState(0);
  const [selectedDifficulty, setSelectedDifficulty] = React.useState(true);
  const [selectedId, setSelectedId] = React.useState(-1);

  const [selectedVersion, setSelectedVersion] = React.useState(-1);

    const [insertedRoutes, setInsertedRoutes] = React.useState([])

  const [open, setOpen] = React.useState(false);
  const [openCreate, setOpenCreate] = React.useState(false);

  const [versionvoie, setVersionVoie] = React.useState([]);
  const [voies, setVoies] = React.useState([]);

  const [createNumber, setCreateNumber] = React.useState(0);
  const [createDifficulty, setCreateDifficulty] = React.useState(0);

  const [createColor, setCreateColor] = useState();
  const [palette, setPalette] = useState({});

  const handleCreateColorChange = (value) => {
    setCreateColor(value);
  };
  const handleCreateNumberChange = (event) => {
      setCreateNumber(event.target.value)
  }
  const handleCreateDifficultyChange = (event) => {
      setCreateDifficulty(event.target.value)
  }




 const handleClickOpen = (event) => {
     const tmp = voies.find((e) => e.id == event.target.textContent)
     setSelectedId(tmp.id)
     setSelectedDifficulty(tmp.difficulty)
     setSelectedNumber(tmp.couloir_id)
     setSelectedColor(tmp.color)
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const handleCreateClose = () => {
    setOpenCreate(false);
  };

    async function refreshVoie(version=-1) {
        const tmp = version == -1 ? selectedVersion : version
        var response = await axios.get(API_BASE_URL+'/voies?version_id=' + tmp, { headers: { 'Authorization': "bearer "+localStorage.getItem(ACCESS_TOKEN_NAME) }})
        setVoies(response.data)
    }

    async function handleSelectedVersionChange(event) {
        setSelectedVersion(event.target.value)

        await refreshVoie(event.target.value)

        }

    function handleSelectedDifficultyChange(event) {
        setSelectedDifficulty(event.target.value)
    }

    function handleSelectedColorChange(event) {
        setSelectedColor(event.target.value)
    }


    function handleSelectedNumberChange(event) {
        setSelectedNumber(event.target.value)
    }

    function handleAdd(event) {
        setOpenCreate(true)
    }

    async function handleNewVersion(event) {
        const payload = {
            date: new Date()
        }
        await axios.post(API_BASE_URL+'/versionvoie', payload, { headers: { 'Authorization': "bearer "+localStorage.getItem(ACCESS_TOKEN_NAME) }})
        var response = await axios.get(API_BASE_URL+'/versionvoie', { headers: { 'Authorization': "bearer "+localStorage.getItem(ACCESS_TOKEN_NAME) }})
        setVersionVoie(response.data)
        if (response.data[0]) {
            setSelectedVersion(response.data[0].id)
            refreshVoie(response.data[0].id)
        }
    }


    async function submitForm() {
        const payload = {
            id: selectedId,
            versionvoie_id: selectedVersion,
            couloir_id: selectedNumber,
            difficulty: selectedDifficulty,
            color: selectedColor
        }
        var response = await axios.post(API_BASE_URL+'/voie', payload, { headers: { 'Authorization': "bearer "+localStorage.getItem(ACCESS_TOKEN_NAME) }})
        await refreshVoie()

        setSelectedColor(0)
        setSelectedNumber(0)
        setSelectedDifficulty(0)

        setOpen(false)
    }

    async function submitDelete() {
        var response = await axios.delete(API_BASE_URL+'/voie?id=' + selectedId, { headers: { 'Authorization': "bearer "+localStorage.getItem(ACCESS_TOKEN_NAME)} })
        await refreshVoie()

        setSelectedColor(0)
        setSelectedNumber(0)
        setSelectedDifficulty(0)

        setOpen(false)
    }


    async function submitCreate() {
        const payload = {
            versionvoie_id: selectedVersion,
            couloir_id: createNumber,
            difficulty: createDifficulty,
            color: createColor.css.backgroundColor
        }
            var response = await axios.post(API_BASE_URL+'/voie', payload, { headers: { 'Authorization': "bearer "+localStorage.getItem(ACCESS_TOKEN_NAME) }})

        await refreshVoie()

        setCreateColor(0)
        setCreateDifficulty(0)
        setCreateNumber(0)

        setOpenCreate(false)
    }

    async function getColors() {
        var response = await axios.get(API_BASE_URL+'/colors', { headers: { 'Authorization': "bearer "+localStorage.getItem(ACCESS_TOKEN_NAME) }})
        const tmp = response.data.reduce((pv, cv) => {pv[cv] = cv ; return pv}, {})
        console.log(tmp)
        setPalette(tmp)
    }

       
    useEffect(() => {
        async function start() {
            var response = await axios.get(API_BASE_URL+'/versionvoie', { headers: { 'Authorization': "bearer "+localStorage.getItem(ACCESS_TOKEN_NAME) }})
            setVersionVoie(response.data)
            if (response.data[0]) {
                setSelectedVersion(response.data[0].id)
                refreshVoie(response.data[0].id)
            }
            await getColors()

        }
        start()
        setHeaderTitle("Liste Voies")
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

function valuetext(value) {
  return `${value}%`;
}

    const fabStyle = {
        position: 'absolute',
        bottom: 16,
        right: 16,
    };
const styles = theme => ({
    multilineColor:{
        color:'red'
    }
});

    //<img src="https://lesgdo.org/photo/hdv/M6c6df169982e9963e49c.png" style={{ 'max-width': '100%', height: 'auto'}}/>
    return(
        <div className="productpage">



        <Dialog open={open} onClose={handleClose} >
            <DialogTitle id="alert-dialog-title"> {"Editer"} </DialogTitle>
            <DialogContent>
                <Box sx={{ flexGrow: 1 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={10}> </Grid>
                        <Grid item xs={10}>
                            <Box sx={{ width: '25ch' }} component="form" >
                                <div>
                                    <TextField fullWidth select 
                                    value={selectedNumber}
                                    label="Numero"
                                    onChange={handleSelectedNumberChange}
                                >
                                        { [ ...Array(31).keys() ].map((x) => <MenuItem value={x + 1}>{x + 1}</MenuItem>) }
                                    </TextField>
                                </div>
                                <div>
                                    <TextField fullWidth 
                                    value={selectedColor}
                                    label="Couleur"
                                    sx={{backgroundColor: selectedColor, input: {color: selectedColor == '#000000' ? 'white' : 'black'}}}

                                    onChange={handleSelectedColorChange}
                                />
                                </div>
                                <div>
                                    <TextField fullWidth
                                    value={selectedDifficulty}
                                    label="Difficulte"
                                    onChange={handleSelectedDifficultyChange}
                                />
                                </div>


                                </Box>

                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button sx={{color: 'red'}} onClick={submitDelete}>Supprimer</Button>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button variant="contained" onClick={submitForm}>Editer</Button>
                </DialogActions>
            </Dialog>

        <Dialog open={openCreate} onClose={handleCreateClose} >
            <DialogTitle id="alert-dialog-title"> {"Create"} </DialogTitle>
            <DialogContent>
                <Box sx={{ flexGrow: 1 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={10}> </Grid>
                        <Grid item xs={10}>
                            <Box sx={{ width: '25ch' }} component="form" >
                                <div>
                                    <TextField fullWidth select label="Numero"
                                    value={createNumber}
                                    label="Numero"
                                    onChange={handleCreateNumberChange}
                                >
                                        { [ ...Array(31).keys() ].map((x) => <MenuItem value={x + 1}>{x + 1}</MenuItem>) }
                                    </TextField>
                                </div>
                                        <div>  
                                    <TextField fullWidth label="Difficulte"
                                    value={createDifficulty}
                                    label="Difficulte"
                                    onChange={handleCreateDifficultyChange}
                                />

                                        </div>
                                <div>
                                    <ColorPicker palette={palette} value={createColor} onChange={handleCreateColorChange} defaultValue="transparent"/>
                                    </div>


                                </Box>

                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCreateClose}>Cancel</Button>
                    <Button variant="contained" onClick={submitCreate}>Valider</Button>
                </DialogActions>
            </Dialog>


            <Box sx={{ flexGrow: 1 }} sx={{ flexGrow: 1, width: '85%', marginLeft: 'auto', marginRight: 'auto', paddingTop: '40px' }}>
                <Grid container spacing={2}>

                    <Grid item xs={4}>
                        <div>
                            <TextField fullWidth select label="Numero"
                            value={selectedVersion}
                            label="Numero"
                            onChange={handleSelectedVersionChange}
                        >
                                { versionvoie.map((x) => <MenuItem value={x.id}>{x.date}</MenuItem>) }
                            </TextField>
                        </div>



                    </Grid>

                    <Grid item xs={2}>
        <Fab aria-label='Add' color='primary'> <IconButton size="large" onClick={handleNewVersion} > <AddIcon /> </IconButton> </Fab>
                    </Grid>


                    </Grid>

                </Box>

                { selectedVersion != -1 && 
                        <div>

                <Paper sx={{ width: '85%', marginLeft: 'auto', marginRight: 'auto', paddingTop: '20px' }}>
                    <TableContainer sx={{ maxHeight: 440 }}>
                        <Table stickyHeader aria-label="sticky table">
                            <TableHead>
                                <TableRow>
                                    <TableCell align="left" colSpan={3}>
                                        Plexi
                                    </TableCell>
                                    <TableCell align="left" colSpan={5}>
                                        Verin Gauche
                                    </TableCell>
                                    <TableCell align="left" colSpan={11}>
                                        Devers
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    {[...Array(19).keys()].map((column) => (
                                        <TableCell
                                        key={column}
                                        style={{ top: 57}}
                                    >
                                            {column + 1}
                                    </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {[...Array(10).keys()].map((index) => (
                                <TableRow  key={index}>
                                    {[...Array(19).keys()].map((column) => {
                                        const tmp = voies.filter((e) => e.couloir_id == column + 1)[index]
                                        if (tmp) {
                                            return <TableCell class="mycell" key={tmp.id} style={{backgroundColor:tmp.color, color: tmp.color}} onClick={handleClickOpen}>{tmp.id}</TableCell>
                                        } else {
                                            return <TableCell> </TableCell>
                                        }
                                    })}
                                </TableRow>
                                )).filter((e) => (e.props.children.find((e) => (e.props.class)) )
                                )}

                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TableContainer sx={{ maxHeight: 4400, paddingTop: '100px'}}>
                        <Table stickyHeader aria-label="sticky table">
                            <TableHead>
                                <TableRow>
                                    <TableCell align="left" colSpan={4}>
                                        Verin Droit
                                    </TableCell>
                                    <TableCell align="left" colSpan={5}>
                                        Dalle
                                    </TableCell>
                                    <TableCell align="left" colSpan={4}>
                                        9m
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    {[...Array(12).keys()].map((column) => (
                                        <TableCell
                                        key={column}
                                        style={{ top: 57}}
                                    >
                                            {column + 20}
                                    </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {[...Array(10).keys()].map((index) => (
                                <TableRow  key={index}>
                                    {[...Array(12).keys()].map((column) => {
                                        const tmp = voies.filter((e) => e.couloir_id == column + 20)[index]
                                        if (tmp) {
                                            return <TableCell class="mycell" key={tmp.id} style={{backgroundColor:tmp.color, color: tmp.color}} onClick={handleClickOpen}>{tmp.id}</TableCell>
                                        } else {
                                            return <TableCell></TableCell>
                                        }
                                    })}
                                </TableRow>
                                )).filter((e) => (e.props.children.find((e) => (e.props.class)) )
                                )}

                            </TableBody>
                        </Table>
                    </TableContainer>

                </Paper>

    <Fab sx={fabStyle} aria-label='Add' color='primary'> <IconButton size="large" onClick={handleAdd} > <AddIcon /> </IconButton> </Fab>
</div>
                }
            </div> 
    )
}

export default withRouter(ListVoie);
