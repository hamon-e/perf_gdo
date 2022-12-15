import React,{ useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { ACCESS_TOKEN_NAME, API_BASE_URL, RESTAURANT_ID } from '../../constants/apiConstants';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import './Home.css';
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

import Grid from '@mui/material/Grid';

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

import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

function Home(props) {
    const {headerTitleHook, showBarHook} = useContextObject();
    const [headerTitle, setHeaderTitle] = headerTitleHook;
      const [showBar, setShowBar] = showBarHook;

    setShowBar(true)

    useEffect(() => {
        async function start() {

        }
        start()
        setHeaderTitle("Home")
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return(
        <div className="productpage" style={{padding: '20px', width: '90%'}}>
                    <Grid container spacing={5}>
                        <Grid item md={5} xs={12}>
            <Card sx={{ minWidth: 275 }}>
                <CardContent>
                    <Typography sx={{ fontSize: 18 }} color="text.secondary" gutterBottom>
                        Events
                    </Typography>
                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                        Noel des GDOs
                    </Typography>
                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                        Galette des rois
                    </Typography>
                </CardContent>
            </Card>

                    </Grid>
                        <Grid item md={5} xs={12}>
            <Card sx={{ minWidth: 275 }}>
                <CardContent>
                    <Typography sx={{ fontSize: 18 }} color="text.secondary" gutterBottom>
                        Recommendations
                    </Typography>
                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                        Decouvrir le devers
                    </Typography>
                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                        Grimper en tete
                    </Typography>
                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                        Faire de la dalle
                    </Typography>
                </CardContent>
            </Card>
                    </Grid>
                        <Grid item md={5} xs={12}>
            <Card sx={{ minWidth: 275 }}>
                <CardContent>
                    <Typography sx={{ fontSize: 18 }} color="text.secondary" gutterBottom>
                        Best Perfs
                    </Typography>
                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                        ...
                    </Typography>
                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                        ...
                    </Typography>
                </CardContent>
            </Card>
                    </Grid>
                        <Grid item md={5} xs={12}>
            <Card sx={{ minWidth: 275 }}>
                <CardContent>
                    <Typography sx={{ fontSize: 18 }} color="text.secondary" gutterBottom>
                        Suggestions
                    </Typography>
                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                        dalle: 6a couloir 18
                    </Typography>
                   <Typography sx={{ mb: 1.5 }} color="text.secondary">
                       devers: 6a couloir 14
                    </Typography>
                </CardContent>
            </Card>
                    </Grid>


 
                    </Grid>
        </div> 
    )
}

export default withRouter(Home);
