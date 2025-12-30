require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mojyanw.mongodb.net/?appName=Cluster0`;

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
    await client.connect();
    const productsCollection = client.db('smart-ecommerce').collection('products')
    const ordersCollection = client.db('smart-ecommerce').collection('orders');
    const usersCollection = client.db('smart-ecommerce').collection('users');

    // get all products
    app.get('/products', async (req, res) => {
      const result = await productsCollection.find().toArray();
      res.send(result);
    });

    // get products by specific id
    app.get('/products/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });

    // delete specific product
    app.delete('/products/:id', async (req, res) => {
      const query = { _id: new ObjectId(req.params.id) };
      const result = await productsCollection.deleteOne(query);
      res.send(result);
    });

    // get orders list by id
    app.get('/orders/single/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await ordersCollection.findOne(query);
      res.send(result);
    });

    // 2. POST Order: Notun order create kora (Requirement #5 & #6)
    app.post('/orders', async (req, res) => {
      const order = req.body;
      const result = await ordersCollection.insertOne(order);
      res.send(result);
    });

    // 3. GET Specific User's Orders: User Dashboard-er jonno (Requirement #9)
    app.get('/my-orders', async (req, res) => {
      const email = req.query.email;
      const query = { customerEmail: email };
      const result = await ordersCollection.find(query).toArray();
      res.send(result);
    });
    // Get All Orders (Admin er jonno)
    app.get('/all-orders', async (req, res) => {
      const result = await ordersCollection.find().toArray();
      res.send(result);
    });

   


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Smart E-Commerce Server is Running')
})

app.listen(port, () => {
  console.log(`Smart E-Commerce Server is running on port ${port}`)
})
