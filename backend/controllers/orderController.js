const Order = require('../models/orderSchema.js');

// Expected delivery: a random day between 3 and 7 days from now
const randomDeliveryDate = () => {
    const days = 3 + Math.floor(Math.random() * 5);
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
};

const newOrder = async (req, res) => {
    try {

        const {
            buyer,
            shippingData,
            orderedProducts,
            paymentInfo,
            paymentMethod,
            productsQuantity,
            totalPrice,
        } = req.body;

        // "Buy" on a single product sends an object, "Buy All" sends an array
        const products = Array.isArray(orderedProducts) ? orderedProducts : [orderedProducts];

        const order = await Order.create({
            buyer,
            shippingData,
            orderedProducts: products,
            paymentInfo,
            paymentMethod: paymentMethod || "Card",
            paidAt: Date.now(),
            expectedDelivery: randomDeliveryDate(),
            productsQuantity,
            totalPrice,
        });

        return res.send(order);

    } catch (err) {
        res.status(500).json(err);
    }
}

// Full orders for a customer, newest first
const getOrdersByCustomer = async (req, res) => {
    try {
        const orders = await Order.find({ buyer: req.params.id }).sort({ createdAt: -1 });
        res.send(orders);
    } catch (err) {
        res.status(500).json(err);
    }
};

const getOrderedProductsByCustomer = async (req, res) => {
    try {
        let orders = await Order.find({ buyer: req.params.id });

        if (orders.length > 0) {
            const orderedProducts = orders.reduce((accumulator, order) => {
                accumulator.push(...order.orderedProducts);
                return accumulator;
            }, []);
            res.send(orderedProducts);
        } else {
            res.send({ message: "No products found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getOrderedProductsBySeller = async (req, res) => {
    try {
        const sellerId = String(req.params.id);

        const orders = await Order.find({
            'orderedProducts.seller': req.params.id
        }).sort({ createdAt: -1 });

        const map = new Map();

        orders.forEach((order) => {
            const status = order.orderStatus || "Processing";

            order.orderedProducts.forEach((product) => {
                if (String(product.seller) !== sellerId) return;

                // Same product in the same status is merged, different statuses stay separate
                const key = `${product._id}-${status}`;

                if (map.has(key)) {
                    map.get(key).quantity += product.quantity;
                } else {
                    map.set(key, {
                        ...product.toObject(),
                        orderId: order._id,
                        orderStatus: status,
                        paymentMethod: order.paymentMethod || "Card",
                        orderedAt: order.createdAt || order.paidAt,
                        expectedDelivery: order.expectedDelivery,
                        cancelledAt: order.cancelledAt,
                        deliveredAt: order.deliveredAt,
                        shippingCity: order.shippingData && order.shippingData.city,
                    });
                }
            });
        });

        const result = Array.from(map.values());

        if (result.length > 0) {
            res.send(result);
        } else {
            res.send({ message: "No products found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.send({ message: "Order not found" });
        }

        // Customers can only cancel their own orders
        if (String(order.buyer) !== String(req.body.buyer)) {
            return res.send({ message: "You can't cancel this order" });
        }

        if (order.orderStatus === "Delivered") {
            return res.send({ message: "Delivered orders can't be cancelled" });
        }

        if (order.orderStatus === "Cancelled") {
            return res.send({ message: "This order is already cancelled" });
        }

        order.orderStatus = "Cancelled";
        order.cancelledAt = new Date();

        // Card payments are marked for refund, COD orders had nothing paid
        if (order.paymentMethod !== "Cash on Delivery") {
            order.paymentInfo.status = "Refund Initiated";
        }

        const updatedOrder = await order.save();
        res.send(updatedOrder);
    } catch (err) {
        res.status(500).json(err);
    }
};

module.exports = {
    newOrder,
    getOrdersByCustomer,
    getOrderedProductsByCustomer,
    getOrderedProductsBySeller,
    cancelOrder
};