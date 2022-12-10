import React,{ useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { ACCESS_TOKEN_NAME, API_BASE_URL, RESTAURANT_ID } from '../../constants/apiConstants';
import axios from 'axios';
import './Restaurants.css';
import deleteProd from '../../delete.svg';
import modifyProd from '../../edit.svg';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import CustomNoResultsOverlay from '../DataGrid/CustomNoResultsOverlay.js'

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

import {
  DataGrid,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
} from '@mui/x-data-grid';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import {useContextObject} from '../Context/Context';

function Restaurants(props) {
    const { t, i18n } = useTranslation('Restaurants');
    const {headerTitleHook} = useContextObject();
    const [headerTitle, setHeaderTitle] = headerTitleHook;

    const [restaurants, setRestaurants] = useState([]);
    const [rows, setRows] = useState([]);
    const [openAdd, setOpenAdd] = useState(false);
    const columns = [
        { field: 'id', headerName: t('Id'), width: 70 },
        { field: 'name', headerName: t('Name'), width: 200 },
        { field: 'address', headerName: t('Address'), width: 130 },
        { field: 'zip_code', headerName: t('Zip_Code'), width: 130 },
        { field: 'city', headerName: t('City'), width: 130 },
        { field: 'group_id', headerName: t('Group_Id'), width: 130 },
        { field: 'country_id', headerName: t('Country_Id'), width: 130 },
    ];

    async function getRestaurants() {
        const response = await axios.get(API_BASE_URL+'/restaurants', { headers: { 'Authorization': "bearer "+localStorage.getItem(ACCESS_TOKEN_NAME) }})
        const data = response.data
        console.log(data)
        setRestaurants(data)
    }

    useEffect(() => {
        setHeaderTitle("Restaurants")
        async function func() {
            await getRestaurants()
        }
        func()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    function func2(event) {
    }

    function handleAdd() {
        setOpenAdd(true)
    }
    function handleCloseAdd() {
        setOpenAdd(false)
    }



    const fabStyle = {
        position: 'absolute',
        bottom: 16,
        right: 16,
    };

    return(
        <div className="restaurantpage">
                <Fab sx={fabStyle} aria-label='Add' color='primary' onClick={handleAdd} size="large">  <AddIcon />  </Fab>
                <Dialog open={openAdd} onClose={handleCloseAdd} maxWidth="lg" >
                    <DialogTitle>{t("Add-Restaurant")}</DialogTitle>
                    <DialogContent>
                        <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={2}>
                                <Box gridColumn="span 6">

                          <Box
                            gridColumn="span 6"
                            component="form"
                            sx={{
                                '& .MuiTextField-root': { m: 1, width: '20ch' },
                            }}
                            noValidate
                            autoComplete="off"
                        >
                                <TextField id="name" label={t("Name")} />
                                <TextField id="address" label={t("Address")} />
                                <TextField id="zip_code" label={t("Zip_Code")} />
                                <TextField id="city" label={t("City")} />
                                <TextField id="group_id" label={t("Group_Id")} />
                                <TextField id="country_id" label={t("Country_Id")} />
                            </Box>
                        </Box>
                        <Box gridColumn="span 6" >
    </Box>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                         <Button onClick={handleCloseAdd}>{t("Cancel")}</Button>
                         <Button onClick={handleCloseAdd}>{t("Save")}</Button>
                    </DialogActions>
                </Dialog>
                <div style={{ height: 700, width: '100%' }}>
                    <DataGrid
                        rows={restaurants}
                        columns={columns}
                        pageSize={25}
                        rowsPerPageOptions={[5]}
                        onRowClick={func2}
                        components={{
                            NoResultsOverlay: () => (
                                <CustomNoResultsOverlay/>
                            ),
                            NoRowsOverlay: () => (
                                <CustomNoResultsOverlay/>
                            ),
                        }}
                    />
            </div> 
        </div> 
    )
}

export default withRouter(Restaurants);
