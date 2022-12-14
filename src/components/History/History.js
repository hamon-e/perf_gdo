import React,{ useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { ACCESS_TOKEN_NAME, API_BASE_URL, RESTAURANT_ID } from '../../constants/apiConstants';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import './History.css';
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

import { PickersDay } from '@mui/x-date-pickers/PickersDay';

function History(props) {
    const {isAdminHook, userHook, restaurantHook, headerTitleHook, openHook} = useContextObject();
    const [headerTitle, setHeaderTitle] = headerTitleHook;

    const [insertedRoutes, setInsertedRoutes] = React.useState([])
    const [selectedDate, setSelectedDate] = React.useState(new Date())
    const [days, setDays] = React.useState([])

    useEffect(() => {
        async function start() {
            await getDays()
        }
        start()
        setHeaderTitle("Historique")
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

    async function getDays(date = null) {
        const tmp = date ? date : selectedDate
        var response = await axios.get(API_BASE_URL+'/userseance_days?date=' + formatDate(tmp), { headers: { 'Authorization': "bearer "+localStorage.getItem(ACCESS_TOKEN_NAME) }})
        await setDays(response.data)
        setSelectedDate(response.data[response.data.length - 1])
        await refreshInsertedRoutes(response.data[response.data.length - 1])
    }

    async function refreshInsertedRoutes(date = null) {
        const tmp = date ? date : selectedDate
        var response = await axios.get(API_BASE_URL+'/userseance?date=' + formatDate(tmp), { headers: { 'Authorization': "bearer "+localStorage.getItem(ACCESS_TOKEN_NAME) }})
        await setInsertedRoutes(response.data)
    }

    //<img src="https://lesgdo.org/photo/hdv/M6c6df169982e9963e49c.png" style={{ 'max-width': '100%', height: 'auto'}}/>
    return(
        <div className="productpage">

            <Box sx={{ flexGrow: 1, width: '85%', marginLeft: 'auto', marginRight: 'auto', paddingTop: '40px' }}>

                <Grid container spacing={2}>

                        <Grid item xs={6}>
 
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                label="Date"
                                value={selectedDate}
                                onChange={(newValue) => {
                                    setSelectedDate(newValue);
                                    refreshInsertedRoutes(newValue)
                                }}

                                onMonthChange={getDays}
                                renderDay={(day, _value, DayComponentProps) => {
                                    const isSelected = !DayComponentProps.outsideCurrentMonth && days.find((e) => {
                                        const tmp = new Date(e)
                                        return tmp.getDate() == day.date()
                                    })

                                    return (
                                        <PickersDay style={isSelected && {backgroundColor: 'rgba(255, 173, 173, 0.65)'}} {...DayComponentProps} />
                                    );
                                }}
                                renderInput={(params) => <TextField {...params} />}
                            />

                            </LocalizationProvider>
                    </Grid>



                    <Grid item xs={10}>
                        <List>
                            { insertedRoutes.map((e) => 
                                <ListItem disablePadding>
                                    <Box sx={{ width: '4ch', height: '4ch', backgroundColor: e.voie.color, textAlign: 'center', color: e.voie.color == '#000000' ? 'white !important' : 'black'}}  >
                                        <div style={{paddingTop: '5px'}}>{ difficultyFormat(e.voie.difficulty) }</div>
                                    </Box>
                                    <div style={{paddingLeft: '10px'}}>{"couloir: " + e.voie.couloir_id}</div>
                                    {e.pause != 0 && 
                                    <div style={{paddingLeft: '10px'}}>{"pause: " + e.pause}</div>
                                    }
                                    {e.top != 100 && 
                                    <div style={{paddingLeft: '10px'}}>{"hauteur: " + e.top + "%"}</div>
                                    }
                                </ListItem>
                            )}
                            </List>


                        </Grid>
                    </Grid>
                </Box>



            </div> 
    )
}

export default withRouter(History);
