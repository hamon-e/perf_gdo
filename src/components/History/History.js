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

    const [widthSize, setWidthSize] = React.useState(window.innerWidth);


    const URL = 'gdo.png';
    const MAP = {
        name: 'my-map',
        areas: [
            { "id": "1", "title": "1", "name": "1",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black",
              "coords": [230,1354,382,1250,332,65,153,23] },
            { "id": "2", "title": "2", "name": "2",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black",
              "coords": [399,1570,472,1500,409,84,331,65] },
            { "id": "3", "title": "3", "name": "3",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black",
              "coords": [409,85,611,94,643,1054,594,1059,606,1371,468,1387,456,1113] },
            { "id": "4", "title": "4", "name": "4",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black",
              "coords": [656,1474,698,1555,638,806,646,73,611,94] },
            { "id": "5", "title": "5", "name": "5",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black",
              "coords": [698,1555,785,1542,735,799,745,77,646,72,638,803] },
            { "id": "6", "title": "6", "name": "6",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black",
              "coords": [786,1541,864,1527,811,794,827,82,745,75,735,799] },
            { "id": "7", "title": "7", "name": "7",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black",
              "coords": [865,1526,941,1515,876,789,902,87,828,83,812,795] },
            { "id": "8", "title": "8", "name": "8",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black",
              "coords": [886,901,893,751,884,613,875,790] },
            { "id": "10", "title": "10", "name": "10",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black",
              "coords": [929,1384,975,1378,956,1115,947,1013,952,537,976,93,903,88,886,537,888,904] },
            { "id": "11", "title": "11", "name": "11",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black",
              "coords": [975,1378,1025,1371,1027,1104,1025,1010,1030,535,1039,292,1048,94,975,92,963,292,952,536,947,1016,956,1114] },
            { "id": "12", "title": "12", "name": "12",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black",
              "coords": [1025,1371,1080,1362,1106,1098,1115,1095,1115,999,1136,858,1139,640,1130,534,1156,288,1156,102,1050,95,1041,291,1030,534,1027,1010] },
            { "id": "13", "title": "13", "name": "13",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black",
              "coords": [1156,99,1239,78,1138,885,1124,1004,1118,1095,1079,1360,1109,1098,1129,921,1141,709,1129,532,1158,291] },
            { "id": "14", "title": "14", "name": "14",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black",
              "coords": [1239,78,1499,90,1260,991,1253,1081,1209,1343,1080,1361,1117,1097] },
            { "id": "15", "title": "15", "name": "15",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black",
              "coords": [1209,1346,1292,1332,1329,1077,1340,1072,1343,977,1359,883,1495,113,1500,90,1264,990,1220,1290] },
            { "id": "17", "title": "17", "name": "17",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black",
              "coords": [1372,1319,1294,1331,1330,1075,1342,1071,1343,979,1422,526,1464,297,1496,115,1535,117,1475,527] },
            { "id": "18", "title": "18", "name": "18",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black",
              "coords": [1371,1322,1435,1313,1468,1060,1482,966,1524,523,1558,297,1577,118,1535,116,1475,523] },
            { "id": "19", "title": "19", "name": "19",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black",
              "coords": [1494,1305,1436,1312,1468,1059,1481,965,1525,524,1580,120,1629,120,1626,299,1573,522,1586,663,1579,792,1570,875,1554,960,1551,1050,1547,1338] },
            { "id": "20", "title": "20", "name": "20",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black",
              "coords": [1639,1401,1705,1392,1623,753,1627,521,1682,125,1632,120,1627,300,1574,521,1588,670,1581,750,1571,869] },
            { "id": "21", "title": "21", "name": "21",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black",
              "coords": [1708,1391,1759,1382,1675,747,1725,130,1714,126,1684,123,1629,521,1623,750] },
            { "id": "22", "title": "22", "name": "22",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black",
              "coords": [1803,1377,1761,1381,1674,747,1726,130,1772,131,1717,745] },
            { "id": "23", "title": "23", "name": "23",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black",
              "coords": [1795,1301,1869,1289,1807,747,1801,517,1813,141,1774,134,1716,744] },
            { "id": "24", "title": "24", "name": "24",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black",
              "coords": [1867,1289,1927,1281,1888,146,1812,141,1802,517,1807,743] },
            { "id": "25", "title": "25", "name": "25",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black",
              "coords": [1927,1281,1982,1274,1962,149,1889,144] },
            { "id": "26", "title": "26", "name": "26",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black",
              "coords": [1985,1274,2031,1264,2053,507,2071,153,1963,150] },
            { "id": "27", "title": "27", "name": "27",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black",
              "coords": [2034,1265,2086,1258,2121,511,2052,511] },
            { "id": "28", "title": "28", "name": "28",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black",
              "coords": [2086,1258,2175,1296,2230,515,2121,511] },
            { "id": "29", "title": "29", "name": "29",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black",
              "coords": [2176,1297,2303,1352,2315,948,2352,521,2230,517] },
            { "id": "30", "title": "30", "name": "30",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black",
              "coords": [2412,1400,2306,1354,2315,946,2352,523,2469,530,2438,976] },
            { "id": "31", "title": "31", "name": "31",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black",
              "coords": [2490,1436,2412,1401,2469,530,2554,533] },


        ],
    };
    const ratio = window.innerWidth > 900 ? 3 : 7

    for (const elem of MAP['areas']) {

        elem['coords'] = elem['coords'].map(e => e / ratio)
    }

    const [MAP_1, setMap] = React.useState({
            name: 'my-map',
            areas: []
    })

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
        setSelectedDate(date)
        if (!date)
            setSelectedDate(response.data[response.data.length - 1])
        await refreshInsertedRoutes(response.data[response.data.length - 1])
    }

    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    async function refreshInsertedRoutes(date = null) {
        const tmp = date ? date : selectedDate
        var response = await axios.get(API_BASE_URL+'/userseance?date=' + formatDate(tmp), { headers: { 'Authorization': "bearer "+localStorage.getItem(ACCESS_TOKEN_NAME) }})
        await setInsertedRoutes(response.data)
        setMap({name: 'my-map', areas: MAP.areas.filter((e) => response.data.find((p) => p.voie.couloir_id == e.id)).map((e) => {const tmp = e; const c = hexToRgb(response.data.find((p) => p.voie.couloir_id == e.id).voie.color); tmp["preFillColor"] = "rgba(" + c.r + "," + c.g + "," + c.b + "," + "0.7)"; tmp['active'] = false; return tmp})})
    }

    //<img src="https://lesgdo.org/photo/hdv/M6c6df169982e9963e49c.png" style={{ 'max-width': '100%', height: 'auto'}}/>
    return(
        <div className="productpage">

            <Box sx={{ flexGrow: 1, width: '85%', marginLeft: 'auto', marginRight: 'auto', paddingTop: '40px' }}>

                <Grid container spacing={2}>

                        <Grid item xs={12}>
 
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

                    <Grid item md={8} xs={12}>
                                <ImageMapper src={URL} map={MAP_1} width={2604/ratio} height={1596/ratio} />
                    </Grid>



                    <Grid item md={4} xs={12}>
                        <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        marginTop="50px"
                    >
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
                        </Box>


                        </Grid>

                    </Grid>
                </Box>



            </div> 
    )
}

export default withRouter(History);
