import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    Alert, Box, Button, Chip, Container, Dialog, DialogActions, DialogContent,
    DialogContentText, DialogTitle, Divider, Grid, Menu, MenuItem, Paper, Snackbar, Typography
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { REACT_APP_BASE_URL } from '../../../redux/userHandle';

const formatDate = (value, withWeekday = false) => {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('en-IN', {
        weekday: withWeekday ? 'short' : undefined,
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

const getBill = (items = []) => {
    const quantity = items.reduce((t, p) => t + (p.quantity || 0), 0);
    const mrpTotal = items.reduce((t, p) => t + (p.quantity || 0) * ((p.price && p.price.mrp) || 0), 0);
    const costTotal = items.reduce((t, p) => t + (p.quantity || 0) * ((p.price && p.price.cost) || 0), 0);
    return { quantity, mrpTotal, costTotal, discount: mrpTotal - costTotal };
};

const statusColor = (status) => {
    if (status === "Delivered") return "success";
    if (status === "Cancelled") return "error";
    return "warning";
};

const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
];

const CustomerOrders = () => {
    const navigate = useNavigate();
    const { currentUser } = useSelector(state => state.user);

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);

    const [anchorEl, setAnchorEl] = useState(null);
    const [sortBy, setSortBy] = useState('newest');

    // Cancel flow
    const [orderToCancel, setOrderToCancel] = useState(null);
    const [cancelling, setCancelling] = useState(false);
    const [toast, setToast] = useState({ open: false, severity: 'success', text: '' });

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const result = await axios.get(`${REACT_APP_BASE_URL}/getOrdersByCustomer/${currentUser._id}`);
                setOrders(Array.isArray(result.data) ? result.data : []);
                setFailed(false);
            } catch (error) {
                setFailed(true);
            } finally {
                setLoading(false);
            }
        };
        loadOrders();
    }, [currentUser._id]);

    const confirmCancel = async () => {
        if (!orderToCancel) return;
        setCancelling(true);

        try {
            const result = await axios.put(
                `${REACT_APP_BASE_URL}/cancelOrder/${orderToCancel._id}`,
                { buyer: currentUser._id },
                { headers: { 'Content-Type': 'application/json' } }
            );

            if (result.data.message) {
                setToast({ open: true, severity: 'error', text: result.data.message });
            } else {
                setOrders((prev) => prev.map((o) => (o._id === result.data._id ? result.data : o)));
                setToast({ open: true, severity: 'success', text: 'Your order has been cancelled.' });
            }
        } catch (error) {
            setToast({ open: true, severity: 'error', text: 'Could not cancel the order. Please try again.' });
        } finally {
            setCancelling(false);
            setOrderToCancel(null);
        }
    };

    const sortedOrders = sortBy === 'newest' ? orders : [...orders].reverse();

    if (loading) {
        return <Typography variant="h5" sx={{ textAlign: 'center', mt: 6 }}>Loading...</Typography>;
    }

    if (failed) {
        return <Typography variant="h5" sx={{ textAlign: 'center', mt: 6 }}>Could not load your orders. Please try again.</Typography>;
    }

    if (orders.length === 0) {
        return <Typography variant="h5" sx={{ textAlign: 'center', mt: 6 }}>No Orders Till Now</Typography>;
    }

    return (
        <Container sx={{ pb: 6 }}>
            <Typography sx={{ fontSize: 40, textAlign: 'center' }}>My Orders</Typography>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button
                    disableRipple
                    color="inherit"
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    endIcon={anchorEl ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                >
                    Sort By:&nbsp;
                    <Typography component="span" variant="subtitle2" sx={{ color: 'text.secondary' }}>
                        {sortOptions.find(o => o.value === sortBy).label}
                    </Typography>
                </Button>
                <Menu
                    open={Boolean(anchorEl)}
                    anchorEl={anchorEl}
                    onClose={() => setAnchorEl(null)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                    {sortOptions.map((option) => (
                        <MenuItem
                            key={option.value}
                            selected={option.value === sortBy}
                            onClick={() => { setSortBy(option.value); setAnchorEl(null); }}
                        >
                            {option.label}
                        </MenuItem>
                    ))}
                </Menu>
            </Box>

            {sortedOrders.map((order) => {
                const items = order.orderedProducts || [];
                const bill = getBill(items);
                const shipping = order.shippingData || {};
                const orderDate = order.createdAt || order.paidAt;

                // Orders placed before this feature have no expected date: fall back to 7 days after the order
                let expected = order.expectedDelivery;
                if (!expected && orderDate) {
                    const d = new Date(orderDate);
                    d.setDate(d.getDate() + 7);
                    expected = d;
                }

                const isCOD = order.paymentMethod === "Cash on Delivery";
                const delivered = order.orderStatus === "Delivered";
                const cancelled = order.orderStatus === "Cancelled";
                const canCancel = !delivered && !cancelled;

                return (
                    <Paper key={order._id} variant="outlined" sx={{ mb: 4, overflow: 'hidden', opacity: cancelled ? 0.85 : 1 }}>

                        {/* Header */}
                        <Box sx={{ p: 2, backgroundColor: cancelled ? '#fdf0f0' : '#f5f0ff' }}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={6} md={3}>
                                    <Typography variant="caption" color="text.secondary">ORDER ID</Typography>
                                    <Typography variant="subtitle2" title={order._id}>
                                        #{String(order._id).slice(-8).toUpperCase()}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6} md={3}>
                                    <Typography variant="caption" color="text.secondary">ORDER PLACED</Typography>
                                    <Typography variant="subtitle2">{formatDate(orderDate)}</Typography>
                                </Grid>
                                <Grid item xs={6} md={3}>
                                    <Typography variant="caption" color="text.secondary">
                                        {cancelled ? 'CANCELLED ON' : delivered ? 'DELIVERED ON' : 'EXPECTED DELIVERY'}
                                    </Typography>
                                    <Typography variant="subtitle2">
                                        {cancelled
                                            ? formatDate(order.cancelledAt, true)
                                            : delivered
                                                ? formatDate(order.deliveredAt, true)
                                                : formatDate(expected, true)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={6} md={3} sx={{ textAlign: { md: 'right' } }}>
                                    <Chip
                                        label={order.orderStatus || 'Processing'}
                                        color={statusColor(order.orderStatus)}
                                        size="small"
                                    />
                                </Grid>
                            </Grid>
                        </Box>

                        <Divider />

                        <Grid container spacing={3} sx={{ p: 2 }}>

                            {/* Items */}
                            <Grid item xs={12} md={7}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                                    Items ({bill.quantity})
                                </Typography>
                                {items.map((p, index) => (
                                    <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                                        <Box
                                            component="img"
                                            src={p.productImage}
                                            alt={p.productName}
                                            sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 1, backgroundColor: '#eee' }}
                                        />
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography
                                                variant="subtitle2"
                                                sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                                                onClick={() => navigate("/order/view/" + p._id)}
                                            >
                                                {p.productName}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                ₹{p.price && p.price.cost} × {p.quantity}
                                            </Typography>
                                        </Box>
                                        <Typography variant="subtitle2">
                                            ₹{(p.quantity || 0) * ((p.price && p.price.cost) || 0)}
                                        </Typography>
                                    </Box>
                                ))}
                            </Grid>

                            {/* Address, payment, bill */}
                            <Grid item xs={12} md={5}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Shipping Address</Typography>
                                <Typography variant="body2">{currentUser.name}</Typography>
                                <Typography variant="body2">{shipping.address}</Typography>
                                <Typography variant="body2">
                                    {shipping.city}, {shipping.state}, {shipping.country} - {shipping.pinCode}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 2 }}>Phone: {shipping.phoneNo}</Typography>

                                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Payment</Typography>
                                <Typography variant="body2" sx={{ mb: 2 }}>
                                    {isCOD ? 'Cash on Delivery' : 'Card'}
                                    {cancelled
                                        ? (isCOD ? ' (No payment taken)' : ` (${order.paymentInfo && order.paymentInfo.status})`)
                                        : (isCOD ? ' (Pay on delivery)' : ` (${order.paymentInfo && order.paymentInfo.status})`)}
                                </Typography>

                                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Bill Details</Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2">Price ({bill.quantity} items)</Typography>
                                    <Typography variant="body2">₹{bill.mrpTotal}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2">Discount</Typography>
                                    <Typography variant="body2" sx={{ color: 'green' }}>- ₹{bill.discount}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2">Shipping</Typography>
                                    <Typography variant="body2">Free</Typography>
                                </Box>
                                <Divider sx={{ my: 1 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                        {cancelled ? 'Order Total' : isCOD ? 'Amount to pay' : 'Total Paid'}
                                    </Typography>
                                    <Typography
                                        variant="subtitle1"
                                        sx={{ fontWeight: 700, textDecoration: cancelled ? 'line-through' : 'none' }}
                                    >
                                        ₹{bill.costTotal}
                                    </Typography>
                                </Box>

                                {canCancel &&
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        fullWidth
                                        sx={{ mt: 2 }}
                                        onClick={() => setOrderToCancel(order)}
                                    >
                                        Cancel Order
                                    </Button>
                                }
                            </Grid>
                        </Grid>
                    </Paper>
                );
            })}

            {/* Confirmation window */}
            <Dialog
                open={Boolean(orderToCancel)}
                onClose={() => !cancelling && setOrderToCancel(null)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>Cancel this order?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Order #{orderToCancel && String(orderToCancel._id).slice(-8).toUpperCase()} will be cancelled.
                        {orderToCancel && orderToCancel.paymentMethod !== "Cash on Delivery"
                            ? " Your card payment will be refunded."
                            : " You have not paid anything yet."}
                        {" "}This can't be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setOrderToCancel(null)} disabled={cancelling}>
                        Keep Order
                    </Button>
                    <Button onClick={confirmCancel} color="error" variant="contained" disabled={cancelling}>
                        {cancelling ? 'Cancelling...' : 'Yes, Cancel Order'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={toast.open}
                autoHideDuration={3500}
                onClose={() => setToast({ ...toast, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    severity={toast.severity}
                    variant="filled"
                    onClose={() => setToast({ ...toast, open: false })}
                    sx={{ width: '100%' }}
                >
                    {toast.text}
                </Alert>
            </Snackbar>
        </Container>
    );
}

export default CustomerOrders