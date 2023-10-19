const express = require('express');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');
const cors = require('cors');

const app = express();
const port = 5173;

app.use(cors());

// Create a Sequelize instance
const sequelize = new Sequelize('node', 'root', '', {
    host: '127.0.0.1',
    port: '3306',
    dialect: 'mysql', // Use 'mysql' for MySQL
});

// Define the User model with the allowedModules field
const User = sequelize.define('User', {
    username: Sequelize.STRING,
    email: {
        type: Sequelize.STRING,
        unique: true, // Make sure emails are unique
    },
    password: Sequelize.STRING,
    allowedModules: Sequelize.JSON, // or Sequelize.JSONB
});

// Sync the model with the database (create the User table)
sequelize.sync()
    .then(() => {
        console.log('Database and table created');
    })
    .catch((err) => {
        console.error('Error creating the database and table:', err);
    });

// Middleware to parse JSON requests
app.use(bodyParser.json());

app.get("/", (req, res) => {
    return res.send("Hello");
});

// Define a POST route for creating a new user
// app.post('/api/createUser', async (req, res) => {
//     try {
//         const { username, email, password, allowedModules } = req.body;

//         // Create a new user in the database
//         const user = await User.create({ username, email, password, allowedModules });

//         // Send a success response with user details, including allowedModules
//         res.status(201).json({
//             message: 'User created successfully',
//             user,
//         });
//     } catch (error) {
//         console.error('Error creating user:', error);
//         res.status(500).json({
//             message: 'Internal server error',
//         });
//     }
// });
function getAccessibleItems(items) {
    const accessibleItems = [];

    for (const item of items) {
        // Check if the item has hasAccess: true
        if (item.hasAccess === true) {
            accessibleItems.push(item);
        }

        if (item.items && Array.isArray(item.items)) {
            // If the item has nested items, recursively call the function
            const nestedAccessibleItems = getAccessibleItems(item.items);
            accessibleItems.push(...nestedAccessibleItems);
        }
    }

    return accessibleItems;
}

app.post('/api/createUser', async (req, res) => {
    try {
        const { username, email, password, allowedModules } = req.body;

        // Retrieve accessible items from allowedModules
        const accessibleItems = getAccessibleItems(allowedModules);

        // Create a new user in the database with allowedModules
        const user = await User.create({ username, email, password, allowedModules: accessibleItems });

        // Send a success response with user details, including allowedModules
        res.status(201).json({
            message: 'User created successfully',
            user,
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({
            message: 'Internal server error',
        });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
