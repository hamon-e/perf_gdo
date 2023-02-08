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

    var touchstartY = 0;
    var touchendY = 0;
var g_value = 0;
var g_imageIndex = 0;
var lastMove = 0;
var g_voies = [];



const fixedWidth = window.innerWidth;

function Products(props) {
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
        g_value = newValue
    };

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

    for (const elem of MAP['areas']) {
        elem['coords'] = elem['coords'].map(e => e / 2.1)
    }



    const URL_1 = 'gdo-1.png';
    const MAP_1 = {
        name: 'my-map-1',
        areas: [
            { "id": "1", "title": "1", "name": "1",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black", "preFillColor": "rgba(255, 173, 173, 0.15)",
              "coords": [145,1339,291,1249,252,87,90,36] },
            { "id": "2", "title": "2", "name": "2",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black", "preFillColor": "rgba(255, 214, 165, 0.15)",
              "coords": [299,1567,368,1506,324,112,252,88,290,1249] },
            { "id": "3", "title": "3", "name": "3",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black", "preFillColor": "rgba(253, 255, 182, 0.15)",
              "coords": [366,1404,496,1387,489,1068,542,1062,520,122,325,111,355,1078] },
            { "id": "4", "title": "4", "name": "4",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black", "preFillColor": "rgba(202, 255, 91, 0.15)",
              "coords": [552,1480,596,1555,540,817,556,98,520,122,537,818,542,1062] },
            { "id": "5", "title": "5", "name": "5",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black", "preFillColor": "rgba(155, 246, 255, 0.15)",
              "coords": [596,1554,682,1542,626,813,651,103,557,97,543,688,541,816] },
            { "id": "6", "title": "6", "name": "6",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black", "preFillColor": "rgba(160, 196, 255, 0.15)",
              "coords": [683,1541,759,1530,700,809,730,109,697,106,652,102,626,811] },
            { "id": "7", "title": "7", "name": "7",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black", "preFillColor": "rgba(189, 178, 255, 0.15)",
              "coords": [760,1530,833,1518,772,805,773,682,800,113,731,110,706,683,700,809] },
        ]
    }
    for (const elem of MAP_1['areas']) {
        elem['coords'] = elem['coords'].map(e => e / 2.8)
    }

 
    const URL_2 = 'gdo-2.png';
    const MAP_2 = {
        name: 'my-map-2',
        areas: [
            { "id": "10", "title": "10", "name": "10",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black", "preFillColor": "rgba(255, 173, 173, 0.15)",
              "coords": [95,1616,193,1606,213,1278,214,1159,216,594,233,298,237,67,125,59,127,293,114,592,124,861,121,1047,113,1167,114,1285,108,1281] },
            { "id": "11", "title": "11", "name": "11",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black", "preFillColor": "rgba(255, 214, 165, 0.15)",
              "coords": [193,1605,278,1595,297,1269,301,1153,313,593,333,301,338,74,237,68,234,298,217,593,214,1037,214,1278] },
            { "id": "12", "title": "12", "name": "12",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black", "preFillColor": "rgba(253, 255, 182, 0.15)",
              "coords": [279,1595,371,1585,394,1268,403,1263,404,1149,419,1027,426,868,426,764,416,591,441,305,441,78,339,73,333,300,313,593,304,1031,300,1154,297,1271] },
            { "id": "13", "title": "13", "name": "13",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black", "preFillColor": "rgba(202, 255, 91, 0.15)",
              "coords": [371,1583,404,1265,411,1153,464,592,517,28,441,80,441,305,416,593,423,701,427,801,427,887,421,984,419,1027,405,1149,404,1246] },
            { "id": "14", "title": "14", "name": "14",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black", "preFillColor": "rgba(155, 246, 255, 0.15)",
              "coords": [372,1586,527,1567,571,1254,577,1144,837,51,518,29] },
            { "id": "15", "title": "15", "name": "15",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black", "preFillColor": "rgba(160, 196, 255, 0.15)",
              "coords": [528,1566,629,1554,664,1244,677,1242,677,1131,693,1016,838,51,577,1142,572,1249] },
            { "id": "17", "title": "17", "name": "17",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black", "preFillColor": "rgba(189, 178, 255, 0.15)",
              "coords": [630,1553,724,1543,759,1237,768,1126,804,596,842,320,868,109,830,107,798,320,757,595,713,888,695,1016,678,1132,677,1242,664,1245] },
            { "id": "18", "title": "18", "name": "18",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black", "preFillColor": "rgba(255, 198, 255, 0.15)",
              "coords": [724,1542,801,1535,837,1230,843,1121,875,595,915,323,932,112,867,107,841,320,804,595,768,1125,760,1236] },
            { "id": "19", "title": "19", "name": "19",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black", "preFillColor": "rgba(255, 255, 252, 0.15)",
              "coords": [802,1534,871,1526,917,1224,933,1221,934,1115,947,1039,963,897,965,780,961,673,954,595,1008,328,1011,118,933,113,916,322,875,597,844,1120,838,1229] },

        ]
    }
    for (const elem of MAP_2['areas']) {
        elem['coords'] = elem['coords'].map(e => e / 3)
    }


    const URL_3 = 'gdo-3.png';
     const MAP_3 = {
        name: 'my-map-3',
        areas: [
            { "id": "20", "title": "20", "name": "20",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black", "preFillColor": "rgba(255, 173, 173, 0.15)",
              "coords": [170,1676,251,1666,195,844,192,553,212,43,134,36,115,552,111,846] },
            { "id": "21", "title": "21", "name": "21",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black", "preFillColor": "rgba(255, 214, 165, 0.15)",
              "coords": [252,1665,330,1655,264,843,286,63,257,62,255,47,213,43,193,553,196,845] },
            { "id": "22", "title": "22", "name": "22",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black", "preFillColor": "rgba(253, 255, 182, 0.15)",
              "coords": [331,1655,407,1644,336,840,358,69,286,62,265,842] },
            { "id": "23", "title": "23", "name": "23",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black", "preFillColor": "rgba(202, 255, 91, 0.15)",
              "coords": [402,1559,507,1547,450,847,445,93,359,68,338,839] },
            { "id": "24", "title": "24", "name": "24",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black", "preFillColor": "rgba(155, 246, 255, 0.15)",
              "coords": [507,1547,609,1534,576,845,563,104,445,96,451,849] },
            { "id": "25", "title": "25", "name": "25",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black", "preFillColor": "rgba(160, 196, 255, 0.15)",
              "coords": [609,1534,707,1523,677,112,563,104,574,807] },
            { "id": "26", "title": "26", "name": "26",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black", "preFillColor": "rgba(189, 178, 255, 0.15)",
              "coords": [706,1523,794,1513,794,560,797,119,678,112] }, 
            { "id": "27", "title": "27", "name": "27",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black", "preFillColor": "rgba(255, 198, 255, 0.15)",
              "coords": [795,1512,882,1501,888,879,914,778,890,773,890,562,794,560] },
        ],
    };

    for (const elem of MAP_3['areas']) {
        elem['coords'] = elem['coords'].map(e => e / 3)
    }

    const URL_4 = 'gdo-4.png';
     const MAP_4 = {
        name: 'my-map-4',
        areas: [
            { "id": "28", "title": "28", "name": "28",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black", "preFillColor": "rgba(255, 173, 173, 0.15)",
              "coords": [131,1258,275,1287,266,103,127,121,128,374,44,371,128,504] },
            { "id": "29", "title": "29", "name": "29",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black", "preFillColor": "rgba(255, 214, 165, 0.15)",
              "coords": [275,1287,506,1334,494,714,511,74,266,103] },
            { "id": "30", "title": "30", "name": "30",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black", "preFillColor": "rgba(253, 255, 182, 0.25)",
              "coords": [507,1335,691,1372,697,722,702,51,511,74,494,714] },
            { "id": "31", "title": "31", "name": "31",
              "shape": "poly",
              "fillColor": "#eab54d4d", "strokeColor": "black", "preFillColor": "rgba(202, 255, 91, 0.15)",
              "coords": [691,1371,825,1398,841,36,703,51] },
        ],
    };

    for (const elem of MAP_4['areas']) {
        elem['coords'] = elem['coords'].map(e => e / 2.8)
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

    function chooseColor(event) {
        setSelectedColor(event.target.id)
        const tmp = voies.find((e) => e.couloir_id == selectedNumber && e.color == event.target.id)
        setSelectedId(tmp.id)
        setSelectedDifficulty(tmp.difficulty)
    }

    function handleSelectedNumberChange(event) {
        setSelectedNumber(event.target.value)
        setSelectedColor(false)
        setSelectedColors(voies.filter((e) => e.couloir_id == event.target.value).map((e) => e.color))
    }

    function handleSelectedTopChange(event) {
        setSelectedTop(event.target.value)
    }

    function handleSelectedPauseChange(event) {
        setSelectedPause(event.target.value)
    }

    async function deleteRoute(event) {
        //const tmp = insertedRoutes.filter((e) => e.id != event.target.parentElement.id)
        //setInsertedRoutes(tmp)
        var response = await axios.delete(API_BASE_URL+'/userseance?userseance_id=' + event.target.parentElement.id, { headers: { 'Authorization': "bearer "+localStorage.getItem(ACCESS_TOKEN_NAME) }})
        await refreshInsertedRoutes()
    }

    async function submitForm() {
        //console.log(insertedRoutes)
        //const tmp = insertedRoutes
        //tmp.push({id: selectedId, tete: selectedTete, top: selectedTop, pause: selectedPause})
        //setInsertedRoutes(tmp)
        //console.log(tmp)
        const payload = {
            voie_id: selectedId,
            en_tete: selectedTete,
            top: selectedTop,
            pause: selectedPause,
            date: formatDate(selectedDate)
        }

        const config = {
            headers: {
                "Accept": "application/json, text/plain, */*",
                "Content-Type": "application/json",
                "Authorization": "Bearer "+localStorage.getItem(ACCESS_TOKEN_NAME)
            }
        }

        var response = await axios.post(API_BASE_URL+'/userseance', payload, config)
        await refreshInsertedRoutes()

        setSelectedTete(true)
        setSelectedTop(100)
        setSelectedPause(0)
        setSelectedColor(0)
        setSelectedNumber(0)
        setOpen(false)
    }

    async function refreshInsertedRoutes(date = null) {
        const tmp = date ? date : selectedDate
        var response = await axios.get(API_BASE_URL+'/userseance?date=' + formatDate(tmp), { headers: { 'Authorization': "bearer "+localStorage.getItem(ACCESS_TOKEN_NAME) }})
        await setInsertedRoutes(response.data)
    }

    async function refreshVoie() {
        var response = await axios.get(API_BASE_URL+'/voies', { headers: { 'Authorization': "bearer "+localStorage.getItem(ACCESS_TOKEN_NAME) }})
        await setVoies(response.data)
        g_voies = response.data
    }

    function handleResize() {
        setWidthSize(window.innerWidth)
        console.log(window.innerWidth)
    }

    function onScroll(event) {
        console.log(g_value, g_imageIndex)
        if (g_value == 0) {
        var tmp = g_imageIndex
        if (event.deltaY < 0 && tmp > 0){
            tmp = tmp - 1
        } else if (event.deltaY >= 0 && tmp < 3){
            tmp = tmp + 1
        }
        setImageIndex(tmp)
            g_imageIndex = tmp
        }
    }

    function handleGesure() {
        if (g_value == 0) {
        if (Math.abs(touchendY - touchstartY) > 50) {
        var tmp = g_imageIndex
        if (touchendY < touchstartY && tmp < 3) {
            tmp = tmp + 1
        }
        if (touchendY > touchstartY && tmp > 0) {
            tmp = tmp - 1
        }

        setImageIndex(tmp)
            g_imageIndex = tmp
        }


        }

    }

    async function getDays(date = null) {
        const tmp = date ? date : selectedDate
        var response = await axios.get(API_BASE_URL+'/userseance_days?date=' + formatDate(tmp), { headers: { 'Authorization': "bearer "+localStorage.getItem(ACCESS_TOKEN_NAME) }})
        await setDays(response.data)
    }




    useEffect(() => {
        async function start() {
            await refreshVoie()
            await refreshInsertedRoutes()
            await getDays()
        }
        start()
        setHeaderTitle("Ajouter une Seance")
        window.addEventListener("resize", handleResize);
        //window.addEventListener('scroll', onScroll, false);
        //window.addEventListener('touchstart', onScroll);
        window.addEventListener('wheel', function(event) {
        if(Date.now() - lastMove > 800) {
            onScroll(event)
            lastMove = Date.now();
        }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
            if (widthSize &&  widthSize < 900) {
                if (!mobile) {
                    setOpenMenu(false)
                }
                setMobile(true)
                console.log("Mobile")
            } else {
                setMobile(false)
            }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [widthSize])



    function touchstart(event) {
      touchstartY = event.changedTouches[0].clientX;
    }

    function touchend(event) {
        touchendY = event.changedTouches[0].clientX;
        if(Date.now() - lastMove > 40) {
            handleGesure();
            lastMove = Date.now();
        }
    }


    function valuetext(value) {
        return `${value}%`;
    }

    async function areaClick(area, index) {
        var tmp_voies = g_voies
        const tmp = tmp_voies.find((e) => e.couloir_id == parseInt(area.id, 10))
        if (tmp) {
            setSelectedId(tmp.id)
            setSelectedDifficulty(tmp.difficulty)
            setSelectedNumber(tmp.couloir_id)
            setSelectedColor(false)
            setSelectedColors(tmp_voies.filter((e) => e.couloir_id == tmp.couloir_id).map((e) => e.color))
        }
        setOpen(true);
        console.log(area, index)
    }

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

            <Dialog open={open} onClose={handleClose} >
                {selectedColor && <div>
                <DialogTitle id="alert-dialog-title"> {"Confirmer"} </DialogTitle>
                <DialogContent>
                    <Box sx={{ flexGrow: 1 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={10}> </Grid>
                            <Grid item xs={10}>
                                <Box sx={{ width: '25ch' }} component="form" >
                                    <div>
                                        <TextField fullWidth select 
                                        value={selectedNumber}
                                        label="Couloir"
                                        onChange={handleSelectedNumberChange}
                                    >
                                            { [ ...Array(31).keys() ].map((x) => <MenuItem value={x + 1}>{x + 1}</MenuItem>) }
                                        </TextField>
                                    </div>
                                    <div>
                                        <Select fullWidth 
                                        value={selectedColor}
                                        label="Voie"
                                        onChange={handleSelectedColorChange}
                                        sx={{backgroundColor: selectedColor, color: selectedColor == '#000000' ? 'white !important' : 'black', '&.MuiMenuItem-root:hover': {
            border: "2px solid green"
          }
}}
                                   >
                                            {selectedColors.map((e) => (
                                                <MenuItem value={e}
                                                sx={{backgroundColor: e + " !important", color: e == '#000000' ? 'white' : 'black'}}
                                            >{ difficultyFormat(voies.find((x) => x.couloir_id == selectedNumber && x.color == e).difficulty) }</MenuItem>
                                            ))}
                                    </Select>
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
    </div>
                }
    {!selectedColor && <div>
                <DialogTitle id="alert-dialog-title"> {"Choisir Voie: Couloir " + selectedNumber} </DialogTitle>
                <DialogContent>
                    <Box sx={{ flexGrow: 1 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={10}>
                                { selectedColors.map((e) => 
                                <Box sx={{ width: '25ch', height: '5ch', backgroundColor: e, cursor: 'pointer'}} id={e} onClick={chooseColor} > </Box>
                                )}
                            </Grid>
                    </Grid>
                </Box>
            </DialogContent>


        </div>}
        </Dialog>


        <Box sx={{ width: '90%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', paddingTop: '5px', paddingLeft: '10px' }}>

                    <Grid container spacing={1}>
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

                        <Grid item xs={6}>

                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                    <Tab label="Visuel" {...a11yProps(0)} />
                    <Tab label="Tableau" {...a11yProps(1)} />
                </Tabs>
                        </Grid>
                        </Grid>

            </Box>
            <TabPanel value={value} index={1}>
                <Box sx={{ flexGrow: 1 }} sx={{ flexGrow: 1, width: '85%', marginLeft: 'auto', marginRight: 'auto', paddingTop: '40px' }}>
                    <Grid container spacing={2}>

                        <Grid item xs={4}>


                        </Grid>
                        <Grid item xs={4}>
                            {/*                    <Slider defaultValue={[3,9]} valueLabelDisplay="auto" step={0.5} min={3} max={9} />  */}
                        </Grid>


        </Grid>

    </Box>

            {!mobile && 
    <Paper sx={{ width: '85%', marginLeft: 'auto', marginRight: 'auto', paddingTop: '20px' }}>
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
   
                    <TableContainer sx={{ maxHeight: 440, maxWidth: fixedWidth - 25, paddingTop: '100px'}}>
                        <Table stickyHeader aria-label="sticky table">
                            <TableHead>
                                <TableRow>
                                    <TableCell align="left" colSpan={10}> Devers </TableCell>
                                </TableRow>
                                <TableRow>
                                    {[...Array(10).keys()].map((column) => ( <TableCell key={column + 10} style={{top: 57}} > {column + 10} </TableCell>))}
                                </TableRow>
                            </TableHead>
                            <TableBody>

                                                   {[...Array(10).keys()].map((index) => (
                        <TableRow  key={index}>
                            {[...Array(10).keys()].map((column) => {
                                const tmp = voies.filter((e) => e.couloir_id == column + 10)[index]
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
            }





                        </TabPanel>

                        <TabPanel value={value} index={0} >

                            {mobile &&

                            <Box sx={{ flexGrow: 1 }} sx={{ flexGrow: 1, width: '85%', marginLeft: 'auto', marginRight: 'auto', paddingTop: '' }}>
                    <Grid container spacing={2}  onTouchStart={touchstart} onTouchEnd={touchend}>

                        {imageIndex == 0 && <ImageMapper src={URL_1} map={MAP_1} width={939/2.8} height={1596/2.8} onClick={areaClick}/> }
                        {imageIndex == 1 && <ImageMapper src={URL_2} map={MAP_2} width={1056/3} height={1656/3} onClick={areaClick}/> }
                        {imageIndex == 2 && <ImageMapper src={URL_3} map={MAP_3} width={1002/3} height={1690/3} onClick={areaClick}/> }
                        {imageIndex == 3 && <ImageMapper src={URL_4} map={MAP_4} width={903/2.8} height={1452/2.8} onClick={areaClick}/> }
                    </Grid>


                            </Box>
                            }

                            {!mobile &&
                            <Box sx={{ flexGrow: 1 }} sx={{ flexGrow: 1, width: '85%', marginLeft: 'auto', marginRight: 'auto', paddingTop: '' }}>
                                <ImageMapper src={URL} map={MAP} width={2604/2.1} height={1596/2.1} onClick={areaClick}/>
                            </Box>

                            }


                        </TabPanel>

                    </Box>


                    <Box sx={{ flexGrow: 1 }} sx={{ flexGrow: 1, width: '85%', marginLeft: 'auto', marginRight: 'auto', paddingTop: '40px' }}>

                        <Grid container spacing={2}>

                            <Grid item xs={10}>
                                <List>
                                    { insertedRoutes.map((e) => 
                                        <ListItem disablePadding>
                                                <Box sx={{ width: '4ch', height: '4ch', backgroundColor: e.voie.color, textAlign: 'center', color: e.voie.color == '#000000' ? 'white !important' : 'black'}}  >
                                                    <div style={{paddingTop: '5px'}}>{ difficultyFormat(e.voie.difficulty) }</div>
                                                </Box>
                                                <div style={{paddingLeft: '10px'}}>{"couloir: " + e.voie.couloir_id}</div>
                                                <IconButton aria-label="delete" id={e.id} onClick={deleteRoute}>
                                                    <DeleteIcon id={e.id}/>
                                                </IconButton>
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
