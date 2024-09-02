# Setting Up the INS ROYAL restaurant management system 

This guide will walk you through the process of setting up the INS ROYAL restaurant management system on your local machine.

## Prerequisites

Before you begin, ensure you have Node.js installed on your system.

## Backend Configuration

1. **Environment Files**: In this `backend` folder, create a file: `.env`. Add the following contents to the file:

   ```plaintext
   MONGODB_CONNECTION_STRING=

   JWT_SECRET_KEY=
   FRONTEND_URL=
   ```

2. **MongoDB Setup**:

   - Sign up for an account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
   - Create a new cluster and follow the instructions to set up a new database.
   - Once set up, obtain your MongoDB connection string and add it to the `MONGODB_CONNECTION_STRING` variable in your `.env` files.

5. **JWT_SECRET_KEY**:

   - This just needs to be any long, random string. You can google "secret key generator".
