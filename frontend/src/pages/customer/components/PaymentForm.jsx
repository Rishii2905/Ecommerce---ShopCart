import React, { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { Alert, Box, Button, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { addStuff } from '../../../redux/userHandle';
import { useNavigate, useParams } from 'react-router-dom';
import Popup from '../../../components/Popup';
import { fetchProductDetailsFromCart, removeAllFromCart, removeSpecificProduct } from '../../../redux/userSlice';

const PaymentForm = ({ handleBack }) => {

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const { status, currentUser, productDetailsCart } = useSelector(state => state.user);

    const params = useParams();
    const productID = params.id;

    const [paymentMethod, setPaymentMethod] = useState("Card");
    const isCOD = paymentMethod === "Cash on Delivery";

    const [paymentData, setPaymentData] = useState({
        cardName: '',
        cardNumber: '',
        expDate: '',
        cvv: '',
    });

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setPaymentData((prevData) => ({
            ...prevData,
            [id]: value,
        }));
    };

    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (productID) {
            dispatch(fetchProductDetailsFromCart(productID));
        }
    }, [productID, dispatch]);

    // Ignore any cart item that has no price
    const cartItems = (currentUser.cartDetails || []).filter((item) => item && item.price);

    const productsQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = cartItems.reduce((total, item) => total + (item.quantity * item.price.cost), 0);

    const singleProduct = productID && productDetailsCart && productDetailsCart.price ? productDetailsCart : null;
    const singleProductQuantity = singleProduct ? singleProduct.quantity : 0;
    const totalsingleProductPrice = singleProduct ? singleProduct.price.cost * singleProduct.quantity : 0;

    const amountToPay = productID ? totalsingleProductPrice : totalPrice;
    const nothingToOrder = productID ? !singleProduct : cartItems.length === 0;

    const handleSubmit = (e) => {
        e.preventDefault()

        if (nothingToOrder) {
            setMessage("Your cart is empty")
            setShowPopup(true)
            return
        }

        const paymentInfo = isCOD
            ? { id: `COD-${Date.now()}`, status: "Pending" }
            : {
                id: `${paymentData.cardNumber.slice(-4)}-${paymentData.expDate.slice(0, 2)}${paymentData.expDate.slice(-2)}-${Date.now()}`,
                status: "Successful"
            };

        if (productID) {
            dispatch(addStuff("newOrder", {
                buyer: currentUser._id,
                shippingData: currentUser.shippingData,
                orderedProducts: [singleProduct],
                paymentInfo,
                paymentMethod,
                productsQuantity: singleProductQuantity,
                totalPrice: totalsingleProductPrice,
            }));
            dispatch(removeSpecificProduct(productID));
        }
        else {
            dispatch(addStuff("newOrder", {
                buyer: currentUser._id,
                shippingData: currentUser.shippingData,
                orderedProducts: cartItems,
                paymentInfo,
                paymentMethod,
                productsQuantity,
                totalPrice,
            }));
            dispatch(removeAllFromCart());
        }
    };

    useEffect(() => {
        if (status === 'added') {
            navigate('/Aftermath');
        }
        else if (status === 'failed') {
            setMessage("Order Failed")
            setShowPopup(true)
        }
        else if (status === 'error') {
            setMessage("Network Error")
            setShowPopup(true)
        }
    }, [status, navigate]);

    return (
        <React.Fragment>
            <Typography variant="h6" gutterBottom>
                Payment method
            </Typography>

            <FormControl sx={{ mb: 3 }}>
                <FormLabel id="payment-method-label">Choose how you want to pay</FormLabel>
                <RadioGroup
                    row
                    aria-labelledby="payment-method-label"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                >
                    <FormControlLabel value="Card" control={<Radio />} label="Credit / Debit Card" />
                    <FormControlLabel value="Cash on Delivery" control={<Radio />} label="Cash on Delivery" />
                </RadioGroup>
            </FormControl>

            <form onSubmit={handleSubmit}>
                {isCOD ?
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Pay ₹{amountToPay} in cash when your order is delivered. No online payment needed.
                    </Alert>
                    :
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                required
                                id="cardName"
                                label="Name on card"
                                fullWidth
                                autoComplete="cc-name"
                                variant="standard"
                                value={paymentData.cardName}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                required
                                id="cardNumber"
                                label="Card number"
                                type='number'
                                fullWidth
                                autoComplete="cc-number"
                                variant="standard"
                                value={paymentData.cardNumber}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                required
                                id="expDate"
                                type='date'
                                helperText="Expiry date"
                                fullWidth
                                autoComplete="cc-exp"
                                variant="standard"
                                value={paymentData.expDate}
                                onChange={handleInputChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                required
                                id="cvv"
                                label="CVV"
                                type='number'
                                helperText="Last three digits on signature strip"
                                fullWidth
                                autoComplete="cc-csc"
                                variant="standard"
                                value={paymentData.cvv}
                                onChange={handleInputChange}
                            />
                        </Grid>
                    </Grid>
                }
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button onClick={handleBack} sx={{ mt: 3, ml: 1 }}>
                        Back
                    </Button>
                    <Button
                        variant="contained"
                        type='submit'
                        disabled={nothingToOrder}
                        sx={{ mt: 3, ml: 1 }}
                    >
                        {isCOD ? "Place order (COD)" : "Place order"}
                    </Button>
                </Box>
            </form>
            <Popup message={message} setShowPopup={setShowPopup} showPopup={showPopup} />
        </React.Fragment>
    );
}

export default PaymentForm;