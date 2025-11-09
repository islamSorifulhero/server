// Community Cleanliness Portal Server
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.fc5kt4o.mongodb.net/issues-DB?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        await client.connect();
        console.log("✅ MongoDB connected successfully");

        const db = client.db("issues-DB");
        const issuesCollection = db.collection("issues");
        const contributionsCollection = db.collection("contributions");




        

    } catch (err) {
        console.error("❌ Error:", err);
    }
}
run().catch(console.dir);

// ----------------------
// Start Server
// ----------------------
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
