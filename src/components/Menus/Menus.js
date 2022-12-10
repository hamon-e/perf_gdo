import React,{ useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { ACCESS_TOKEN_NAME, API_BASE_URL, RESTAURANT_ID } from '../../constants/apiConstants';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import './Menus.css';
import deleteProd from '../../delete.svg';
import modifyProd from '../../edit.svg';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import CustomNoResultsOverlay from '../DataGrid/CustomNoResultsOverlay.js'

import Checkbox from '@mui/material/Checkbox';
import Select from '@mui/material/Select';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';

import Skeleton from '@mui/material/Skeleton';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import Autocomplete from '@mui/material/Autocomplete';

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';

import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';

import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import {
  DataGrid,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
} from '@mui/x-data-grid';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import PropTypes from 'prop-types';
import {Context, useContextObject} from '../Context/Context';

import Grid from '@mui/material/Grid';

import { styled } from '@mui/material/styles';

import FullCalendar from '@fullcalendar/react' // must go before plugins
import dayGridPlugin from '@fullcalendar/daygrid' // a plugin!

import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
  
import { Doughnut } from 'react-chartjs-2';
import { Line } from 'react-chartjs-2';
import { Bar } from 'react-chartjs-2';

import Typography from '@mui/material/Typography';

ChartJS.register(ArcElement, Tooltip, Legend,   CategoryScale, LinearScale, PointElement, LineElement, Title);

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
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  
       
    useEffect(() => {
        async function start() {
            var response = await axios.get(API_BASE_URL+'/products_kind', { headers: { 'Authorization': "bearer "+localStorage.getItem(ACCESS_TOKEN_NAME) }})
        }
        start()
        setHeaderTitle("Ma Progression")
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];

const data = {
  labels,
  datasets: [
    {
      label: 'Dalles',
      data: ['5.25', '6.25', '4', '5.5', '6', '6.25', '6.5'],
      borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
    },
    {
      label: 'Devers',
      data: ['3.25', '4.25', '5.5', '5', '5.5', '6', '5.25'],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)'
    },
    {
      label: 'Verrin',
      data: ['4.25', '6', '3', '4.5', '5', '5.25', '6'],
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
    },

  ],
};

const data2 = {
  labels: ['Dalles', 'Devers', 'Verrin'],
  datasets: [
    {
      label: '# of Votes',
      data: [12, 19, 3],
      backgroundColor: [
        'rgba(255, 99, 132, 0.5)',
        'rgba(53, 162, 235, 0.5)',
        'rgba(75, 192, 192, 0.5)',
      ],
    },
  ],
};

const data3 = {
  labels: ['Tete', 'Moulinette'],
  datasets: [
    {
      label: '# of Votes',
      data: [12, 25],
      backgroundColor: [
        'rgba(255, 99, 132, 0.5)',
        'rgba(53, 162, 235, 0.5)',
      ],
    },
  ],
};


    return(
        <div className="productpage">
            <Box sx={{ width: '90%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                        <Tab label="Annuel" {...a11yProps(0)} />
                        <Tab label="Mensuel" {...a11yProps(1)} />
                        <Tab label="Hebdomadaire" {...a11yProps(2)} />
                    </Tabs>
                </Box>
                <TabPanel value={value} index={0}>

                    <Box sx={{ flexGrow: 1 }}>
                        <Grid container spacing={4}>
                            <Grid item xs={6}>
                                <Line data={data} />
                            </Grid>
                            <Grid item xs={3}>
                                <Doughnut data={data2} />
                            </Grid>
                            <Grid item xs={3}>
                                <Doughnut data={data3} />
                            </Grid>
                        </Grid>
                    </Box>

                </TabPanel>
                <TabPanel value={value} index={1}>

                    <Box sx={{ flexGrow: 1 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={8}>
                                <Line data={data} />
                            </Grid>
                            <Grid item xs={4}>
                                <Doughnut data={data2} />
                            </Grid>
                        </Grid>
                    </Box>

                </TabPanel>
                <TabPanel value={value} index={2}>

                    <Box sx={{ flexGrow: 1 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={8}>
                                <Line data={data} />
                            </Grid>
                            <Grid item xs={4}>
                                <Doughnut data={data2} />
                            </Grid>
                        </Grid>
                    </Box>


                </TabPanel>
            </Box>


        </div> 
    )
}

export default withRouter(Products);
