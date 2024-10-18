import express, { Request, Response, Application } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { db } from './config'; // Ensure this path is correct
import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';

const app: Application = express();
const PORT = 3001;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(bodyParser.json());

// New endpoint to get all student data from Firestore
app.get('/students', async (req: Request, res: Response) => {
  try {
    const studentsCollection = collection(db, 'students');
    const snapshot = await getDocs(studentsCollection);
    const studentsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(studentsList);
  } catch (error) {
    console.error('Error fetching student data:', error);
    res.status(500).json({ message: 'Error fetching student data' });
  }
});

// Endpoint to submit student data to Firestore
app.post('/submit', async (req: Request, res: Response) => {
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
      timestamp: Timestamp.fromDate(new Date())
    };

    // Add new document to Firestore
    await addDoc(collection(db, 'students'), data);

    return res.status(200).json({ 
      message: 'Data stored successfully', 
      data 
    });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      message: 'Internal server error occurred' 
    });
  }
});

app.post('/add', async (req, res) => {
    try {
      const docRef = await addDoc(collection(db, 'students'), req.body);
      res.status(200).send(`Document written with ID: ${docRef.id}`);
    } catch (e) {
      res.status(400).send(`Error adding document: ${e}`);
    }
  });

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});