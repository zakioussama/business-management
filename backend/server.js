import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { testConnection } from './src/config/database.js';
import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import clientRoutes from './src/routes/clientRoutes.js';
import supplierRoutes from './src/routes/supplierRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
import productTypeRoutes from './src/routes/productTypeRoutes.js';
import inventoryAccountRoutes from './src/routes/inventoryAccountRoutes.js';
import inventoryProfileRoutes from './src/routes/inventoryProfileRoutes.js';
import salesRoutes from './src/routes/salesRoutes.js';
import salesAttributeRoutes from './src/routes/salesAttributeRoutes.js';
import ticketRoutes from './src/routes/ticketRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';
import financeRoutes from './src/routes/financeRoutes.js';
import expensesRoutes from './src/routes/expensesRoutes.js';
import performanceRoutes from './src/routes/performanceRoutes.js';
import cashboxRoutes from './src/routes/cashboxRoutes.js';
import dashboardRoutes from './src/routes/dashboardRoutes.js';
import clientPortalRoutes from './src/routes/clientPortalRoutes.js';
import reportRoutes from './src/routes/reportRoutes.js';
import automationRoutes from './src/routes/automationRoutes.js';
import officeRoutes from './src/routes/officeRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middlewares ---
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(morgan('dev')); // Log HTTP requests to the console
app.use(express.json()); // Parse incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/products', productRoutes);
app.use('/api/product-types', productTypeRoutes);
app.use('/api/inventory/accounts', inventoryAccountRoutes);
app.use('/api/inventory/profiles', inventoryProfileRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/sales-attributes', salesAttributeRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/cashbox', cashboxRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/portal', clientPortalRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/automations', automationRoutes);
app.use('/api/office', officeRoutes);

// --- Root Route ---
app.get('/', (req, res) => {
  res.json({ message: 'The Backend is running!' });
});

// --- Generic Error Handler ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});


// --- Start Server ---
const startServer = async () => {
  await testConnection(); // Ensure database connection is successful
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

startServer();