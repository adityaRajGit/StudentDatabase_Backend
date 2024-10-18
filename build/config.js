"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const app_1 = require("firebase/app");
const firestore_1 = require("firebase/firestore");
const firebaseConfig = {
    apiKey: "AIzaSyA11QGu0-q0fUkJKykLtbCLyRP3Wzqnu2E",
    authDomain: "type-player.firebaseapp.com",
    projectId: "type-player",
    storageBucket: "type-player.appspot.com",
    messagingSenderId: "1019284704362",
    appId: "1:1019284704362:web:7d73171038c5d27a5a8e13",
    measurementId: "G-6G2JH1CG8V"
};
// Initialize Firebase
const app = (0, app_1.initializeApp)(firebaseConfig);
exports.db = (0, firestore_1.getFirestore)(app);
