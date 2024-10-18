"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const config_1 = require("./config"); // Ensure this path is correct
const firestore_1 = require("firebase/firestore");
const app = (0, express_1.default)();
const PORT = 3001;
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json());
app.use(body_parser_1.default.json());
// New endpoint to get all student data from Firestore
app.get('/students', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const studentsCollection = (0, firestore_1.collection)(config_1.db, 'students');
        const snapshot = yield (0, firestore_1.getDocs)(studentsCollection);
        const studentsList = snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        res.status(200).json(studentsList);
    }
    catch (error) {
        console.error('Error fetching student data:', error);
        res.status(500).json({ message: 'Error fetching student data' });
    }
}));
// Endpoint to submit student data to Firestore
app.post('/submit', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, marks } = req.body;
        if (!name || marks === undefined) {
            return res.status(400).json({ message: "Name and marks are required." });
        }
        if (isNaN(Number(marks))) {
            return res.status(400).json({ message: "Marks must be a valid number." });
        }
        const data = {
            name: name.trim(),
            marks: Number(marks),
            timestamp: firestore_1.Timestamp.fromDate(new Date())
        };
        // Add new document to Firestore
        yield (0, firestore_1.addDoc)((0, firestore_1.collection)(config_1.db, 'students'), data);
        return res.status(200).json({
            message: 'Data stored successfully',
            data
        });
    }
    catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({
            message: 'Internal server error occurred'
        });
    }
}));
app.post('/add', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const docRef = yield (0, firestore_1.addDoc)((0, firestore_1.collection)(config_1.db, 'students'), req.body);
        res.status(200).send(`Document written with ID: ${docRef.id}`);
    }
    catch (e) {
        res.status(400).send(`Error adding document: ${e}`);
    }
}));
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
