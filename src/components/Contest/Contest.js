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

function Contest(props) {
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
  const [newName, setNewName] = React.useState("");
      const [newAge, setNewAge] = React.useState("homme");
  const [newDifficulty, setNewDifficulty] = React.useState("tranquille");

  const [blocs, setBlocs] = React.useState([])
  const [blocRes, setBlocRes] = React.useState([])

  const [voies, setVoies] = React.useState([])
  const [voieRes, setVoieRes] = React.useState([])

  const [zones, setZones] = React.useState([])
  const [selectedZone, setSelectedZone] = React.useState({name: ""})

  const [userClassement, setUserClassement] = React.useState(0)
  const [userClassementVitesse, setUserClassementVitesse] = React.useState(0)

  const [tempsVitesse, setTempsVitesse] = React.useState("")

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

    async function handleVitesseChange(e) {
        setTempsVitesse(e.target.value)
          const payload = {
              contest_id: contest_id,
              user_id: selectedUser.id,
              time: e.target.value
      }
          var response = await axios.post(API_BASE_URL+'/contest_speed', payload)
        refreshUserClassement()

    }

    function handleZoneChange(e) {
        const zone = zones.find((p) => p.name == e.target.value)
        setSelectedZone(zone)
        refreshBlock(zone.id)
        refreshVoie(zone.id)
    }


  async function submitForm() {
      const payload = {
          contest_id: contest_id,
          name: newName,
                    age: newAge == "homme" ? 0 : 1,
          difficulty: newDifficulty == "tranquille" ? 0 : 1,
          score: 0,
          score_voie: 0
      }
      var response = await axios.post(API_BASE_URL+'/contest_user', payload)
      setOpen(false)
      setNewName("")
      setNewAge("homme")
      setNewDifficulty("tranquille")
      setUsers([...users, response.data])
      setSelectedUser(response.data)
        refreshSpeed(response.data.id)
        refresh_bloc_res(response.data.id)
        refresh_voie_res(response.data.id)
        refreshUserClassement(response.data.id)
  }

    async function refreshUsers() {
        var response = await axios.get(API_BASE_URL+'/contest_users?contest_id=' + contest_id)
        setAllUsers(response.data)
        setListUsers(response.data.map((e) => e.name))
    }

    function handleNewNameChange(e) {
        setNewName(e.target.value)
    }

    function handleNewAgeChange(e) {
        setNewAge(e.target.value)
    }

    function handleNewDifficultyChange(e) {
        setNewDifficulty(e.target.value)
    }

    function handleUserChange(e) {
        const user = users.find((p) => p.name == e.target.value)
        setSelectedUser(user)
        refreshSpeed(user.id)
        refresh_bloc_res(user.id)
        refresh_voie_res(user.id)
        refreshUserClassement(user.id)
    }

    function handleNewUserChange(e) {
        setOpenAuto(false)
        const user = allUsers.find((p) => p.name == e.target.textContent)
        if (!users.find((e) => e.id === user.id)) {
            const tmp = [...users, user]
            setUsers(tmp)
        }
        setSelectedUser(user)
        refresh_bloc_res(user.id)
        refresh_voie_res(user.id)
        refreshUserClassement(user.id)
        refreshSpeed(user.id)
    }

    function handleNewUser(e) {
        setOpen(true)
    }


    async function handleSearchUser(e) {
        //var response = await axios.get(API_BASE_URL+'/constest_users?constest_id=' + '1')
        //setListUsers(response)
        await refreshUsers()
        //setAllUsers(["Benoit", "Roger", "Dupond"])
        setOpenAuto(true)
    }

    async function refreshBlock(zone_id) {
        var response = await axios.get(API_BASE_URL+'/contest_blocs?contest_id=' + contest_id + "&zone_id=" + zone_id)
        setBlocs(response.data)
    }

    async function refreshVoie(zone_id) {
        var response = await axios.get(API_BASE_URL+'/contest_voies?contest_id=' + contest_id + "&zone_id=" + zone_id)
        setVoies(response.data)
    }


    async function refreshSpeed(user_id) {
        var response = await axios.get(API_BASE_URL+'/contest_speed?contest_id=' + contest_id + "&user_id=" + user_id)
        if (response.data != -1) {
            setTempsVitesse(response.data)
        } else {
            setTempsVitesse("")
        }
    }

    async function get_zones() {
        var response = await axios.get(API_BASE_URL+'/contest_zones?contest_id=' + contest_id)
        setZones(response.data)
        refreshBlock(response.data[0].id)
        refreshVoie(response.data[0].id)
        setSelectedZone(response.data[0])
    }

    async function refresh_bloc_res(user_id) {
        var response = await axios.get(API_BASE_URL+'/contest_bloc_res?contest_id=' + contest_id + "&user_id=" + user_id)
        setBlocRes(response.data)
    }

    async function refresh_voie_res(user_id) {
        var response = await axios.get(API_BASE_URL+'/contest_voie_res?contest_id=' + contest_id + "&user_id=" + user_id)
        setVoieRes(response.data)
    }


    async function handleRowClick(bloc_id) {
      const payload = {
          contest_id: contest_id,
          user_id: selectedUser.id,
          bloc_id: bloc_id
      }
      var response = await axios.post(API_BASE_URL+'/contest_bloc_res', payload)
        refresh_bloc_res(selectedUser.id)
        refreshBlock(selectedZone.id)
    }

    async function handleVoieRowClick(voie_id) {
      const payload = {
          contest_id: contest_id,
          user_id: selectedUser.id,
          voie_id: voie_id
      }
      var response = await axios.post(API_BASE_URL+'/contest_voie_res', payload)
        refresh_voie_res(selectedUser.id)
        refreshVoie(selectedZone.id)
    }


    async function refreshUserClassement(user_id=-1) {
        if (user_id != -1 || selectedUser.name) {
            const tmp = user_id == -1 ? selectedUser.id : user_id
            var response = await axios.get(API_BASE_URL+'/contest_user_classement?contest_id=' + contest_id + "&user_id=" + tmp)
            setUserClassement(response.data)
            //response = await axios.get(API_BASE_URL+'/contest_user_speed_classement?contest_id=' + contest_id + "&user_id=" + tmp)
            //setUserClassementVitesse(response.data)
        }
        //setTimeout(refreshUserClassement, 3000);
    }

    const interval = useRef();
    useEffect(() => {
        if (interval.current) {
            clearInterval(interval.current);
        }
        //interval.current = setInterval(refreshUserClassement, 3000)
    }, [selectedUser])

    useEffect(() => {
        get_zones()
        //refreshUserClassement()
    }, []) 

    return(
        <div style={{paddingTop: '20px', width: '90%'}}>

        <Dialog open={open} onClose={handleClose} >
            <DialogTitle id="alert-dialog-title"> {"Inscription"} </DialogTitle>
            <DialogContent>
                <Box sx={{ flexGrow: 1 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={10}> </Grid>
                        <Grid item xs={10}>
                            <Box sx={{ width: '25ch' }} component="form" >
                                <div>
                                    <TextField fullWidth label="Nom / Prenom" value={newName} onChange={handleNewNameChange}/>
                                </div>

                    <Grid container spacing={2}>
                        <Grid item xs={12}> 
                                <div style={{paddingTop: '10px'}}>

        <FormControl>
            <FormLabel id="demo-controlled-radio-buttons-group">Genre</FormLabel>
            <RadioGroup
            aria-labelledby="demo-controlled-radio-buttons-group"
            name="controlled-radio-buttons-group"
            value={newAge}
            onChange={handleNewAgeChange}
        >
                <FormControlLabel value="homme" control={<Radio />} label="Homme" />
                <FormControlLabel value="femme" control={<Radio />} label="Femme" />
            </RadioGroup>
        </FormControl>
    </div>
    </Grid>
                        <Grid item xs={6}> 
                                <div style={{paddingTop: '10px'}}>
        <FormControl>
            <FormLabel id="demo-controlled-radio-buttons-group">Difficulte</FormLabel>
            <RadioGroup
            aria-labelledby="demo-controlled-radio-buttons-group"
            name="controlled-radio-buttons-group"
            value={newDifficulty}
            onChange={handleNewDifficultyChange}
        >
                <FormControlLabel value="tranquille" control={<Radio />} label="Tranquille" />
                <FormControlLabel value="énervé" control={<Radio />} label="Enervé" />
            </RadioGroup>
        </FormControl>
    </div>
    </Grid>
    </Grid>



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

            <Grid container spacing={2}>
                <Grid item xs={4}>
                    <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">Nom</InputLabel>
                        <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={selectedUser.name}
                        label="Nom"
                        onChange={handleUserChange} >
                        { users.map((e) => 
                            <MenuItem key={e.id} value={e.name}>{e.name}</MenuItem>
                        )}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={2}>
                    <IconButton size="large" onClick={handleNewUser} > <AddIcon /> </IconButton>
                </Grid>
                <Grid item xs={2}>
                    { !openAuto &&
                    <IconButton size="large" onClick={handleSearchUser} > <SearchIcon /> </IconButton>
                    }
                    { openAuto &&
                         <Autocomplete
                            disablePortal
                            id="combo-box-demo"
                         options={listUsers}
                            sx={{ width: 300 }}
                         onChange={handleNewUserChange}
                            renderInput={(params) => <TextField {...params} label="inscrits" />}

                        />
                    }

                </Grid>
            </Grid>

            {selectedUser.name && 
                    <div>
            <Grid container spacing={8} style={{paddingTop: '20px'}}>
                <Grid item md={6} xs={12}>
                    {/*         <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">Zones</InputLabel>
                        <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={selectedZone.name}
                        label="Zones"
                        onChange={handleZoneChange} >
                        { zones.map((e) => 
                            <MenuItem key={e.id} value={e.name}>{e.name}</MenuItem>
                        )}
                        </Select>
                    </FormControl>
                        */}


                        <TableContainer sx={{}} component={Paper}>
                            <Table sx={{}} aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Blocs</TableCell>
                                        <TableCell align="right">Top</TableCell>
                                        <TableCell align="right">Nombre de Top</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {blocRes && blocs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                                        <TableRow
                                        onClick={() => handleRowClick(row.id)}
                                        key={row.id}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }} >
                                        <TableCell component="th" scope="row"> {row.name} </TableCell>
                                        <TableCell align="right">{blocRes.find((e) => e.bloc_id == row.id) ? <CheckIcon /> : <CloseIcon />}</TableCell>
                                        <TableCell align="right">{row.top}</TableCell>
                                    </TableRow>
                                    ))}
                                </TableBody>
   <TableFooter>
          <TableRow>
            <TablePagination
              rowsPerPageOptions={[]}
              colSpan={3}
              count={blocs.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              //onRowsPerPageChange={handleChangeRowsPerPage}
              ActionsComponent={TablePaginationActions}
            />
          </TableRow>
        </TableFooter>
                            </Table>
                        </TableContainer>
                    </Grid>

                <Grid item md={6} xs={12}>

                        <TableContainer sx={{}} component={Paper}>
                            <Table sx={{}} aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Voies</TableCell>
                                        <TableCell align="right">Top</TableCell>
                                        <TableCell align="right">Nombre de Top</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {voieRes && voies.slice(pageVoie * rowsPerPage, pageVoie * rowsPerPage + rowsPerPage).map((row) => (
                                        <TableRow
                                        onClick={() => handleVoieRowClick(row.id)}
                                        key={row.id}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }} >
                                        <TableCell component="th" scope="row"> {row.name} </TableCell>
                                        <TableCell align="right">{voieRes.find((e) => e.voie_id == row.id) ? <CheckIcon /> : <CloseIcon />}</TableCell>
                                        <TableCell align="right">{row.top}</TableCell>
                                    </TableRow>
                                    ))}
                                </TableBody>
   <TableFooter>
          <TableRow>
            <TablePagination
              rowsPerPageOptions={[]}
              colSpan={3}
              count={voies.length}
              rowsPerPage={rowsPerPage}
              page={pageVoie}
              onPageChange={handleChangePageVoie}
              //onRowsPerPageChange={handleChangeRowsPerPage}
              ActionsComponent={TablePaginationActions}
            />
          </TableRow>
        </TableFooter>

                            </Table>
                        </TableContainer>
                    </Grid>



                    {/*
                <Grid item md={4} xs={12}>

                    <Box sx={{p: 2, border: '1px dashed grey'}}>
                        <ListSubheader component="div" id="nested-list-subheader">
                            CLASSEMENT BLOC
                            </ListSubheader>
                            {userClassement}

                </Box>

                    <Box sx={{p: 2, border: '1px dashed grey'}}>
                        <ListSubheader component="div" id="nested-list-subheader">
                            CLASSEMENT VITESSE 
                            </ListSubheader>
                            {userClassementVitesse}

                </Box>

                </Grid>
                */}




                <Grid item md={8} xs={12}>
            <TextField fullWidth label="Temps Vitesse (secondes)" value={tempsVitesse} onChange={handleVitesseChange}/>
                </Grid>

                </Grid>


    </div>

                }


    </div>
    )
}

export default withRouter(Contest);
