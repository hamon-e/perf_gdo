import React,{ useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { ACCESS_TOKEN_NAME, API_BASE_URL, RESTAURANT_ID } from '../../constants/apiConstants';
import axios from 'axios';
import './Users.css';
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
import {Context, useContextObject} from '../Context/Context';

function Users(props) {
    const { t, i18n } = useTranslation('Users');
    const {headerTitleHook} = useContextObject();
    const [headerTitle, setHeaderTitle] = headerTitleHook;

    const [users, setUsers] = useState([]);
    const [rows, setRows] = useState([]);
    const [openAdd, setOpenAdd] = useState(false);
    const columns = [
        { field: 'id', headerName: t('Id'), width: 70 },
        { field: 'name', headerName: t('Name'), width: 130 },
        { field: 'surname', headerName: t('Surname'), width: 130 },
        { field: 'email', headerName: t('Email'), width: 130 },
        { field: 'restaurant_id', headerName: t('Restaurant_id'), width: 130 },
        { field: 'category_name', headerName: t('Category_name'), width: 200 },
    ];

    const [new_name, setNewName] = useState("");
    const [new_surname, setNewSurname] = useState("");
    const [new_email, setNewEmail] = useState("");
    const [new_restaurant_id, setNewRestaurantId] = useState();
    const [new_category_id, setNewCategoryId] = useState();


    async function getUsers() {
        const response = await axios.get(API_BASE_URL+'/users', { headers: { 'Authorization': "bearer "+localStorage.getItem(ACCESS_TOKEN_NAME) }})
        const data = response.data
        console.log(data)
        setUsers(data.map(elem => {elem['category_name'] = elem['category']['name']; return elem}))
    }

    useEffect(() => {
        setHeaderTitle("Users")
        async function func() {
            await getUsers()
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
        setNewName("")
        setNewSurname("")
        setNewEmail("")
        setNewCategoryId()
        setNewRestaurantId()
    }
    async function handleSaveAdd() {
        console.log(new_name, new_surname, new_email, new_restaurant_id, new_category_id)
        const data = {
                 "name": new_name,
                  "surname": new_surname,
                  "email": new_email,
                  "restaurant_id": new_restaurant_id,
                  "category_id": new_category_id
        }

        const config = {
            headers: {
                "Accept": "application/json, text/plain, */*",
                "Content-Type": "application/json",
                "Authorization": "Bearer "+localStorage.getItem(ACCESS_TOKEN_NAME)
            }
        }
        console.log(data)
        await axios.post(API_BASE_URL+"/user", data, config)
 
        handleCloseAdd()
        await getUsers()
    }


    function handleNewName(data) { setNewName(data.target.value) }
    function handleNewSurname(data) { setNewSurname(data.target.value) }
    function handleNewEmail(data) { setNewEmail(data.target.value) }
    function handleNewRestaurantId(data) { setNewRestaurantId(parseInt(data.target.value)) }
    function handleNewCategoryId(data) { setNewCategoryId(parseInt(data.target.value)) }

    const fabStyle = {
        position: 'absolute',
        bottom: 16,
        right: 16,
    };

    return(
        <div className="userpage">
                <Fab sx={fabStyle} aria-label='Add' color='primary'> <IconButton size="large" onClick={handleAdd} > <AddIcon /> </IconButton> </Fab>
                <Dialog open={openAdd} onClose={handleCloseAdd} maxWidth="lg" >
                    <DialogTitle>{t("Add-User")}</DialogTitle>
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
                                <TextField id="name" label={t("Name")} value={new_name} onChange={handleNewName}/>
                                <TextField id="surname" label={t("Surname")} value={new_surname} onChange={handleNewSurname} />
                                <TextField id="email" label={t("Email")} value={new_email} onChange={handleNewEmail}/>
                                <TextField id="restaurant_id" label={t("Restaurant_id")} value={new_restaurant_id} onChange={handleNewRestaurantId}/>
                                <TextField id="category_id" label={t("Category_id")} value={new_category_id} onChange={handleNewCategoryId}/>
                            </Box>
                        </Box>
                        <Box gridColumn="span 6" >
    </Box>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                         <Button onClick={handleCloseAdd}>{t("Cancel")}</Button>
                         <Button onClick={handleSaveAdd}>{t("Save")}</Button>
                    </DialogActions>
                </Dialog>
                <div style={{ height: 700, width: '100%' }}>
                    <DataGrid
                        rows={users}
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

export default withRouter(Users);
