import React,{ useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { ACCESS_TOKEN_NAME, API_BASE_URL, RESTAURANT_ID } from '../../constants/apiConstants';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import './Accueil.css';
import deleteProd from '../../delete.svg';
import modifyProd from '../../edit.svg';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import CustomNoResultsOverlay from '../DataGrid/CustomNoResultsOverlay.js'

import  { Redirect } from 'react-router-dom'

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

function Accueil(props) {

  const {showBarHook, openHook} = useContextObject();
  const [showBar, setShowBar] = showBarHook;
  const [open, setOpen] = openHook;

    setShowBar(false)
    if (open)
        setOpen(false)

    function redirectLogin() {
       props.history.push('/login')
    }

    return(
        <div style={{
            background: "url(https://lesgdo.org/photo_fond/Mecdcf6036a495cba598b.jpg) no-repeat left bottom",
            backgroundSize: 'cover',
            width: "100%",
            height: "100%",
            position: "fixed",
            backgroundPosition: "right top",
        }} >
        <div style={{    'textAlign': 'center', 'height': '100%'}}>
        <Grid container spacing={2} style={{height: '100%', marginTop: '0'}}>
            <Grid item xs={12} md={6} style={{  background: 'rgba(255, 122, 89, .5)', cursor: 'pointer'}} onClick={redirectLogin} >
                    <span style={{height: '100%',     display: 'inline-block',     'verticalAlign': 'middle'}}> </span>
                    <img src="https://gdo.axyomes.com/origine/logo.png" style={{ 'width': '50%', 'verticalAlign': 'middle'}} />
            </Grid>
            <Grid item xs={12} md={6} style={{  background: 'rgba(255, 255, 255, .5)', cursor: 'pointer'}} onClick={redirectLogin}>
                    <span style={{height: '100%',     display: 'inline-block',     'verticalAlign': 'middle'}}> </span>
                    <img src="https://www.judo-club-quimperois.com/wp-content/uploads/2020/08/atout-sport13.png" style={{ 'width': '50%', 'verticalAlign': 'middle'}} />
            </Grid>
        </Grid>
    </div>
</div>
    )
}

export default withRouter(Accueil);
