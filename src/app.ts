import express, { Request, Response, Application } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { db } from './config';
import { 
  collection, 
  getDocs, 
  addDoc, 
  Timestamp, 
  doc, 
  updateDoc, 
  deleteDoc,
  getDoc,
  query,
  orderBy,
  limit,
  where
} from 'firebase/firestore';


interface Student {
  id?: string;
  name: string;
  marks: number;
  timestamp: Timestamp;
}

interface ApiResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}

const app: Application = express();
const PORT = 3001;


app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(bodyParser.json());


const errorHandler = (err: Error, req: Request, res: Response) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
};


const validateStudentData = (req: Request, res: Response, next: Function) => {
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


app.get('/api/students', async (req: Request, res: Response) => {
  try {
    const studentsCollection = collection(db, 'students');
    const q = query(studentsCollection, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    const studentsList = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));

    res.status(200).json({
      success: true,
      data: studentsList
    });
  } catch (error) {
    console.error('Error fetching student data:', error);
    res.status(500).json({
      success: false,
      error: 'Database error',
      message: 'Error fetching student data'
    });
  }
});

// For Getting a specific student by ID
app.get('/api/students/:id', async (req: Request, res: Response) => {
  try {
    const docRef = doc(db, 'students', req.params.id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { id: docSnap.id, ...docSnap.data() }
    });
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({
      success: false,
      error: 'Database error',
      message: 'Error fetching student'
    });
  }
});


app.post('/api/students', validateStudentData, async (req: Request, res: Response) => {
  try {
    const { name, marks } = req.body;
    
    const data: Student = {
      name: name.trim(),
      marks: Number(marks),
      timestamp: Timestamp.fromDate(new Date())
    };

    const docRef = await addDoc(collection(db, 'students'), data);

    res.status(201).json({
      success: true,
      data: { id: docRef.id, ...data },
      message: 'Student added successfully'
    });
  } catch (error) {
    console.error('Error adding student:', error);
    res.status(500).json({
      success: false,
      error: 'Database error',
      message: 'Error adding student'
    });
  }
});


app.put('/api/students/:id', validateStudentData, async (req: Request, res: Response) => {
  try {
    const { name, marks } = req.body;
    const docRef = doc(db, 'students', req.params.id);
    
    const data = {
      name: name.trim(),
      marks: Number(marks),
      timestamp: Timestamp.fromDate(new Date())
    };

    await updateDoc(docRef, data);

    res.status(200).json({
      success: true,
      data: { id: req.params.id, ...data },
      message: 'Student updated successfully'
    });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({
      success: false,
      error: 'Database error',
      message: 'Error updating student'
    });
  }
});

//for deleteing students
app.delete('/api/students/:id', async (req: Request, res: Response) => {
  try {
    const docRef = doc(db, 'students', req.params.id);
    await deleteDoc(docRef);

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({
      success: false,
      error: 'Database error',
      message: 'Error deleting student'
    });
  }
});


app.get('/api/top-performers', async (req: Request, res: Response) => {
  try {
    const limit_num = Number(req.query.limit) || 5;
    const studentsCollection = collection(db, 'students');
    const q = query(studentsCollection, orderBy('marks', 'desc'), limit(limit_num));
    const snapshot = await getDocs(q);
    
    const topPerformers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json({
      success: true,
      data: topPerformers
    });
  } catch (error) {
    console.error('Error fetching top performers:', error);
    res.status(500).json({
      success: false,
      error: 'Database error',
      message: 'Error fetching top performers'
    });
  }
});


app.get('/api/search', async (req: Request, res: Response) => {
  try {
    const searchTerm = req.query.name as string;
    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Search term is required'
      });
    }

    const studentsCollection = collection(db, 'students');
    const q = query(
      studentsCollection,
      where('name', '>=', searchTerm),
      where('name', '<=', searchTerm + '\uf8ff')
    );
    
    const snapshot = await getDocs(q);
    const results = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error searching students:', error);
    res.status(500).json({
      success: false,
      error: 'Database error',
      message: 'Error searching students'
    });
  }
});


app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;