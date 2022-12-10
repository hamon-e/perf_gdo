import React,{ useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { ACCESS_TOKEN_NAME, API_BASE_URL, RESTAURANT_ID } from '../../constants/apiConstants';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import './Products.css';
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

function Products(props) {
    const {isAdminHook, userHook, restaurantHook, headerTitleHook, } = useContextObject();
    const [headerTitle, setHeaderTitle] = headerTitleHook;

  const {showBarHook, openHook} = useContextObject();
  const [showBar, setShowBar] = showBarHook;
  const [openNav, setOpenNav] = openHook;
    setShowBar(true)

  const [open, setOpen] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState({});

  const [events, setEvents] = useState([
      {
        title: 'simple event',
        start: '2022-10-22',
        display: 'background'

      }])

  
 const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
       
    useEffect(() => {
        async function start() {

        }
        start()
        setHeaderTitle("Inscriptions")
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [openNav])

    function eventClick(info) {
      const eventObj = info.event;
        console.log(info.event)
        setSelectedEvent(eventObj)
        setOpen(true)
    }

    async function dateSet(info) {
        var response = await axios.get(API_BASE_URL+'/seances?start=' + info.startStr.split('+')[0] + '&end=' + info.endStr.split('+')[0], { headers: { 'Authorization': "bearer "+localStorage.getItem(ACCESS_TOKEN_NAME) }})
        console.log(events)
        const new_events = response.data.map((e) => ({title: 'Seance Adulte', start: e.start}))
        for (const event of response.data) {
            if (!new_events.find((e) => e.start == event.start.split('T')[0]))
                new_events.push({title: '', start: event.start.split('T')[0], display: 'background'})
            console.log(event)
        }
        setEvents(new_events)
        console.log(response.data.map((e) => ({title: 'lol', start: e.start, display: 'background'})))
    }



    return(
        <div className="productpage" style={{padding: '20px', width: '90%'}}>
             <FullCalendar
              plugins={[ dayGridPlugin ]}
              initialView="dayGridMonth"
              eventClick={eventClick}
              datesSet={dateSet}
               events= {events}
height={'80vh'}
                />

<Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirmation"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
              S'inscrire a la seance {selectedEvent.title} {selectedEvent.startStr}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleClose} autoFocus> S'inscrire</Button>
        </DialogActions>
      </Dialog>
        </div> 
    )
}

export default withRouter(Products);
