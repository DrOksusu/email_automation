import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import routes from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api', routes);

app.get('/', (req, res) => {
  res.json({ message: 'Email Automation API Server' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
