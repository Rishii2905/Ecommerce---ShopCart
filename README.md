# Ecommerce---Blinkit

https://swift-cart-store.preview.emergentagent.com/



https://www.rocket.new/6ac62847a4ad5c0013269b93#preview


File Structure
quickcart/
├── server/                              ← BACKEND (Node + Express)
│   ├── package.json                     CHANGED  (+ firebase-admin, − bcryptjs, − jsonwebtoken)
│   ├── .env                             CHANGED  (Atlas URI + Firebase Admin keys, no JWT_SECRET)
│   ├── server.js
│   ├── seed.js                          CHANGED  (no admin user creation)
│   ├── config/
│   │   ├── db.js                                 (connects to Atlas via MONGO_URI)
│   │   └── firebase.js                  NEW      (initialises firebase-admin)
│   ├── middleware/
│   │   └── auth.js                      CHANGED  (verifies Firebase ID tokens)
│   ├── utils/
│   │   └── pricing.js
│   ├── models/                          ← DATABASE SCHEMAS (stored in Atlas)
│   │   ├── User.js                      CHANGED  (+ firebaseUid, − password)
│   │   ├── Category.js
│   │   ├── Product.js
│   │   ├── Cart.js
│   │   └── Order.js
│   └── routes/                          ← API ENDPOINTS
│       ├── auth.js                      CHANGED  (just /sync and /me)
│       ├── profile.js                   CHANGED  (password route deleted)
│       ├── categories.js
│       ├── products.js                           (smart search version)
│       ├── cart.js                               (with /merge)
│       └── orders.js
│
└── client/                              ← FRONTEND (React + Vite)
    ├── package.json                     CHANGED  (+ firebase)
    ├── .env                             NEW      (VITE_FIREBASE_* keys)
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── firebase.js                  NEW      (initialises Firebase client + auth)
        ├── api.js                       CHANGED  (attaches Firebase token, maps error codes)
        ├── index.css
        ├── utils/
        │   └── pricing.js
        ├── context/
        │   ├── AuthContext.jsx          CHANGED  (Firebase login/signup/logout)
        │   └── CartContext.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   ├── ProductCard.jsx
        │   ├── ProtectedRoute.jsx
        │   ├── AuthCard.jsx                      (login/signup tabs, unchanged)
        │   ├── AuthModal.jsx
        │   └── Highlight.jsx
        └── pages/
            ├── Home.jsx
            ├── Login.jsx
            ├── Signup.jsx
            ├── Cart.jsx
            ├── Checkout.jsx
            ├── Orders.jsx
            ├── Profile.jsx              CHANGED  (reset-email button instead of change-password form)
            └── AdminInventory.jsx
