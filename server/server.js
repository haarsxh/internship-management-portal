require('dotenv').config();
const connectDB = require('./config/db');
const app = require('./app');

// Refuse to run in production with a missing/placeholder secret (anyone could forge tokens)
if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET.startsWith('change_this'))) {
  console.error('JWT_SECRET must be set to a long random value in production');
  process.exit(1);
}

const PORT = process.env.PORT || 5001;

connectDB()
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
