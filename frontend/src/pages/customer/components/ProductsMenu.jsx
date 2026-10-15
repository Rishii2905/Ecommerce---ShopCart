import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListSubheader from '@mui/material/ListSubheader';

import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material'
import { LightPurpleButton } from '../../../utils/buttonStyles';
import { useDispatch, useSelector } from 'react-redux';
import { getProducts, getSearchedProducts } from '../../../redux/userHandle';
import { useLocation, useNavigate } from 'react-router-dom';

const ProductsMenu = ({ dropName }) => {

    const navigate = useNavigate()

    const dispatch = useDispatch();

    const location = useLocation();

    const { productData } = useSelector(state => state.user);

    React.useEffect(() => {
        dispatch(getProducts());
    }, [dispatch])

    const [anchorEl, setAnchorEl] = React.useState(null);

    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const products = Array.isArray(productData) ? productData : [];

    // Unique categories, sorted
    const categoryNames = [...new Set(products.map((p) => p.category || "Other"))].sort();

    // category -> products sorted by name
    const productsByCategory = products.reduce((acc, p) => {
        const category = p.category || "Other";
        (acc[category] = acc[category] || []).push(p);
        return acc;
    }, {});

    Object.values(productsByCategory).forEach((list) =>
        list.sort((a, b) => String(a.productName).localeCompare(String(b.productName)))
    );

    const categoryHandler = (key) => {
        setAnchorEl(null);
        dispatch(getSearchedProducts("searchProductbyCategory", key));
        if (location.pathname !== "/ProductSearch") {
            navigate("/ProductSearch");
        }
    }

    const productHandler = (id) => {
        setAnchorEl(null);
        navigate("/product/view/" + id);
    }

    return (
        <div style={{ marginLeft: "2rem" }}>
            <LightPurpleButton
                id="demo-customized-button"
                aria-controls={open ? 'demo-customized-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                disableElevation
                onClick={handleClick}
                endIcon={open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            >
                {dropName}
            </LightPurpleButton>

            <StyledMenu
                id="demo-customized-menu"
                MenuListProps={{ 'aria-labelledby': 'demo-customized-button' }}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{ style: { maxHeight: 420 } }}
            >
                {dropName === "Categories"
                    ? categoryNames.map((name) => (
                        <MenuItem key={name} onClick={() => categoryHandler(name)}>
                            {name}
                        </MenuItem>
                    ))
                    : categoryNames.flatMap((name) => [
                        <ListSubheader key={`h-${name}`} sx={{ lineHeight: '32px', fontWeight: 700 }}>
                            {name}
                        </ListSubheader>,
                        ...productsByCategory[name].map((product) => (
                            <MenuItem key={product._id} onClick={() => productHandler(product._id)}>
                                {product.productName}
                            </MenuItem>
                        )),
                    ])}
            </StyledMenu>
        </div>
    );
}

export default ProductsMenu;

const StyledMenu = styled((props) => (
    <Menu
        elevation={0}
        anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
        }}
        transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
        }}
        {...props}
    />
))(({ theme }) => ({
    '& .MuiPaper-root': {
        borderRadius: 6,
        marginTop: theme.spacing(1),
        minWidth: 180,
        color:
            theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
        boxShadow:
            'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
        '& .MuiMenu-list': {
            padding: '4px 0',
        },
        '& .MuiMenuItem-root': {
            '& .MuiSvgIcon-root': {
                fontSize: 18,
                color: theme.palette.text.secondary,
                marginRight: theme.spacing(1.5),
            },
            '&:active': {
                backgroundColor: alpha(
                    theme.palette.primary.main,
                    theme.palette.action.selectedOpacity,
                ),
            },
        },
    },
}));