
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("✅ Community Cleanliness Server is Running...");
});

// const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.fc5kt4o.mongodb.net/issues-DB?retryWrites=true&w=majority`;

const uri = "mongodb+srv://assignmentDB:tqo11tGSPltR0fRg@cluster0.maurhd8.mongodb.net/?appName=Cluster0";


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

        app.get("/api/issues", async (req, res) => {
            const result = await issuesCollection.find().toArray();
            res.send(result);
        });

        app.get("/api/issues/:id", async (req, res) => {
            const id = req.params.id;
            const result = await issuesCollection.findOne({ _id: new ObjectId(id) });
            res.send(result);
        });


    } catch (err) {
        console.error("❌ MongoDB Error:", err);
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
