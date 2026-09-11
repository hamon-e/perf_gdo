import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {API_BASE_URL, ACCESS_TOKEN_NAME} from '../../constants/apiConstants';
import { withRouter, Redirect } from "react-router-dom";
import "./CreateContest.css";
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

import TextField from '@mui/material/TextField';
const qs = require('qs');

function CreateContest(props) {
    const { t, i18n } = useTranslation('Login');
    const {connectedStateHook, errorMessageHook, showBarHook, isAdminHook } = useContextObject();
    const [connected, setConnected] = connectedStateHook;
    const [errorMessage, updateErrorMessage] = errorMessageHook;
  const [showBar, setShowBar] = showBarHook;
  const [isAdmin, setIsAdmin] = isAdminHook;

    const [rows, setRows] = React.useState([])
    const [rowsZone, setRowsZone] = React.useState([])
    const [rowsBlock, setRowsBlock] = React.useState([])
    const [newName, setNewName] = React.useState("")
    const [newZoneName, setNewZoneName] = React.useState("")
    const [newBlocName, setNewBlocName] = React.useState("")
    const [newBlocDifficulty, setNewBlocDifficulty] = React.useState(0)

    function handleNameChange(e) {
        setNewName(e.target.value)
    }
    function handleZoneNameChange(e) {
        setNewZoneName(e.target.value)
    }
    function handleBlocNameChange(e) {
        setNewBlocName(e.target.value)
    }
    function handleBlocDifficultyChange(e) {
        setNewBlocDifficulty(e.target.value)
    }


  const [open, setOpen] = React.useState(false);
  const [openZone, setOpenZone] = React.useState(false);
  const [openBloc, setOpenBloc] = React.useState(false);
  const handleClose = () => {
    setOpen(false);
  };
  const handleCloseZone = () => {
    setOpenZone(false);
  };
  const handleCloseBloc = () => {
    setOpenBloc(false);
  };

  const [selectedContestId, setSelectedContestId] = React.useState(-1);
  const [selectedZoneId, setSelectedZoneId] = React.useState(-1);


  function handleNewUser() {
      setOpen(true)
  }
  function handleNewZone() {
      setOpenZone(true)
  }
  function handleNewBloc() {
      setOpenBloc(true)
  }


    function handleRowClick(e) {
        setSelectedContestId(e)
        refreshZone(e)
    }

    function handleRowZoneClick(e) {
        setSelectedZoneId(e)
        refreshBloc(e)
    }

  async function submitForm() {
      const payload = {
          name: newName
      }
      var response = await axios.post(API_BASE_URL+'/contest', payload)
      refreshContest()
      setNewName("")
      setOpen(false)
  }

  async function submitFormZone() {
      const payload = {
          name: newZoneName,
          contest_id: selectedContestId
      }
      var response = await axios.post(API_BASE_URL+'/contest_zone', payload)
      refreshZone(selectedContestId)
      setNewZoneName("")
      setOpenZone(false)
  }

  async function submitFormBloc() {
      const payload = {
          zone_id: selectedZoneId,
          contest_id: selectedContestId,
          name: newBlocName,
          difficulty: parseInt(newBlocDifficulty, 10),
          top: 0,
      }
      var response = await axios.post(API_BASE_URL+'/contest_bloc', payload)
      refreshBloc(selectedZoneId)
      setNewBlocName("")
      setNewBlocDifficulty(0)
      setOpenBloc(false)
  }


    async function refreshContest() {
        var response = await axios.get(API_BASE_URL+'/contests')
        setRows(response.data)
    }

    async function refreshZone(contest_id) {
        var response = await axios.get(API_BASE_URL+'/contest_zones?contest_id=' + contest_id)
        setRowsZone(response.data)
    }

    async function refreshBloc(zone_id) {
        var response = await axios.get(API_BASE_URL+'/contest_blocs?contest_id=' + selectedContestId + "&zone_id=" + zone_id)
        setRowsBlock(response.data)
    }


    useEffect(() => {
        refreshContest()
    }, []) 

    return(
        <div style={{paddingTop: '20px', width: '90%'}}>

        <Dialog open={open} onClose={handleClose} >
            <DialogTitle id="alert-dialog-title"> {"Create Contest"} </DialogTitle>
            <DialogContent>
                <Box sx={{ flexGrow: 1 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={10}>
                            <Box sx={{ width: '25ch' }} component="form" >
                                <div>
                                    <TextField fullWidth label="Name" onChange={handleNameChange} value={newName}/>
                                </div>

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

        <Dialog open={openZone} onClose={handleCloseZone} >
            <DialogTitle id="alert-dialog-title"> {"Create Zone"} </DialogTitle>
            <DialogContent>
                <Box sx={{ flexGrow: 1 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={10}>
                            <Box sx={{ width: '25ch' }} component="form" >
                                <div>
                                    <TextField readOnly fullWidth label="contestId"  value={selectedContestId}/>
                                </div>
                                <div>
                                    <TextField fullWidth label="Name" onChange={handleZoneNameChange} value={newZoneName}/>
                                </div>
                                </Box>

                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button variant="contained" onClick={submitFormZone}>Valider</Button>
                </DialogActions>
            </Dialog>

        <Dialog open={openBloc} onClose={handleCloseBloc} >
            <DialogTitle id="alert-dialog-title"> {"Create Bloc"} </DialogTitle>
            <DialogContent>
                <Box sx={{ flexGrow: 1 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={10}>
                            <Box sx={{ width: '25ch' }} component="form" >
                                <div>
                                    <TextField readOnly fullWidth label="contestId"  value={selectedContestId}/>
                                </div>
                                <div>
                                    <TextField readOnly fullWidth label="zoneId"  value={selectedZoneId}/>
                                </div>
                                <div>
                                    <TextField fullWidth label="Name" onChange={handleBlocNameChange} value={newBlocName}/>
                                </div>
                                <div>
                                    <TextField fullWidth label="Difficulty" onChange={handleBlocDifficultyChange} value={newBlocDifficulty}/>
                                </div>
                                </Box>

                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button variant="contained" onClick={submitFormBloc}>Valider</Button>
                </DialogActions>
            </Dialog>



            <Grid container spacing={2}>
                <Grid item xs={2}>
                    Contest
                    <IconButton size="large" onClick={handleNewUser} > <AddIcon /> </IconButton>
                </Grid>
            </Grid>

            <Grid container spacing={2}>
                <Grid item xs={5}>
            <Grid container spacing={2}>
                <Grid item xs={8}>
                    <Grid container spacing={2}>
                    <Grid item xs={8}>
                        <TableContainer sx={{}} component={Paper}>
                            <Table sx={{}} aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>ID</TableCell>
                                        <TableCell>Name</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {rows.map((row) => (
                                        <TableRow
                                        selected={row.id == selectedContestId}
                                        onClick={() => handleRowClick(row.id)}
                                        key={row.name}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }} >
                                        <TableCell component="th" scope="row"> {row.id} </TableCell>
                                        <TableCell component="th" scope="row"> {row.name} </TableCell>
                                    </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                    </Grid>

                </Grid>
        </Grid>

            { selectedContestId != -1 &&
                    <div>
            <Grid container spacing={2}>
                <Grid item xs={3}>
                    Zones
                    <IconButton size="large" onClick={handleNewZone} > <AddIcon /> </IconButton>
                </Grid>
            </Grid>

            <Grid container spacing={2}>
                <Grid item xs={8}>
                    <Grid container spacing={2}>
                    <Grid item xs={8}>
                        <TableContainer sx={{}} component={Paper}>
                            <Table sx={{}} aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>ID</TableCell>
                                        <TableCell>Name</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {rowsZone.map((row) => (
                                        <TableRow
                                        selected={row.id == selectedZoneId}
                                        onClick={() => handleRowZoneClick(row.id)}
                                        key={row.name}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }} >
                                        <TableCell component="th" scope="row"> {row.id} </TableCell>
                                        <TableCell component="th" scope="row"> {row.name} </TableCell>
                                    </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                    </Grid>

                </Grid>

        </Grid>
</div>

            }
</Grid>
                <Grid item xs={7}>
            { selectedZoneId != -1 &&
                    <div>
            <Grid container spacing={2}>
                <Grid item xs={3}>
                    Blocks
                    <IconButton size="large" onClick={handleNewBloc} > <AddIcon /> </IconButton>
                </Grid>
            </Grid>

            <Grid container spacing={2}>
                <Grid item xs={8}>
                    <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TableContainer sx={{}} component={Paper}>
                            <Table sx={{}} aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>ID</TableCell>
                                        <TableCell >Name</TableCell>
                                        <TableCell >Top</TableCell>
                                        <TableCell >Difficulty</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {rowsBlock.map((row) => (
                                        <TableRow
                                        key={row.name}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }} >
                                        <TableCell component="th" scope="row"> {row.id} </TableCell>
                                        <TableCell component="th" scope="row"> {row.name} </TableCell>
                                        <TableCell component="th" scope="row"> {row.top} </TableCell>
                                        <TableCell component="th" scope="row"> {row.difficulty} </TableCell>
                                    </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                    </Grid>

                </Grid>

        </Grid>
</div>

            }
        </Grid>
        </Grid>




    </div>
    )
}

export default withRouter(CreateContest);
