import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cookieParser from 'cookie-parser';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import connectDB from './config/db.js';
const port = process.env.PORT || 5000;

import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import brandRoutes from './routes/brandRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';
import grnRoutes from './routes/grnRoutes.js';
import recipeRoutes from './routes/recipeRoutes.js';
import dailyProductRoutes from './routes/dailyProductRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import materialsRoutes from './routes/MaterialsInventoryRoutes.js';
import preMadeFoodsRoutes from './routes/preMadeFoodsRoutes.js';
import inHouseMadeFoodsRoutes from './routes/inHouseMadeFoodsRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/grn', grnRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/dailyProducts', dailyProductRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/pre-made-foods-inventory', preMadeFoodsRoutes);
app.use('/api/materials', materialsRoutes);
app.use('/api/in-house-made-foods', inHouseMadeFoodsRoutes);
app.use('/api/notifications', notificationRoutes);

if (process.env.NODE_ENV === 'production') {
  const __dirname = path.resolve();
  app.use(express.static(path.join(__dirname, '/frontend/dist')));

  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'))
  );
} else {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

//we dont access __dirname when working with ES modules, it only available for common js modules, so path.resolve is used to mimic the __driname
const __dirname = path.resolve();

//making the uploads file static so browser can access it
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//error handling
app.use(notFound);
app.use(errorHandler);

app.listen(port, () => console.log(`Server started on port ${port}`));
