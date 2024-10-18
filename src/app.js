"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const fs_1 = __importDefault(require("fs"));
const app = (0, express_1.default)();
const PORT = 3001;
app.use(express_1.default.json());
// Middleware to parse JSON body
app.use(body_parser_1.default.json());
// Endpoint to handle form submissions
app.post('/submit', (req, res) => {
    const { name, marks } = req.body;
    // Validate input
    if (!name || !marks) {
        return res.status(400).json({ message: "Name and marks are required." });
    }
    // Prepare the data to be stored
    const data = { name, marks };
    // Read existing data from JSON file
    const filePath = './data.json';
    let fileData = [];
    if (fs_1.default.existsSync(filePath)) {
        const fileContent = fs_1.default.readFileSync(filePath, 'utf-8');
        fileData = JSON.parse(fileContent);
    }
    // Append new data
    fileData.push(data);
    // Write updated data to JSON file
    fs_1.default.writeFileSync(filePath, JSON.stringify(fileData, null, 2));
    return res.status(200).json({ message: 'Data stored successfully', data });
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
