require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());




const uri =  `mongodb+srv://${ process.env.DB_USER}:${process.env.DB_PASS}@cluster0.z4bua.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`  ;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const taskCollection = client.db("job_task").collection("tasks");

    // **Create a Task**
    app.post("/tasks", async (req, res) => {
      try {
        const task = { ...req.body, timestamp: new Date() };
        const result = await taskCollection.insertOne(task);
    
        if (result.acknowledged) {
          res.send({ _id: result.insertedId, ...task }); // Return the new task with _id
        } else {
          res.status(500).send({ error: "Failed to add task" });
        }
      } catch (error) {
        res.status(500).send({ error: "Internal Server Error" });
      }
    });

    // **Get All Tasks**
    app.get("/tasks", async (req, res) => {
      try {
        const tasks = await taskCollection.find().toArray();
        res.send(tasks);
      } catch (error) {
        res.status(500).send({ error: "Failed to fetch tasks" });
      }
    });

    // **Update a Task**
    app.put("/tasks/:id", async (req, res) => {
      const { id } = req.params;
      const updatedTask = req.body;
      const result = await taskCollection.updateOne(
        { _id: new ObjectId(id) }, // Use ObjectId properly
        { $set: updatedTask }
      );
      res.send(result);
    });

    // **Delete a Task**
    app.delete("/tasks/:id", async (req, res) => {
      const { id } = req.params;
      const result = await taskCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('job task!')
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
} );