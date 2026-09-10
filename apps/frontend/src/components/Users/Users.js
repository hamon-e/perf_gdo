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

import Paper from '@mui/material/Paper';

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
        { field: 'id', headerName: 'Id', width: 70 },
        { field: 'name', headerName: 'Name', width: 130 },
        { field: 'surname', headerName: 'Surname', width: 130 },
        { field: 'email', headerName: 'Email', width: 200 },
        { field: 'role_id', headerName: 'Role ID', width: 130 },
    ];

    async function getUsers() {
        const response = await axios.get(API_BASE_URL+'/users', { headers: { 'Authorization': "bearer "+localStorage.getItem(ACCESS_TOKEN_NAME) }})
        const data = response.data
        console.log(data)
        setUsers(response.data)
    }

    useEffect(() => {
        setHeaderTitle("Users")
        async function func() {
            await getUsers()
        }
        func()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    function onClick(event) {
    }

    const fabStyle = {
        position: 'absolute',
        bottom: 16,
        right: 16,
    };

    return(
        <div className="userpage">
            <div style={{ width: '90%', marginLeft: 'auto', marginRight: 'auto', paddingTop: '20px', height: window.innerHeight / 1.2 }}>
                    <DataGrid
                        rows={users}
                        columns={columns}
                        pageSize={25}
                        rowsPerPageOptions={[5]}
                        onRowClick={onClick}
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
