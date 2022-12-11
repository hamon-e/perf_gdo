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
    const [mobile, setMobile] = React.useState(false);
    const [widthSize, setWidthSize] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
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

    const URL_1 = 'gdo-1.png';
    const MAP_1 = {
        name: 'my-map-1',
        areas: []
    }
 
    const URL_2 = 'gdo-2.png';
    const MAP_2 = {
        name: 'my-map-2',
        areas: []
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

    function handleResize() {
        setWidthSize(window.innerWidth)
        console.log(window.innerWidth)
    }

    useEffect(() => {
        async function start() {
            await refreshVoie()
        }
        start()
        setHeaderTitle("Ajouter une Seance")
        window.addEventListener("resize", handleResize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
            if (widthSize && widthSize < 900) {
                setMobile(true)
                console.log("Mobile")
            } else {
                setMobile(false)
            }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [widthSize])



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
            setSelectedColor(false)
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
            <Box sx={{ borderBottom: 1, borderColor: 'divider', paddingTop: '5px', paddingLeft: '10px' }}>

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

                            {mobile &&

                            <Box sx={{ flexGrow: 1 }} sx={{ flexGrow: 1, width: '85%', marginLeft: 'auto', marginRight: 'auto', paddingTop: '' }}>
                    <Grid container spacing={2}>

                        <Grid item xs={12}>
                                <ImageMapper src={URL_1} map={MAP_1} width={939/2} height={1596/2} onClick={areaClick}/>
                        </Grid>
                        <Grid item xs={12}>
                                <ImageMapper src={URL_2} map={MAP_2} width={1326/2} height={1671/2} onClick={areaClick}/>
                        </Grid>
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
