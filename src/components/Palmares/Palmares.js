import React,{ useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { ACCESS_TOKEN_NAME, API_BASE_URL, RESTAURANT_ID } from '../../constants/apiConstants';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import './Palmares.css';
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
import DeleteIcon from '@mui/icons-material/Delete';

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

import { PickersDay } from '@mui/x-date-pickers/PickersDay';

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

const fixedWidth = window.innerWidth;

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

var saveVoies = []
var palmares = []


function Palmares(props) {
    const {isAdminHook, userHook, restaurantHook, headerTitleHook, openHook} = useContextObject();
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
    const [selectedDate, setSelectedDate] = React.useState(new Date())

    const [voies, setVoies] = React.useState([]);

    const [openMenu, setOpenMenu] = openHook;
    const [open, setOpen] = React.useState(false);

    const [value, setValue] = React.useState(0);
    const [mobile, setMobile] = React.useState(false);
    const [widthSize, setWidthSize] = React.useState(window.innerWidth);

    const [imageIndex, setImageIndex] = React.useState(0);

    const [days, setDays] = React.useState([])

    const handleChange = (event, newValue) => {
        setValue(newValue);
        if (newValue == 0) {
            setVoies(saveVoies.filter((e) => palmares.find((p) => p == e.id)))
        } else {
            setVoies(saveVoies.filter((e) => !palmares.length || palmares.find((p) => p != e.id)))
        }
    };

    function formatDate(date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;

        return [year, month, day].join('-');
    }


    async function refreshVoie() {
        var response = await axios.get(API_BASE_URL+'/voies', { headers: { 'Authorization': "bearer "+localStorage.getItem(ACCESS_TOKEN_NAME) }})
        saveVoies = response.data
    }

    async function getPalmares() {
        var response = await axios.get(API_BASE_URL+'/palmares', { headers: { 'Authorization': "bearer "+localStorage.getItem(ACCESS_TOKEN_NAME) }})
        palmares = response.data
        setVoies(saveVoies.filter((e) => palmares.find((p) => p == e.id)))
    }


    useEffect(() => {
        async function start() {
            await refreshVoie()
            await getPalmares()
        }
        start()
        setHeaderTitle("Palmares")
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    function difficultyFormat(difficulty) {
        const floor = Math.floor(difficulty)
        const decimal = difficulty - floor
        console.log(decimal)
        if (decimal >= 0.24 && decimal <= 0.26) {
            return floor + "a"
        }
        if (decimal >= 0.34 && decimal <= 0.36) {
            return floor + "a+"
        }
        if (decimal >= 0.49 && decimal <= 0.51) {
            return floor + "b"
        }
        if (decimal >= 0.59 && decimal <= 0.61) {
            return floor + "b+"
        }
        if (decimal >= 0.74 && decimal <= 0.76) {
            return floor + "c"
        }
        if (decimal >= 0.84 && decimal <= 0.86) {
            return floor + "c+"
        }
        console.log(difficulty)
        return "Bug"

    }


    //<img src="https://lesgdo.org/photo/hdv/M6c6df169982e9963e49c.png" style={{ 'max-width': '100%', height: 'auto'}}/>
    return(
        <div className="productpage">

                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                    <Tab label="Accomplies" {...a11yProps(0)} />
                    <Tab label="A faire" {...a11yProps(1)} />
                </Tabs>

            {!mobile && 
    <Paper sx={{ width: '85%', marginLeft: 'auto', marginRight: 'auto', marginTop: '50px' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
            <Table stickyHeader aria-label="sticky table">
                <TableHead>
                    <TableRow>
                        <TableCell align="left" colSpan={3}> Plexi </TableCell>
                        <TableCell align="left" colSpan={5}> Verin Gauche </TableCell>
                        <TableCell align="left" colSpan={10}> Devers </TableCell>
                    </TableRow>
                    <TableRow>
                        {[...Array(19).keys()].map((column) => ( <TableCell key={column + 1} style={{ top: 57}} > {column + 1} </TableCell>))}
                    </TableRow>
                </TableHead>
                <TableBody>

                    {[...Array(10).keys()].map((index) => (
                        <TableRow  key={index}>
                            {[...Array(19).keys()].map((column) => {
                                const tmp = voies.filter((e) => e.couloir_id == column + 1)[index]
                                if (tmp) {
                                    return <TableCell class="mycell" key={tmp.id} style={{textAlign: 'center', backgroundColor:tmp.color, color: tmp.color == '#000000' ? 'white' : 'black'}}>{difficultyFormat(tmp.difficulty)}</TableCell>
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
                                    <TableCell align="left" colSpan={3}> Verin Droit </TableCell>
                                    <TableCell align="left" colSpan={5}> Dalle </TableCell>
                                    <TableCell align="left" colSpan={4}> 9m </TableCell>
                                </TableRow>
                                <TableRow>
                                    {[...Array(12).keys()].map((column) => ( <TableCell key={column + 20} style={{ top: 57}} > {column + 20} </TableCell>))}
                                </TableRow>
                            </TableHead>
                            <TableBody>

                                {[...Array(10).keys()].map((index) => (
                                    <TableRow  key={index}>
                                        {[...Array(12).keys()].map((column) => {
                                            const tmp = voies.filter((e) => e.couloir_id == column + 20)[index]
                                            if (tmp) {
                                    return <TableCell class="mycell" key={tmp.id} style={{textAlign: 'center', backgroundColor:tmp.color, color: tmp.color == '#000000' ? 'white' : 'black'}}>{difficultyFormat(tmp.difficulty)}</TableCell>
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
            }
            {mobile && 
    <Paper sx={{ width: '90%', marginLeft: 'auto', marginRight: 'auto', paddingTop: '20px' }}>
        <TableContainer sx={{ maxHeight: 440, maxWidth: fixedWidth - 25}}>
            <Table stickyHeader aria-label="sticky table">
                <TableHead>
                    <TableRow>
                        <TableCell align="left" colSpan={3}> Plexi </TableCell>
                        <TableCell align="left" colSpan={4}> Verin Gauche </TableCell>
                    </TableRow>
                    <TableRow>
                        {[...Array(7).keys()].map((column) => ( <TableCell key={column + 1} style={{ top: 57}} > {column + 1} </TableCell>))}
                    </TableRow>
                </TableHead>
                <TableBody>

                    {[...Array(10).keys()].map((index) => (
                        <TableRow  key={index}>
                            {[...Array(7).keys()].map((column) => {
                                const tmp = voies.filter((e) => e.couloir_id == column + 1)[index]
                                if (tmp) {
                                    return <TableCell class="mycell" key={tmp.id} style={{textAlign: 'center', backgroundColor:tmp.color, color: tmp.color == '#000000' ? 'white' : 'black'}}>{difficultyFormat(tmp.difficulty)}</TableCell>
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
   
                    <TableContainer sx={{ maxHeight: 440, maxWidth: fixedWidth - 25, paddingTop: '100px'}}>
                        <Table stickyHeader aria-label="sticky table">
                            <TableHead>
                                <TableRow>
                                    <TableCell align="left" colSpan={11}> Devers </TableCell>
                                </TableRow>
                                <TableRow>
                                    {[...Array(11).keys()].map((column) => ( <TableCell key={column + 10} style={{top: 57}} > {column + 10} </TableCell>))}
                                </TableRow>
                            </TableHead>
                            <TableBody>

                                                   {[...Array(10).keys()].map((index) => (
                        <TableRow  key={index}>
                            {[...Array(11).keys()].map((column) => {
                                const tmp = voies.filter((e) => e.couloir_id == column + 20)[index]
                                if (tmp) {
                                    return <TableCell class="mycell" key={tmp.id} style={{textAlign: 'center', backgroundColor:tmp.color, color: tmp.color == '#000000' ? 'white' : 'black'}}>{difficultyFormat(tmp.difficulty)}</TableCell>
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

                    <TableContainer sx={{ maxHeight: 440, maxWidth: fixedWidth - 25, paddingTop: '100px'}}>
                        <Table stickyHeader aria-label="sticky table">
                            <TableHead>
                                <TableRow>
                                    <TableCell align="left" colSpan={4}> Verin Droit </TableCell>
                                    <TableCell align="left" colSpan={4}> Dalle </TableCell>
                                </TableRow>
                                <TableRow>
                                    {[...Array(8).keys()].map((column) => ( <TableCell key={column + 20} style={{ top: 57}} > {column + 20} </TableCell>))}
                                </TableRow>
                            </TableHead>
                            <TableBody>

                                {[...Array(10).keys()].map((index) => (
                                    <TableRow  key={index}>
                                        {[...Array(8).keys()].map((column) => {
                                            const tmp = voies.filter((e) => e.couloir_id == column + 20)[index]
                                            if (tmp) {
                                    return <TableCell class="mycell" key={tmp.id} style={{textAlign: 'center', backgroundColor:tmp.color, color: tmp.color == '#000000' ? 'white' : 'black'}}>{difficultyFormat(tmp.difficulty)}</TableCell>
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

                    <TableContainer sx={{ maxHeight: 440, maxWidth: fixedWidth - 25, paddingTop: '100px'}}>
                        <Table stickyHeader aria-label="sticky table">
                            <TableHead>
                                <TableRow>
                                    <TableCell align="left" colSpan={4}> 9m </TableCell>
                                </TableRow>
                                <TableRow>
                                    {[...Array(4).keys()].map((column) => ( <TableCell key={column + 28} style={{ top: 57}} > {column + 28} </TableCell>))}
                                </TableRow>
                            </TableHead>
                            <TableBody>

                                {[...Array(10).keys()].map((index) => (
                                    <TableRow  key={index}>
                                        {[...Array(4).keys()].map((column) => {
                                            const tmp = voies.filter((e) => e.couloir_id == column + 28)[index]
                                            if (tmp) {
                                    return <TableCell class="mycell" key={tmp.id} style={{textAlign: 'center', backgroundColor:tmp.color, color: tmp.color == '#000000' ? 'white' : 'black'}}>{difficultyFormat(tmp.difficulty)}</TableCell>
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


                    {fixedWidth}
                            </Paper>
            }









                    </div> 
    )
}

export default withRouter(Palmares);
