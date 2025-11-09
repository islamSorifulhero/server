const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

// assignmentDB
// 6z4QMLnDLLEiBHUA

const uri = "mongodb+srv://assignmentDB:6z4QMLnDLLEiBHUA@cluster0.maurhd8.mongodb.net/?appName=Cluster0";


// ---------- MongoDB Connection ----------
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});






run().catch(console.dir);

// Start server
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
