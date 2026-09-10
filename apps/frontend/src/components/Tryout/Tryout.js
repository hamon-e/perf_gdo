import React,{ useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { ACCESS_TOKEN_NAME, API_BASE_URL, RESTAURANT_ID } from '../../constants/apiConstants';
import axios from 'axios';
import './Tryout.css';
import deleteProd from '../../delete.svg';
import modifyProd from '../../edit.svg';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { useTranslation } from 'react-i18next';

import Select from '@mui/material/Select';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';

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

import Skeleton from '@mui/material/Skeleton';

import { DataGrid } from '@mui/x-data-grid';

import ReactJson from 'react-json-view'
import {Context, useContextObject} from '../Context/Context';

import { styled } from '@mui/material/styles';
const Input = styled('input')({
  display: 'none',
});


function Tryout(props) {
    const { t, i18n } = useTranslation('Tryout');
    const {isAdminHook, userHook, restaurantHook, headerTitleHook, languageStateHook} = useContextObject();
    const [isAdmin, setIsAdmin] = isAdminHook;
    const [user, setUser] = userHook;
    const [restaurant, setRestaurant] = restaurantHook;
    const [headerTitle, setHeaderTitle] = headerTitleHook;
  
    const [toAdd, setToAdd] = React.useState({});
    const [image, setImage] = React.useState("");
    const [result, setResult] = React.useState("");
    const [json, setJson] = React.useState({});

    const [restaurants, setRestaurants] = React.useState([]);

    async function getRestaurants() {
        const response = await axios.get(API_BASE_URL+'/restaurants' , { headers: { 'Authorization': "bearer "+localStorage.getItem(ACCESS_TOKEN_NAME) }})
        console.log("RESTAURANTS")
        console.log(response.data)
        setRestaurants(response.data)
    }


    async function verifyAdminRestaurant() {
        console.log("ADMIN")
        console.log(isAdmin)
        if (isAdmin) {
            await getRestaurants()
            if(restaurant === -1){
                setRestaurant(user.restaurant_id)
            }
        }
    }
    useEffect(() => {
        verifyAdminRestaurant()
    }, [isAdmin])

    useEffect(() => {
        setHeaderTitle("Tryout")
        verifyAdminRestaurant()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    function handleImg(data) {
        console.log(data.target.files)

        const files = data.target.files;
        if (FileReader && files && files.length) {
            var fr = new FileReader();
            fr.onload = async function () {
                setImage(fr.result)
                const res = await fetch(fr.result)
                const blob = await res.blob()
                console.log(blob)

                let data = new FormData()

                data.append('name', 'photo')
                data.append('photo', files[0])

                let config = {
                    headers : {
                        'Content-Type' : 'multipart/form-data',
                        'Authorization': "Bearer "+ localStorage.getItem(ACCESS_TOKEN_NAME)
                    }
                }
                const r = await axios.post(API_BASE_URL+'/analyzeplate/?restaurant_id=' + restaurant, data, config)
                setJson(r.data)
                console.log(r.data)
            }
            fr.readAsDataURL(files[0]);
        }
    }

    function handleSelectAdminRestaurant(data) {
        setRestaurant(data.target.value);
    }

    return(
        <div className="tryout">
        <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={4}>

    { isAdmin &&
                <Box gridColumn="span 12">
    <Select labelId="restaurant" id="admin_restaurant" value={restaurant} onChange={handleSelectAdminRestaurant} >
        { restaurants.map(elem => { return ( <MenuItem value={elem.id}>{elem.name}</MenuItem>) } ) }
        </Select> 
                </Box>
    }
            <Box gridColumn="span 4">
                <Box gridColumn="span 12">
                    <label htmlFor="contained-button-file">
                        <Input accept="image/*" id="contained-button-file" multiple type="file" onChange={handleImg} />
                        <Button variant="contained" component="span">
                            {t("Upload")}
                        </Button>
                    </label>
                </Box>
                <Box gridColumn="span 12">
            {image && <img src={image} alt="" width="400px"/>}
                </Box>

            </Box>
            <Box gridColumn="span 8">
            <ReactJson src={json} theme="solarized" style={{'textAlign': 'left'}} />
            </Box>

        </Box>
    </div> 
    )
}

export default withRouter(Tryout);
