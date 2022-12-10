import React,{ useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { ACCESS_TOKEN_NAME, API_BASE_URL, RESTAURANT_ID } from '../../constants/apiConstants';
import axios from 'axios';
import './ProductList.css';
import 'reactjs-popup/dist/index.css';
import CustomNoResultsOverlay from '../DataGrid/CustomNoResultsOverlay.js'

import { DataGrid } from '@mui/x-data-grid';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem/MenuItem';


import Skeleton from '@mui/material/Skeleton';

import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import { useTranslation } from 'react-i18next';
import {Context, useContextObject} from '../Context/Context';

function ProductList(props) {
    const { t, i18n } = useTranslation('List');
    const {headerTitleHook} = useContextObject();
    const [headerTitle, setHeaderTitle] = headerTitleHook;

    const [products, setProducts] = useState([]);
    const [rows, setRows] = useState([]);
    const [selected, setSelected] = useState({});
    const [images, setImages] = useState([]);
    const [kind, setKind] = useState(1);
    const [kinds, setKinds] = useState([]);
    const columns = [
        { field: 'id', headerName: t('Id'), width: 70 },
        { field: 'name', headerName: t('Name'), width: 130 },
        { field: 'description', headerName: t('Description'), width: 130 },
        { field: 'label', headerName: t('Label'), width: 130 },
        { field: 'kind', headerName: t('Kind'), width: 130 },
        { field: 'family', headerName: t('Family'), width: 130 },
        { field: 'brand', headerName: t('Brand'), width: 130 },
        { field: 'obj_class', headerName: t('Obj_class'), width: 130 },
        { field: 'calories', headerName: t('Calories'), width: 130 },
        { field: 'industrial', headerName: t('Industrial'), width: 130 },
        { field: 'is_content', headerName: t('Content'), width: 130 },
        { field: 'is_active', headerName: t('Active'), width: 130 },
    ];

    async function getProductsImages(product) {
        const response = await axios.get(API_BASE_URL+'/product_images/?product_id=' + product.id, { headers: { 'Authorization': "bearer "+localStorage.getItem(ACCESS_TOKEN_NAME) }})
        const data = response.data
        console.log("Image")
        console.log(data)
        setImages(data)
    }

    async function refreshProduct(kind) {
        const response = await axios.get(API_BASE_URL+'/products/?kind=' + kind, { headers: { 'Authorization': "bearer "+localStorage.getItem(ACCESS_TOKEN_NAME) }})
        const data = response.data

        console.log(data.products)
        if(data.products.length > 0){
            setRows(data.map(elem => {
                return {
                    id: elem.id, 
                    name: elem.name, 
                    description: elem.description,
                    label: elem.label,
                    kind: elem.kind.kind,
                    family: elem.family ? elem.family.family_name: '',
                    brand: elem.brand ? elem.brand.brand_name: '',
                    obj_class: elem.obj_class,
                    calories: elem.calories,
                    industrial: elem.industrial,
                    is_content: elem.is_content,
                    is_active: elem.is_active,
                    images: elem.images
                }
            }))
        }
    }
       
    useEffect(() => {
        setHeaderTitle("Products-List")
        async function func() {
            const r = await axios.get(API_BASE_URL+'/products_kind', { headers: { 'Authorization': "bearer "+localStorage.getItem(ACCESS_TOKEN_NAME) }})
            console.log('products_kind', r)
            setKinds(r.data)

            refreshProduct(kind)


        }
        func()
        //        const response = await axios.get(API_BASE_URL+'/products_kind/', { headers: { 'Authorization': "bearer "+localStorage.getItem(ACCESS_TOKEN_NAME) }})
        //        const data = response.data

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    function func2(event) {
        setOpen(true);
        setSelected(event.row)
        getProductsImages(event.row)
    }

    const [open, setOpen] = React.useState(false);

    const handleClose = () => {
        setOpen(false);
        setImages([])
        setSelected({})
    };
  const handleChange = (event) => {
    setKind(event.target.value);
    refreshProduct(event.target.value)
  };

    return(
        <div className="productpage">
            <div>
                <Dialog open={open} onClose={handleClose} maxWidth="lg" >
                    <DialogTitle>{t("Edit-Product")}</DialogTitle>
                    <DialogContent>
                        <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={2}>
                                <Box gridColumn="span 6">

                                    { selected && <Box
                                            gridColumn="span 6"
                                            component="form"
                                            sx={{
                                                '& .MuiTextField-root': { m: 1, width: '20ch' },
                                            }}
                                            noValidate
                                            autoComplete="off"
                                        >
                                        <TextField id="id" label="id" defaultValue={ selected.id } />
                                        <TextField id="name" label="name" defaultValue={ selected.name } />
                                        <TextField id="description" label="description" defaultValue={ selected.description } />
                                        <TextField id="label" label="label" defaultValue={ selected.label} />
                                        <TextField id="kind" label="kind" defaultValue={ selected.kind} />
                                        <TextField id="family" label="family" defaultValue={ selected.family} />
                                        <TextField id="brand" label="brand" defaultValue={ selected.brand} />
                                    </Box> }
                                <Box gridColumn="span 12">
                                {(selected && selected.images && selected.images[0]) ? <img src={selected.images[0].path} loading="lazy" style={{width: "200px"}} /> : <Skeleton variant="rectangular" width={210} height={118} /> }
                                </Box>
 
                                </Box>
                            <Box gridColumn="span 6">
                               <Box gridColumn="span 12">
                                {(images) ? <Box> 
                                    <ImageList sx={{ width: 500, height: 600 }} cols={3} rowHeight={164}  variant="" gap={8}> 
                                        {images.map((item) => ( 
                                            <ImageListItem key={item.image_media.id} >
                                                <Box style={{
                                                    //width:'100%', height:'100%', 'text-align': 'center', 'vertical-align': 'middle', 'display': 'block'
                                                }}>
                                                <img src={"https://storage.googleapis.com/trayvisor/" + item.image_media.path} 
                                                srcSet={"https://storage.googleapis.com/trayvisor/" + item.image_media.path} 
                                                width="100%"
                                                height="100%"
                                                style={{
                                                    //width: item.b_box_x_size,
                                                    //height: item.b_box_y_size,
                                                    //'object-fit': 'cover',
                                                    //'object-position': item.b_box_x_min + ' ' + item.b_box_y_min,
                                                    //margin: 'auto',
                                                    //align: 'center',
                                                    //'max-height': '100%',
                                                    //'max-width': '100%'
                                                }}
                                                alt={"https://storage.googleapis.com/trayvisor/" + item.image_media.path} loading="lazy" /> 
                                            </Box>
                                                </ImageListItem>))} 
                                                </ImageList> 
                                                </Box> 
                                        : <p>{t("None")}</p>}
                                </Box>
                            </Box>

                        </Box>
                    </DialogContent>
                            <DialogActions>
                                <Button onClick={handleClose}>{t("Cancel")}</Button>
                                <Button onClick={handleClose}>{t("Save")}</Button>
                            </DialogActions>
                        </Dialog>

                    </div>
                    <FormControl style={{width: '30%', 'padding-bottom': '10px'}}>
                        <InputLabel id="demo-simple-select-label">{t("Kind")}</InputLabel>
                        <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={kind}
                        label="Age"
                        onChange={handleChange}
                    >
            {kinds.map(elem => {return (
                    <MenuItem key={elem.id} value={elem.id}>
                        {elem.kind}
                        </MenuItem>)})}
        </Select>
      </FormControl>
            <div style={{ height: 700, width: '100%' }}>
                <DataGrid
                    rows={rows}
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

export default withRouter(ProductList);
