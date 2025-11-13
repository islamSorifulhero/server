const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const PDFDocument = require("pdfkit");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: ["http://localhost:5173", "https://animated-cat-0a19c2.netlify.app"],
    credentials: true,
  })
);
app.use(express.json());

// ------------------ Default Route ------------------
app.get("/", (req, res) => {
  res.json({ message: "✅ Community Cleanliness Server is Running..." });
});

// ------------------ MongoDB Setup ------------------
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.maurhd8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// ------------------ Main Function ------------------
async function run() {
  try {
    console.log("✅ MongoDB connected successfully");

    const db = client.db("issues-DB");
    const issuesCollection = db.collection("issues");
    const contributionsCollection = db.collection("contributions");
    const usersCollection = db.collection("users");

    // ========== Issues Routes ==========
    app.get("/api/issues", async (req, res) => {
      try {
        const limit = parseInt(req.query.limit) || 0;
        const cursor = issuesCollection.find().sort({ date: -1 });
        const issues = limit
          ? await cursor.limit(limit).toArray()
          : await cursor.toArray();
        res.send(issues);
      } catch (err) {
        res.status(500).send({ message: "Error fetching issues" });
      }
    });

    app.get("/api/issues/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await issuesCollection.findOne({
          _id: new ObjectId(id),
        });
        if (!result)
          return res.status(404).send({ message: "Issue not found" });
        res.send(result);
      } catch {
        res.status(500).send({ message: "Error fetching issue" });
      }
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
      const result = await issuesCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    // ========== Contributions Routes ==========
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

    app.get("/api/my-contributions/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const contributions = await contributionsCollection
          .find({ email })
          .toArray();

        const result = await Promise.all(
          contributions.map(async (c) => {
            let issueTitle = "Unknown Issue";
            let category = "N/A";
            let issue = null;

            try {
              issue = await issuesCollection.findOne({
                _id: new ObjectId(c.issueId),
              });
            } catch {
              issue = await issuesCollection.findOne({ _id: c.issueId });
            }

            if (issue) {
              issueTitle = issue.title || "Unknown Issue";
              category = issue.category || "N/A";
            }

            return {
              ...c,
              issueTitle,
              category,
            };
          })
        );

        res.send(result);
      } catch (err) {
        res.status(500).send({ message: "Error fetching contributions" });
      }
    });

    // ========== PDF Download Route ==========
    app.get("/api/download-pdf/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const contributions = await contributionsCollection
          .find({ email })
          .toArray();

        const result = await Promise.all(
          contributions.map(async (c) => {
            let issueTitle = "Unknown Issue";
            let category = "N/A";
            let issue = null;

            try {
              issue = await issuesCollection.findOne({
                _id: new ObjectId(c.issueId),
              });
            } catch {
              issue = await issuesCollection.findOne({ _id: c.issueId });
            }

            if (issue) {
              issueTitle = issue.title || "Unknown Issue";
              category = issue.category || "N/A";
            }

            return {
              ...c,
              issueTitle,
              category,
            };
          })
        );

        // Generate PDF
        const doc = new PDFDocument();
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=my_contributions.pdf"
        );

        doc.pipe(res);
        doc.fontSize(20).text("My Contributions Report", { align: "center" });
        doc.moveDown();

        result.forEach((item, i) => {
          doc
            .fontSize(12)
            .text(`${i + 1}. Issue: ${item.issueTitle}`)
            .text(`   Category: ${item.category}`)
            .text(`   Amount: ৳${item.amount}`)
            .text(
              `   Date: ${new Date(item.date).toLocaleDateString("en-GB")}`
            )
            .moveDown();
        });

        doc.end();
      } catch (err) {
        console.error("PDF Error:", err);
        res.status(500).send({ message: "Error generating PDF" });
      }
    });

    // ========== Community Stats Route ==========
    app.get("/api/community-stats", async (req, res) => {
      try {
        const totalUsers = await usersCollection.estimatedDocumentCount();
        const totalIssues = await issuesCollection.estimatedDocumentCount();

        const resolvedIssues = await issuesCollection.countDocuments({
          status: "resolved",
        });
        const pendingIssues = totalIssues - resolvedIssues;

        res.send({
          totalUsers,
          totalIssues,
          resolvedIssues,
          pendingIssues,
        });
      } catch (err) {
        console.error("Stats error:", err);
        res.status(500).send({ message: "Error fetching community stats" });
      }
    });

    console.log("✅ MongoDB connection verified!");
  } catch (err) {
    console.error("❌ MongoDB Error:", err);
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
