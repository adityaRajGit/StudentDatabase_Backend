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
const config_1 = require("./config");
const firestore_1 = require("firebase/firestore");
const app = (0, express_1.default)();
const PORT = 3001;
// Middleware
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json());
app.use(body_parser_1.default.json());
// Error handler middleware
const errorHandler = (err, req, res) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: err.message
    });
};
// Validation middleware
const validateStudentData = (req, res, next) => {
    const { name, marks } = req.body;
    if (!name || marks === undefined) {
        return res.status(400).json({
            success: false,
            error: 'Validation error',
            message: 'Name and marks are required'
        });
    }
    if (typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({
            success: false,
            error: 'Validation error',
            message: 'Name must be a non-empty string'
        });
    }
    if (isNaN(Number(marks)) || Number(marks) < 0 || Number(marks) > 100) {
        return res.status(400).json({
            success: false,
            error: 'Validation error',
            message: 'Marks must be a number between 0 and 100'
        });
    }
    next();
};
// Get all students
app.get('/api/students', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const studentsCollection = (0, firestore_1.collection)(config_1.db, 'students');
        const q = (0, firestore_1.query)(studentsCollection, (0, firestore_1.orderBy)('timestamp', 'desc'));
        const snapshot = yield (0, firestore_1.getDocs)(q);
        const studentsList = snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        res.status(200).json({
            success: true,
            data: studentsList
        });
    }
    catch (error) {
        console.error('Error fetching student data:', error);
        res.status(500).json({
            success: false,
            error: 'Database error',
            message: 'Error fetching student data'
        });
    }
}));
// Get a specific student by ID
app.get('/api/students/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const docRef = (0, firestore_1.doc)(config_1.db, 'students', req.params.id);
        const docSnap = yield (0, firestore_1.getDoc)(docRef);
        if (!docSnap.exists()) {
            return res.status(404).json({
                success: false,
                error: 'Not found',
                message: 'Student not found'
            });
        }
        res.status(200).json({
            success: true,
            data: Object.assign({ id: docSnap.id }, docSnap.data())
        });
    }
    catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({
            success: false,
            error: 'Database error',
            message: 'Error fetching student'
        });
    }
}));
// Add new student
app.post('/api/students', validateStudentData, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, marks } = req.body;
        const data = {
            name: name.trim(),
            marks: Number(marks),
            timestamp: firestore_1.Timestamp.fromDate(new Date())
        };
        const docRef = yield (0, firestore_1.addDoc)((0, firestore_1.collection)(config_1.db, 'students'), data);
        res.status(201).json({
            success: true,
            data: Object.assign({ id: docRef.id }, data),
            message: 'Student added successfully'
        });
    }
    catch (error) {
        console.error('Error adding student:', error);
        res.status(500).json({
            success: false,
            error: 'Database error',
            message: 'Error adding student'
        });
    }
}));
// Update student
app.put('/api/students/:id', validateStudentData, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, marks } = req.body;
        const docRef = (0, firestore_1.doc)(config_1.db, 'students', req.params.id);
        const data = {
            name: name.trim(),
            marks: Number(marks),
            timestamp: firestore_1.Timestamp.fromDate(new Date())
        };
        yield (0, firestore_1.updateDoc)(docRef, data);
        res.status(200).json({
            success: true,
            data: Object.assign({ id: req.params.id }, data),
            message: 'Student updated successfully'
        });
    }
    catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({
            success: false,
            error: 'Database error',
            message: 'Error updating student'
        });
    }
}));
// Delete student
app.delete('/api/students/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const docRef = (0, firestore_1.doc)(config_1.db, 'students', req.params.id);
        yield (0, firestore_1.deleteDoc)(docRef);
        res.status(200).json({
            success: true,
            message: 'Student deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({
            success: false,
            error: 'Database error',
            message: 'Error deleting student'
        });
    }
}));
// Get top performers (students with highest marks)
app.get('/api/top-performers', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const limit_num = Number(req.query.limit) || 5;
        const studentsCollection = (0, firestore_1.collection)(config_1.db, 'students');
        const q = (0, firestore_1.query)(studentsCollection, (0, firestore_1.orderBy)('marks', 'desc'), (0, firestore_1.limit)(limit_num));
        const snapshot = yield (0, firestore_1.getDocs)(q);
        const topPerformers = snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        res.status(200).json({
            success: true,
            data: topPerformers
        });
    }
    catch (error) {
        console.error('Error fetching top performers:', error);
        res.status(500).json({
            success: false,
            error: 'Database error',
            message: 'Error fetching top performers'
        });
    }
}));
// Search students by name
app.get('/api/search', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchTerm = req.query.name;
        if (!searchTerm) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                message: 'Search term is required'
            });
        }
        const studentsCollection = (0, firestore_1.collection)(config_1.db, 'students');
        const q = (0, firestore_1.query)(studentsCollection, (0, firestore_1.where)('name', '>=', searchTerm), (0, firestore_1.where)('name', '<=', searchTerm + '\uf8ff'));
        const snapshot = yield (0, firestore_1.getDocs)(q);
        const results = snapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        res.status(200).json({
            success: true,
            data: results
        });
    }
    catch (error) {
        console.error('Error searching students:', error);
        res.status(500).json({
            success: false,
            error: 'Database error',
            message: 'Error searching students'
        });
    }
}));
// Error handling middleware
app.use(errorHandler);
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
exports.default = app;
