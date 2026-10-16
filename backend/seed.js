require("dotenv").config();

const mongoose = require("mongoose");
const Product = require("./models/productSchema");

// Real photo by keyword. "lock" keeps the same photo every time.
// To use your own image, replace the photo(...) call with any direct image URL.
// const photo = (keyword, lock) =>
//     `https://loremflickr.com/800/800/${keyword}?lock=${lock}`;
const photo = (keyword) => `/images/${keyword}.jpg`;

// Old names from earlier seed versions that should no longer exist
const STALE_NAMES = [
    "Running Shoes",
    "Non-Stick Cookware Set",
];

const products = [
    // ---------- Original products ----------
    {
        productName: "Wireless Noise-Cancelling Headphones",
        price: { mrp: 12999, cost: 8999, discountPercent: 31 },
        subcategory: "Headphones",
        productImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQN_aCrBW1D4YUdnY1QeoxRqUwmn4iKiI97dfghIdjutQ&s=10",
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
        productImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQo46DMyqwxeZ8LLKZm2Ru9F-CqNtKjtjzWGIH5IFME3g&s=10",
        category: "Electronics",
        description: "Tactile mechanical keyboard with RGB backlighting and a durable aluminium frame.",
        tagline: "Gamer's Choice",
        quantity: 22,
    },
    {
        productName: "Wireless Ergonomic Mouse",
        price: { mrp: 1999, cost: 1299, discountPercent: 35 },
        subcategory: "Mouse",
        productImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFioxG1o3tp5KAw5OGUXV0DNgLjMKUP1uugCAWMp1Hqg&s=10",
        category: "Electronics",
        description: "Comfortable wireless mouse with adjustable DPI and long battery life.",
        tagline: "Best Value",
        quantity: 45,
    },
    {
        productName: "20000mAh Fast Charging Power Bank",
        price: { mrp: 2499, cost: 1599, discountPercent: 36 },
        subcategory: "Power Banks",
        productImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHlZK_XoaWnYaDkTKbON6mEYFwOf052hKS4qptWQ4b0A&s=10",
        category: "Electronics",
        description: "High-capacity power bank with 22.5W fast charging and dual USB output.",
        tagline: "Travel Essential",
        quantity: 50,
    },
    {
        productName: "True Wireless Earbuds",
        price: { mrp: 3999, cost: 2499, discountPercent: 38 },
        subcategory: "Earbuds",
        productImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSITYxwZJQKMPYHa8_P1rwzSvwOWcABshWFFEbAKf3t0g&s=10",
        category: "Electronics",
        description: "Compact earbuds with deep bass, touch controls and a 30-hour charging case.",
        tagline: "Hot Deal",
        quantity: 38,
    },
    {
        productName: "1TB Portable SSD",
        price: { mrp: 8999, cost: 6499, discountPercent: 28 },
        subcategory: "External Storage",
        productImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSO7MTgXChwbOcZ975-Toy6qOEiIMVQP3NLDSeIB4Wlsg&s=10",
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
        productImage: "data:image/jpeg;base64,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",
        category: "Fashion",
        description: "Breathable running shoes with a cushioned sole for daily workouts.",
        tagline: "Trending",
        quantity: 35,
    },
    {
        productName: "Cotton Crew Neck T-Shirt",
        price: { mrp: 999, cost: 599, discountPercent: 40 },
        subcategory: "T-Shirts",
        productImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6Pr3ji8nR-2k4adysIXJKpv8wt_TnNJvJHd61Y1HC1Q&s=10",
        category: "Fashion",
        description: "Soft, breathable 100% cotton t-shirt with a relaxed everyday fit.",
        tagline: "Value Pick",
        quantity: 60,
    },
    {
        productName: "Classic Denim Jacket",
        price: { mrp: 3999, cost: 2799, discountPercent: 30 },
        subcategory: "Jackets",
        productImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCPnxWkwaAhzYaofISS5DnaXowPHQ2jHOLRhusfVuRmQ&s=10",
        category: "Fashion",
        description: "A timeless denim jacket with a sturdy build that layers over almost anything.",
        tagline: "Style Staple",
        quantity: 20,
    },
    {
        productName: "UV-Protection Sunglasses",
        price: { mrp: 1999, cost: 1199, discountPercent: 40 },
        subcategory: "Eyewear",
        productImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-lrZjeKlD3Yxn4WHu4ozSL-JqTDznoEe0h74I7ZCqxQ&s=10",
        category: "Fashion",
        description: "Polarised UV400 sunglasses with a lightweight frame for all-day comfort.",
        tagline: "Summer Ready",
        quantity: 30,
    },
    {
        productName: "Genuine Leather Bifold Wallet",
        price: { mrp: 1299, cost: 799, discountPercent: 38 },
        subcategory: "Wallets",
        productImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFqIYdwnu4R8sKTop-9hUzlSoo-_U8d8W7UvLumhIwgA&s=10",
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
        productImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgFYUZ71Os9Gwnb1v5plEXCaY97MduwJ3LeJ0bnD9YHg&s=10",
        category: "Home & Kitchen",
        description: "Non-stick cookware set that heats evenly and cleans up easily.",
        tagline: "Kitchen Essential",
        quantity: 15,
    },
    {
        productName: "Automatic Drip Coffee Maker",
        price: { mrp: 4499, cost: 2999, discountPercent: 33 },
        subcategory: "Appliances",
        productImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyZ8qglfwWOV7xbDFsUx91oODF1Hc1oxbC7Qf-GeacQQ&s=10",
        category: "Home & Kitchen",
        description: "Brews up to 10 cups with a programmable timer and keep-warm plate.",
        tagline: "Morning Favourite",
        quantity: 14,
    },
    {
        productName: "Cotton Double Bedsheet Set",
        price: { mrp: 1799, cost: 1099, discountPercent: 39 },
        subcategory: "Bedding",
        productImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSe8-Gfyf8-iHyRs9lXXru5nhIjh3YpKhi3eM8LqAEBtQ&s=10",
        category: "Home & Kitchen",
        description: "Soft cotton double bedsheet with two pillow covers, durable and easy to wash.",
        tagline: "Cozy Home",
        quantity: 25,
    },
    {
        productName: "4L Digital Air Fryer",
        price: { mrp: 6999, cost: 4499, discountPercent: 36 },
        subcategory: "Appliances",
        productImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIG0aflEt4TzYy2uLxls5BztvePLbOgWzPmqnuWS7aAA&s=10",
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
        productImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQylBUZQWWM0CnpmDDhY1UUUdyMxFG4bsliQtNg3lue-w&s=10",
        category: "Sports & Fitness",
        description: "Extra-thick anti-slip yoga mat that is easy on joints and simple to carry.",
        tagline: "Stay Active",
        quantity: 40,
    },
    {
        productName: "Adjustable Dumbbell Set",
        price: { mrp: 3499, cost: 2399, discountPercent: 31 },
        subcategory: "Strength Training",
        productImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzVNPYD3Ef_2exGlOBFE3eQd-5WbAqRcY28HwXv1MPLA&s=10",
        category: "Sports & Fitness",
        description: "Space-saving adjustable dumbbells with a secure locking mechanism.",
        tagline: "Home Gym",
        quantity: 20,
    },
    {
        productName: "Resistance Bands Set of 5",
        price: { mrp: 899, cost: 499, discountPercent: 44 },
        subcategory: "Resistance Training",
        productImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROuHUwNwh4UySrpENUQ2n9Aubn0HisqUCxeCIr_ABZzw&s=10",
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
        productImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTao7klu-de4QS-MIqJ3P1LNnJgUjhZ8NHlt0Hey1tCvw&s",
        category: "Beauty & Personal Care",
        description: "Cordless trimmer with adjustable length settings and a fast-charge battery.",
        tagline: "Groomed & Ready",
        quantity: 33,
    },
    {
        productName: "Vitamin C Face Serum",
        price: { mrp: 799, cost: 499, discountPercent: 38 },
        subcategory: "Skincare",
        productImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTn02L-3rNwXsUt7R0whMn7HMquod61Zr91q2VQq24PRg&s=10",
        category: "Beauty & Personal Care",
        description: "Brightening serum with 10% Vitamin C for a fresh and even-looking complexion.",
        tagline: "Glow Up",
        quantity: 48,
    },
    {
        productName: "Ionic Hair Dryer 2000W",
        price: { mrp: 2999, cost: 1899, discountPercent: 37 },
        subcategory: "Hair Care",
        productImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPADPys0aAVxZPYzUpcVim4dkn3x1zRNQNKSdP9nfj2g&s=10",
        category: "Beauty & Personal Care",
        description: "Fast-drying ionic hair dryer with three heat settings and a cool shot button.",
        tagline: "Salon Finish",
        quantity: 27,
    },


    // New Product 

        // ---------- New products ----------
    {
        productName: "Portable HD Mini Projector",
        price: { mrp: 9999, cost: 6999, discountPercent: 30 },
        subcategory: "Projectors",
        productImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRiFXpmqmhJleKpvmW66tdWaCIx_FwWifSotOgDJQxAag&s=10",
        category: "Electronics",
        description: "Compact HD projector with built-in speaker, HDMI and USB support for movies and presentations.",
        tagline: "Movie Night",
        quantity: 15,
    },
    
    {
        productName: "1.5L Stainless Steel Electric Kettle",
        price: { mrp: 1799, cost: 1099, discountPercent: 39 },
        subcategory: "Appliances",
        productImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5WLrwT7GkWZxpxfR7HHxhSkvF0CrDfkT_yw5NxEe7Fw&s=10",
        category: "Home & Kitchen",
        description: "Fast-boiling 1500W kettle with auto shut-off and a rust-free stainless steel body.",
        tagline: "Quick Boil",
        quantity: 35,
    },
    
    {
        productName: "SPF 50 Sunscreen Gel",
        price: { mrp: 699, cost: 449, discountPercent: 36 },
        subcategory: "Skincare",
        productImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfcbCG6O1yOW2T2bqn16jShxyBnbq7fIrGGE2B1HeX8g&s=10",
        category: "Beauty & Personal Care",
        description: "Lightweight, non-greasy sunscreen gel with broad-spectrum SPF 50 protection.",
        tagline: "Sun Safe",
        quantity: 52,
    },

    // More 

        // ---------- More products ----------
    {
        productName: "Smart LED Desk Lamp with Wireless Charger",
        price: { mrp: 3299, cost: 2199, discountPercent: 33 },
        subcategory: "Lighting",
        // Google search: "LED desk lamp wireless charger"
        productImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvfkh6Th0m_KzbmhV2JX73nwAOnUbigZjP3ZP67NiNxg&s=10",
        category: "Electronics",
        description: "Touch-control desk lamp with adjustable brightness, color modes and a built-in wireless charging pad.",
        tagline: "Work Smart",
        quantity: 28,
    },
    
    {
        productName: "Borosilicate Glass Food Storage Set",
        price: { mrp: 2299, cost: 1399, discountPercent: 39 },
        subcategory: "Storage",
        // Google search: "glass food storage containers set"
        productImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuNYe4on2hvV3bFCJ3LBsR39PiGPqpbTO0y7qWn00a8A&s=10",
        category: "Home & Kitchen",
        description: "Set of 5 airtight glass containers with leak-proof lids, safe for microwave and freezer.",
        tagline: "Fresh Keeper",
        quantity: 32,
    },
    {
        productName: "Pro Cricket Bat English Willow",
        price: { mrp: 5999, cost: 3999, discountPercent: 33 },
        subcategory: "Cricket",
        // Google search: "english willow cricket bat"
        productImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQlq6OI1y8Hj8Eyi3HMO1rN01SramXs7tPiB2znvFM3xA&s=10",
        category: "Sports & Fitness",
        description: "Well-balanced willow bat with a thick edge profile and comfortable grip for power hitting.",
        tagline: "Game Changer",
        quantity: 14,
    },
    {
        productName: "Hydrating Aloe Vera Face Wash",
        price: { mrp: 399, cost: 249, discountPercent: 38 },
        subcategory: "Skincare",
        // Google search: "aloe vera face wash bottle"
        productImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSeEj2kGwD65zgz6WkIQQ6NqZcZq0P8CLmDzT4bpv769A&s=10",
        category: "Beauty & Personal Care",
        description: "Gentle, soap-free face wash with aloe vera that cleans without drying out your skin.",
        tagline: "Fresh Face",
        quantity: 65,
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
