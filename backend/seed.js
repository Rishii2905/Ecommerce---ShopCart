require("dotenv").config();

const mongoose = require("mongoose");
const Product = require("./models/productSchema");

// Reliable placeholder image: product name on a category-colored background.
// Replace any img(...) call with a real photo URL whenever you have one.
const COLORS = {
    "Electronics": { bg: "1e293b", fg: "ffffff" },
    "Fashion": { bg: "7c3aed", fg: "ffffff" },
    "Home & Kitchen": { bg: "0f766e", fg: "ffffff" },
    "Sports & Fitness": { bg: "c2410c", fg: "ffffff" },
    "Beauty & Personal Care": { bg: "be185d", fg: "ffffff" },
};

const img = (name, category) => {
    const { bg, fg } = COLORS[category];
    const text = encodeURIComponent(name).replace(/%20/g, "+");
    return `https://placehold.co/800x800/${bg}/${fg}/png?text=${text}`;
};

// Old names from earlier seed versions that should no longer exist
const STALE_NAMES = [
    "Running Shoes",
    "Non-Stick Cookware Set",
];

const products = [
    // ---------- Original products (working images, unchanged) ----------
    {
        productName: "Wireless Noise-Cancelling Headphones",
        price: { mrp: 12999, cost: 8999, discountPercent: 31 },
        subcategory: "Headphones",
        productImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
        category: "Electronics",
        description: "Comfortable over-ear headphones with active noise cancellation and all-day battery life.",
        tagline: "Best Seller",
        quantity: 25,
    },
    {
        productName: "Everyday Smart Watch",
        price: { mrp: 8999, cost: 5999, discountPercent: 33 },
        subcategory: "Smart Watches",
        productImage: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
        category: "Electronics",
        description: "Track your daily activity, heart rate, and notifications from your wrist.",
        tagline: "New Arrival",
        quantity: 30,
    },
    {
        productName: "Compact Bluetooth Speaker",
        price: { mrp: 4999, cost: 3299, discountPercent: 34 },
        subcategory: "Speakers",
        productImage: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80",
        category: "Electronics",
        description: "A portable wireless speaker with clear sound and a durable, travel-friendly design.",
        tagline: "Top Selling",
        quantity: 18,
    },
    {
        productName: "Classic Canvas Backpack",
        price: { mrp: 3499, cost: 2299, discountPercent: 34 },
        subcategory: "Backpacks",
        productImage: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
        category: "Fashion",
        description: "A lightweight everyday backpack with a roomy main compartment and padded straps.",
        tagline: "Everyday Essential",
        quantity: 40,
    },
    {
        productName: "Insulated Stainless Steel Bottle",
        price: { mrp: 1499, cost: 999, discountPercent: 33 },
        subcategory: "Drinkware",
        productImage: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80",
        category: "Home & Kitchen",
        description: "A reusable insulated bottle designed to keep drinks at the right temperature on the go.",
        tagline: "Popular Pick",
        quantity: 50,
    },
    {
        productName: "Minimal Ceramic Table Lamp",
        price: { mrp: 4299, cost: 2999, discountPercent: 30 },
        subcategory: "Lighting",
        productImage: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
        category: "Home & Kitchen",
        description: "A warm, minimal table lamp that adds soft ambient light to bedrooms and living spaces.",
        tagline: "Limited Stock",
        quantity: 12,
    },

    // ---------- Electronics ----------
    {
        productName: "Mechanical Gaming Keyboard",
        price: { mrp: 5999, cost: 3999, discountPercent: 33 },
        subcategory: "Keyboards",
        productImage: img("Mechanical Gaming Keyboard", "Electronics"),
        category: "Electronics",
        description: "Tactile mechanical keyboard with RGB backlighting and a durable aluminium frame.",
        tagline: "Gamer's Choice",
        quantity: 22,
    },
    {
        productName: "Wireless Ergonomic Mouse",
        price: { mrp: 1999, cost: 1299, discountPercent: 35 },
        subcategory: "Mouse",
        productImage: img("Wireless Ergonomic Mouse", "Electronics"),
        category: "Electronics",
        description: "Comfortable wireless mouse with adjustable DPI and long battery life.",
        tagline: "Best Value",
        quantity: 45,
    },
    {
        productName: "20000mAh Fast Charging Power Bank",
        price: { mrp: 2499, cost: 1599, discountPercent: 36 },
        subcategory: "Power Banks",
        productImage: img("20000mAh Power Bank", "Electronics"),
        category: "Electronics",
        description: "High-capacity power bank with 22.5W fast charging and dual USB output.",
        tagline: "Travel Essential",
        quantity: 50,
    },
    {
        productName: "True Wireless Earbuds",
        price: { mrp: 3999, cost: 2499, discountPercent: 38 },
        subcategory: "Earbuds",
        productImage: img("True Wireless Earbuds", "Electronics"),
        category: "Electronics",
        description: "Compact earbuds with deep bass, touch controls and a 30-hour charging case.",
        tagline: "Hot Deal",
        quantity: 38,
    },
    {
        productName: "1TB Portable SSD",
        price: { mrp: 8999, cost: 6499, discountPercent: 28 },
        subcategory: "External Storage",
        productImage: img("1TB Portable SSD", "Electronics"),
        category: "Electronics",
        description: "Pocket-sized solid state drive with fast transfer speeds and shock resistance.",
        tagline: "Premium Pick",
        quantity: 16,
    },

    // ---------- Fashion ----------
    {
        productName: "Lightweight Running Shoes",
        price: { mrp: 4999, cost: 3499, discountPercent: 30 },
        subcategory: "Footwear",
        productImage: img("Lightweight Running Shoes", "Fashion"),
        category: "Fashion",
        description: "Breathable running shoes with a cushioned sole for daily workouts.",
        tagline: "Trending",
        quantity: 35,
    },
    {
        productName: "Cotton Crew Neck T-Shirt",
        price: { mrp: 999, cost: 599, discountPercent: 40 },
        subcategory: "T-Shirts",
        productImage: img("Cotton Crew Neck T-Shirt", "Fashion"),
        category: "Fashion",
        description: "Soft, breathable 100% cotton t-shirt with a relaxed everyday fit.",
        tagline: "Value Pick",
        quantity: 60,
    },
    {
        productName: "Classic Denim Jacket",
        price: { mrp: 3999, cost: 2799, discountPercent: 30 },
        subcategory: "Jackets",
        productImage: img("Classic Denim Jacket", "Fashion"),
        category: "Fashion",
        description: "A timeless denim jacket with a sturdy build that layers over almost anything.",
        tagline: "Style Staple",
        quantity: 20,
    },
    {
        productName: "UV-Protection Sunglasses",
        price: { mrp: 1999, cost: 1199, discountPercent: 40 },
        subcategory: "Eyewear",
        productImage: img("UV-Protection Sunglasses", "Fashion"),
        category: "Fashion",
        description: "Polarised UV400 sunglasses with a lightweight frame for all-day comfort.",
        tagline: "Summer Ready",
        quantity: 30,
    },
    {
        productName: "Genuine Leather Bifold Wallet",
        price: { mrp: 1299, cost: 799, discountPercent: 38 },
        subcategory: "Wallets",
        productImage: img("Leather Bifold Wallet", "Fashion"),
        category: "Fashion",
        description: "Slim leather wallet with multiple card slots and a coin pocket.",
        tagline: "Gift Idea",
        quantity: 42,
    },

    // ---------- Home & Kitchen ----------
    {
        productName: "5-Piece Non-Stick Cookware Set",
        price: { mrp: 3999, cost: 2499, discountPercent: 38 },
        subcategory: "Cookware",
        productImage: img("Non-Stick Cookware Set", "Home & Kitchen"),
        category: "Home & Kitchen",
        description: "Non-stick cookware set that heats evenly and cleans up easily.",
        tagline: "Kitchen Essential",
        quantity: 15,
    },
    {
        productName: "Automatic Drip Coffee Maker",
        price: { mrp: 4499, cost: 2999, discountPercent: 33 },
        subcategory: "Appliances",
        productImage: img("Drip Coffee Maker", "Home & Kitchen"),
        category: "Home & Kitchen",
        description: "Brews up to 10 cups with a programmable timer and keep-warm plate.",
        tagline: "Morning Favourite",
        quantity: 14,
    },
    {
        productName: "Cotton Double Bedsheet Set",
        price: { mrp: 1799, cost: 1099, discountPercent: 39 },
        subcategory: "Bedding",
        productImage: img("Cotton Double Bedsheet Set", "Home & Kitchen"),
        category: "Home & Kitchen",
        description: "Soft cotton double bedsheet with two pillow covers, durable and easy to wash.",
        tagline: "Cozy Home",
        quantity: 25,
    },
    {
        productName: "4L Digital Air Fryer",
        price: { mrp: 6999, cost: 4499, discountPercent: 36 },
        subcategory: "Appliances",
        productImage: img("4L Digital Air Fryer", "Home & Kitchen"),
        category: "Home & Kitchen",
        description: "Cook crispy meals with little oil using preset programs and a digital display.",
        tagline: "Healthy Cooking",
        quantity: 18,
    },

    // ---------- Sports & Fitness ----------
    {
        productName: "Anti-Slip Yoga Mat",
        price: { mrp: 1299, cost: 799, discountPercent: 38 },
        subcategory: "Yoga",
        productImage: img("Anti-Slip Yoga Mat", "Sports & Fitness"),
        category: "Sports & Fitness",
        description: "Extra-thick anti-slip yoga mat that is easy on joints and simple to carry.",
        tagline: "Stay Active",
        quantity: 40,
    },
    {
        productName: "Adjustable Dumbbell Set",
        price: { mrp: 3499, cost: 2399, discountPercent: 31 },
        subcategory: "Strength Training",
        productImage: img("Adjustable Dumbbell Set", "Sports & Fitness"),
        category: "Sports & Fitness",
        description: "Space-saving adjustable dumbbells with a secure locking mechanism.",
        tagline: "Home Gym",
        quantity: 20,
    },
    {
        productName: "Resistance Bands Set of 5",
        price: { mrp: 899, cost: 499, discountPercent: 44 },
        subcategory: "Resistance Training",
        productImage: img("Resistance Bands Set", "Sports & Fitness"),
        category: "Sports & Fitness",
        description: "Five latex bands with different resistance levels for full-body workouts.",
        tagline: "Budget Pick",
        quantity: 55,
    },

    // ---------- Beauty & Personal Care ----------
    {
        productName: "Rechargeable Beard Trimmer",
        price: { mrp: 2499, cost: 1599, discountPercent: 36 },
        subcategory: "Grooming",
        productImage: img("Rechargeable Beard Trimmer", "Beauty & Personal Care"),
        category: "Beauty & Personal Care",
        description: "Cordless trimmer with adjustable length settings and a fast-charge battery.",
        tagline: "Groomed & Ready",
        quantity: 33,
    },
    {
        productName: "Vitamin C Face Serum",
        price: { mrp: 799, cost: 499, discountPercent: 38 },
        subcategory: "Skincare",
        productImage: img("Vitamin C Face Serum", "Beauty & Personal Care"),
        category: "Beauty & Personal Care",
        description: "Brightening serum with 10% Vitamin C for a fresh and even-looking complexion.",
        tagline: "Glow Up",
        quantity: 48,
    },
    {
        productName: "Ionic Hair Dryer 2000W",
        price: { mrp: 2999, cost: 1899, discountPercent: 37 },
        subcategory: "Hair Care",
        productImage: img("Ionic Hair Dryer 2000W", "Beauty & Personal Care"),
        category: "Beauty & Personal Care",
        description: "Fast-drying ionic hair dryer with three heat settings and a cool shot button.",
        tagline: "Salon Finish",
        quantity: 27,
    },
];

async function seedDatabase() {
    if (!process.env.MONGO_URL) {
        throw new Error("MONGO_URL is not set. Add it to backend/.env before seeding.");
    }

    await mongoose.connect(process.env.MONGO_URL);

    // Remove products left over from earlier seed versions
    const removed = await Product.deleteMany({ productName: { $in: STALE_NAMES } });

    const result = await Product.bulkWrite(
        products.map((product) => ({
            updateOne: {
                filter: { productName: product.productName },
                update: { $set: product },
                upsert: true,
            },
        }))
    );

    console.log(
        `Seed complete: ${result.upsertedCount} added, ${result.modifiedCount} updated, ${removed.deletedCount} stale removed.`
    );
}

seedDatabase()
    .catch((error) => {
        console.error("Seed failed:", error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
    });