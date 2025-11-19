import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import cosmeticsRoutes from './routes/cosmetics';
import purchaseRoutes from './routes/purchase';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/cosmetics', cosmeticsRoutes);
app.use('/api/purchase', purchaseRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
