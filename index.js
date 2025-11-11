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

const uri = "mongodb+srv://assignmentDB:tqo11tGSPltR0fRg@cluster0.maurhd8.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
});

async function run() {
    try {
        await client.connect();
        console.log("✅ MongoDB connected successfully");

        const db = client.db("issues-DB");
        const issuesCollection = db.collection("issues");
        const contributionsCollection = db.collection("contributions");

        // community impact
app.get("/api/stats", async (req, res) => {
  try {
    const allIssues = await issuesCollection.find().toArray();
    const usersCollection = db.collection("users");

    // users count
    const totalUsers = await usersCollection.estimatedDocumentCount();

    // issues count
    const issuesResolved = allIssues.filter(issue => issue.status === "resolved").length;
    const issuesPending = allIssues.filter(issue => issue.status !== "resolved").length;

    // response
    res.send({
      totalUsers,
      issuesResolved,
      issuesPending
    });
  } catch (err) {
    console.error("❌ Error fetching community stats:", err);
    res.status(500).send({ message: "Failed to fetch community stats" });
  }
});


        // Issues
        app.get("/api/issues", async (req, res) => {
            const result = await issuesCollection.find().toArray();
            res.send(result);
        });

        app.get("/api/issues/:id", async (req, res) => {
            const id = req.params.id;
            const result = await issuesCollection.findOne({ _id: new ObjectId(id) });
            res.send(result);
        });

        app.post("/api/issues", async (req, res) => {
            const issue = req.body;
            issue.date = new Date();
            issue.status = "ongoing";
            const result = await issuesCollection.insertOne(issue);
            res.send(result);
        });

        app.put("/api/issues/:id", async (req, res) => {
            const id = req.params.id;
            const updateData = req.body;
            const result = await issuesCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updateData }
            );
            res.send(result);
        });

        app.delete("/api/issues/:id", async (req, res) => {
            const id = req.params.id;
            const result = await issuesCollection.deleteOne({ _id: new ObjectId(id) });
            res.send(result);
        });

        // Contributions 
        app.post("/api/contributions", async (req, res) => {
            const contribution = req.body;
            contribution.date = new Date();
            const result = await contributionsCollection.insertOne(contribution);
            res.send(result);
        });

        app.get("/api/contributions/:issueId", async (req, res) => {
            const issueId = req.params.issueId;
            const result = await contributionsCollection.find({ issueId }).toArray();
            res.send(result);
        });

        //  My Contributions
        app.get("/api/my-contributions/:email", async (req, res) => {
            const email = req.params.email;
            try {
                const result = await contributionsCollection.find({ email }).toArray();
                res.send(result);
            } catch (err) {
                res.status(500).send({ error: "Failed to fetch contributions" });
            }
        });

    } catch (err) {
        console.error("❌ MongoDB Error:", err);
    }
}

run().catch(console.dir);

app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
});