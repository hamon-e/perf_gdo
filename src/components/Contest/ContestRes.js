import React, {useState, useEffect, useRef} from 'react';
import axios from 'axios';
import {API_BASE_URL, ACCESS_TOKEN_NAME, RESTAURANT_ID} from '../../constants/apiConstants';
import { withRouter, Redirect } from "react-router-dom";
import "./Contest.css";
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../LanguageSelector/LanguageSelector';
import {Context, useContextObject} from '../Context/Context';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/StarBorderPurple500';
import IconButton from '@mui/material/IconButton';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import Grid from '@mui/material/Grid';

import ListSubheader from '@mui/material/ListSubheader';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import DraftsIcon from '@mui/icons-material/Drafts';
import SendIcon from '@mui/icons-material/Send';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import StarBorder from '@mui/icons-material/StarBorder';

import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormLabel from '@mui/material/FormLabel';

import Autocomplete from '@mui/material/Autocomplete';

import LastPageIcon from '@mui/icons-material/LastPage';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';

import TableFooter from '@mui/material/TableFooter';
import TablePagination from '@mui/material/TablePagination';

import { DataGrid } from '@mui/x-data-grid';

import TextField from '@mui/material/TextField';
const qs = require('qs');

function TablePaginationActions(props) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}

TablePaginationActions.propTypes = {
  count: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};

function ContestRes(props) {
    const { t, i18n } = useTranslation('Login');
    const {connectedStateHook, errorMessageHook, showBarHook, isAdminHook } = useContextObject();
    const [connected, setConnected] = connectedStateHook;
    const [errorMessage, updateErrorMessage] = errorMessageHook;
  const [showBar, setShowBar] = showBarHook;
  const [isAdmin, setIsAdmin] = isAdminHook;




    const [rows, setRows] = React.useState([
        {'name': "Jaune", 'valider': false, 'top': 15},
        {'name': "Vert", 'valider': true, 'top': 5},
        {'name': "Bleu", 'valider': true, 'top': 3},
        {'name': "Rouge", 'valider': false, 'top': 0}
    ])

  const [listUsers, setListUsers] = React.useState([])
  const [allUsers, setAllUsers] = React.useState([])
  const [users, setUsers] = React.useState([])
  const [selectedUser, setSelectedUser] = React.useState({name: ""})

  const [open, setOpen] = React.useState(false);
  const [openAuto, setOpenAuto] = React.useState(false);
  const handleCloseAuto = () => {
      setOpenAuto(false)
  }
  const handleClose = () => {
    setOpen(false);
  };

  const [res, setRes] = React.useState([])
  const [resSpeed, setResSpeed] = React.useState([])

  const contest_id = 3

  const [page, setPage] = React.useState(0);
  const [pageVoie, setPageVoie] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangePageVoie = (event, newPage) => {
    setPageVoie(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

    async function refresh_res() {
        var response = await axios.get(API_BASE_URL+'/contest_speed_res?contest_id=' + contest_id)
        setResSpeed(response.data)

        var response = await axios.get(API_BASE_URL+'/contest_res?contest_id=' + contest_id)
        setRes(response.data)

    }

const columns = [
  { field: 'name', headerName: 'Name', width: 140 },
  { field: 'score', headerName: 'Score Bloc', width: 140 },
  { field: 'score_voie', headerName: 'Score Voie', width: 140 },
  {
    field: 'score_vitesse',
    headerName: 'Score Vitesse',
    width: 140,
    valueGetter: (value, row) => `${resSpeed.find((e) => e.user_id == value.id).time}`,
  },
];

    useEffect(() => {
        refresh_res()
        //refreshUserClassement()
    }, []) 

    return(
        <div style={{paddingTop: '20px', width: '90%', height: 800}}>

                     <DataGrid
        rows={res}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 },
          },
        }}
        pageSizeOptions={[5, 10]}
      />


            </div>
    )
}

export default withRouter(ContestRes);
