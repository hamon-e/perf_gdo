import React,{ useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { ACCESS_TOKEN_NAME, API_BASE_URL, RESTAURANT_ID } from '../../constants/apiConstants';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import './Annotate.css';
import deleteProd from '../../delete.svg';
import modifyProd from '../../edit.svg';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import CustomNoResultsOverlay from '../DataGrid/CustomNoResultsOverlay.js'

import ImageMapper from 'react-img-mapper';

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

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}
TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}


function Products(props) {
    const {isAdminHook, userHook, restaurantHook, headerTitleHook} = useContextObject();
    const [headerTitle, setHeaderTitle] = headerTitleHook;

    const [selectedDifficulty, setSelectedDifficulty] = React.useState(0);
    const [selectedId, setSelectedId] = React.useState(0);
    const [selectedNumber, setSelectedNumber] = React.useState(0);
    const [selectedColor, setSelectedColor] = React.useState(0);
    const [selectedColors, setSelectedColors] = React.useState([]);
    const [selectedTete, setSelectedTete] = React.useState(true);
    const [selectedTop, setSelectedTop] = React.useState(100);
    const [selectedPause, setSelectedPause] = React.useState(0);

    const [insertedRoutes, setInsertedRoutes] = React.useState([])

    const [voies, setVoies] = React.useState([]);

    const [open, setOpen] = React.useState(false);

    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const URL = 'gdo.png';
    const MAP = {
        name: 'my-map',
        areas: [
            {
"id": "17",
"title": "17",
"shape": "poly",
"name": "17",
"fillColor": "#eab54d4d",
"strokeColor": "black",
"coords": [1518,115,1426,906,1373,1318,1433,1313,1479,906,1555,120]
            }
        ],
    };

    for (const elem of MAP['areas']) {
        elem['coords'] = elem['coords'].map(e => e / 2.1)
    }



    const handleClickOpen = (event) => {
        const tmp = voies.find((e) => e.id == event.target.textContent)
        setSelectedId(tmp.id)
        setSelectedDifficulty(tmp.difficulty)
        setSelectedNumber(tmp.couloir_id)
        setSelectedColor(tmp.color)
        setSelectedColors(voies.filter((e) => e.couloir_id == tmp.couloir_id).map((e) => e.color))
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    function handleSelectedTeteChange(event) {
        setSelectedTete(!selectedTete)
    }

    function handleSelectedTopChange(event) {
        setSelectedTop(!selectedTop)
    }

    function handleSelectedColorChange(event) {
        setSelectedColor(event.target.value)
        const tmp = voies.find((e) => e.couloir_id == selectedNumber && e.color == event.target.value)
        setSelectedId(tmp.id)
        setSelectedDifficulty(tmp.difficulty)
    }

    function handleSelectedNumberChange(event) {
        setSelectedNumber(event.target.value)
    }

    function handleSelectedTopChange(event) {
        setSelectedTop(event.target.value)
    }

    function handleSelectedPauseChange(event) {
        setSelectedPause(event.target.value)
    }

    function submitForm() {
        console.log(insertedRoutes)
        const tmp = insertedRoutes
        tmp.push({id: selectedId, tete: selectedTete, top: selectedTop, pause: selectedPause})
        setInsertedRoutes(tmp)
        console.log(tmp)

        setSelectedTete(true)
        setSelectedColor(0)
        setSelectedNumber(0)
        setOpen(false)
    }

    async function refreshVoie() {
        var response = await axios.get(API_BASE_URL+'/voies', { headers: { 'Authorization': "bearer "+localStorage.getItem(ACCESS_TOKEN_NAME) }})
        await setVoies(response.data)
    }

    useEffect(() => {
        async function start() {
            await refreshVoie()
        }
        start()
        setHeaderTitle("Ajouter une Seance")
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    function valuetext(value) {
        return `${value}%`;
    }

    async function areaClick(area, index) {
        var tmp_voies = voies
        if (!tmp_voies.lenght) {
            var response = await axios.get(API_BASE_URL+'/voies', { headers: { 'Authorization': "bearer "+localStorage.getItem(ACCESS_TOKEN_NAME) }})
            tmp_voies = response.data
            setVoies(tmp_voies)
        } 
        const tmp = tmp_voies.find((e) => e.couloir_id == parseInt(area.id, 10))
        if (tmp) {
            setSelectedId(tmp.id)
            setSelectedDifficulty(tmp.difficulty)
            setSelectedNumber(tmp.couloir_id)
            setSelectedColor(tmp.color)
            setSelectedColors(tmp_voies.filter((e) => e.couloir_id == tmp.couloir_id).map((e) => e.color))
        }
        setOpen(true);
        console.log(area, index)
    }


    //<img src="https://lesgdo.org/photo/hdv/M6c6df169982e9963e49c.png" style={{ 'max-width': '100%', height: 'auto'}}/>
    return(
        <div className="productpage">

            <Dialog open={open} onClose={handleClose} >
                <DialogTitle id="alert-dialog-title"> {"Ajouter"} </DialogTitle>
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
                                        <TextField fullWidth select
                                        value={selectedColor}
                                        label="Couleur"
                                        onChange={handleSelectedColorChange}
                                        sx={{backgroundColor: selectedColor, color: selectedColor == '#000000' ? 'white' : 'black'}}
                                    >
                                            {selectedColors.map((e) => (
                                                <MenuItem value={e}
                                                sx={{backgroundColor: e, color: e == '#000000' ? 'white' : 'black'}}
                                            >{e}</MenuItem>
                                            ))}
                                    </TextField>
                                </div>
                                <div>
                                    <TextField fullWidth disabled
                                    value={selectedDifficulty}
                                    label="Difficulty"
                                />

                                </div>
                                <div>  
                                    <Typography id="input-slider" gutterBottom> Hauteur </Typography> 
                                    <Slider onChange={handleSelectedTopChange} getAriaValueText={valuetext} value={selectedTop} valueLabelDisplay="auto" step={10} marks={[ { value: 10, label: '10%', }, { value: 50, label: '50%', }, { value: 100, label: '100%' } ]} min={10} max={100} /> 
                                </div>
                                <div>
                                    <Typography id="input-slider" gutterBottom> Pauses </Typography>
                                    <Slider onChange={handleSelectedPauseChange} value={selectedPause} valueLabelDisplay="auto" step={1} marks={[{value:0, label:"0"}, {value:5, label:"5"}]} min={0} max={5} />
                                </div>
                                <div>
                                    <FormControlLabel control={<Checkbox checked={selectedTete} onChange={handleSelectedTeteChange} />} label="En tete" />
                                </div>


                            </Box>

                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button variant="contained" onClick={submitForm}>Valider</Button>
            </DialogActions>
        </Dialog>


        <Box sx={{ width: '90%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                    <Tab label="Visuel" {...a11yProps(0)} />
                    <Tab label="Tableau" {...a11yProps(1)} />
                </Tabs>
            </Box>
            <TabPanel value={value} index={1}>
                <Box sx={{ flexGrow: 1 }} sx={{ flexGrow: 1, width: '85%', marginLeft: 'auto', marginRight: 'auto', paddingTop: '40px' }}>
                    <Grid container spacing={2}>

                        <Grid item xs={4}>

                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                label="Date"
                                renderInput={(params) => <TextField {...params} />}
                            />

                            </LocalizationProvider>

                        </Grid>
                        <Grid item xs={4}>
                            <Slider defaultValue={[3,9]} valueLabelDisplay="auto" step={0.5} min={3} max={9} /> 
                        </Grid>


        </Grid>

    </Box>

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
                        <TableCell align="left" colSpan={10}>
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
                    <TableContainer sx={{ maxHeight: 440, paddingTop: '100px'}}>
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




                        </TabPanel>

                        <TabPanel value={value} index={0}>

                            <Box sx={{ flexGrow: 1 }} sx={{ flexGrow: 1, width: '85%', marginLeft: 'auto', marginRight: 'auto', paddingTop: '' }}>
                                <ImageMapper src={URL} map={MAP} width={2604/2.1} height={1596/2.1} onClick={areaClick}/>
                            </Box>



                        </TabPanel>

                    </Box>


                    <Box sx={{ flexGrow: 1 }} sx={{ flexGrow: 1, width: '85%', marginLeft: 'auto', marginRight: 'auto', paddingTop: '40px' }}>

                        <Grid container spacing={2}>

                            <Grid item xs={10}>
                                <List>
                                    { insertedRoutes.map((e) => 
                                        <ListItem disablePadding>
                                            <ListItemButton>
                                                <ListItemIcon>
                                                    <InboxIcon />
                                                </ListItemIcon>
                                                <ListItemText primary={voies.find((tmp) => tmp.id == e.id).couloir_id +  ": " + voies.find((tmp) => tmp.id == e.id).difficulty +  ": " + voies.find((tmp) => tmp.id == e.id).color } />
                                            </ListItemButton>
                                        </ListItem>
                                    )}
                                    </List>


                                </Grid>
                            </Grid>
                        </Box>



                    </div> 
    )
}

export default withRouter(Products);
