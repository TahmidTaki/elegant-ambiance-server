const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

//mongo db

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.bvgttje.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const serviceCollection = client.db("elegantAmbiance").collection("services");

    const reviewCollection = client.db("elegantAmbiance").collection("reviews");

    //get all services
    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });

    //get latest 3 services for homepage
    app.get("/serviceshome", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query).sort({ _id: -1 });
      // If i order by _id i will automatically order by created date of that _id
      const services = await cursor.limit(3).toArray();
      res.send(services);
    });

    //get service details
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      res.send(service);
    });

    //add service
    app.post("/services", async (req, res) => {
      const service = req.body;
      const result = await serviceCollection.insertOne(service);
      res.send(result);
    });

    //review api
    //specific review by reviewID
    app.get("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await reviewCollection.findOne(query);
      res.send(service);
    });

    //all reviews for specific service
    app.get("/servicereviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { service: id };
      const service = reviewCollection.find(query).sort({ _id: -1 });
      /* note to myself: since MongoDB ObjectId contain a timestamp, I can sort by 'created date' if I will sort by objectId */
      const services = await service.toArray();
      res.send(services);
    });

    //all review by specific user
    app.get("/reviews", async (req, res) => {
      let query = {};
      if (req.query.email) {
        query = {
          email: req.query.email,
        };
      }
      const cursor = reviewCollection.find(query).sort({ _id: -1 });
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    //give feedback review by user
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });

    //update a review
    app.patch("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const message = req.body.message;
      const query = { _id: ObjectId(id) };
      const updatedReview = {
        $set: {
          message: message,
        },
      };
      const result = await reviewCollection.updateOne(query, updatedReview);
      res.send(result);
    });

    //delete a review
    app.delete("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      console.log("deleting: ", id);
      const query = { _id: ObjectId(id) };
      const result = await reviewCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
  }
}
run().catch((err) => console.error(err));

app.get("/", (req, res) => {
  res.send("elegant server running");
});

app.listen(port, () => {
  console.log(`server running at port ${port}`);
});
