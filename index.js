const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// mongodb setup
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mojyanw.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // await client.connect();

        const db = client.db('smart-ecommerce');
        const productsCollection = db.collection('products');
        const ordersCollection = db.collection('orders');
        const usersCollection = db.collection('users');
        const reviewsCollection = db.collection('reviews');
        const wishlistCollection = db.collection('wishlist');
        const compareCollection = db.collection('compare');
        const messagesCollection = db.collection("messages");

        // get all products
        app.get('/products', async (req, res) => {
            const result = await productsCollection.find().toArray();
            res.send(result);
        });

        // get single product by id
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await productsCollection.findOne(query);
            res.send(result);
        });

        // new product add
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.send(result);
        });

        // update specific product
        app.patch('/products/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedProduct = req.body;
            const updateDoc = {
                $set: {
                    title: updatedProduct.title,
                    price: updatedProduct.price,
                    category: updatedProduct.category,
                    image: updatedProduct.image,
                    description: updatedProduct.description
                }
            };
            const result = await productsCollection.updateOne(filter, updateDoc);
            res.send(result);
        });

        // delete specific product
        app.delete('/products/:id', async (req, res) => {
            const query = { _id: new ObjectId(req.params.id) };
            const result = await productsCollection.deleteOne(query);
            res.send(result);
        });

        // orders route
        // Post a new order
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.send(result);
        });

        // get orders list by email
        app.get('/my-orders', async (req, res) => {
            const email = req.query.email;
            const query = { customerEmail: email };
            const result = await ordersCollection.find(query).toArray();
            res.send(result);
        });

        // get all orders
        app.get('/all-orders', async (req, res) => {
            const result = await ordersCollection.find().toArray();
            res.send(result);
        });

        // get single order by id
        app.get('/orders/single/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await ordersCollection.findOne(query);
            res.send(result);
        });

        // update order status
        app.patch('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: { status: req.body.status }
            };
            const result = await ordersCollection.updateOne(filter, updatedDoc);
            res.send(result);
        });

        // update specific order
        app.patch('/orders/update/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedOrder = req.body;
            const updateDoc = {
                $set: {
                    address: updatedOrder.address,
                    quantity: updatedOrder.quantity,
                    totalPrice: updatedOrder.totalPrice,
                },
            };
            const result = await ordersCollection.updateOne(filter, updateDoc);
            res.send(result);
        });

        // delete order
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.send(result);
        });

        // user route
        // get all users
        app.get('/users', async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result);
        });

        // get single user by email
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const result = await usersCollection.findOne(query);
            res.send(result);
        });

        // delete user
        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await usersCollection.deleteOne(query);
            res.send(result);
        });

        // register user
        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email };
            const existingUser = await usersCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: 'User already exists', insertedId: null });
            }
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });

        // update user role
        app.patch('/users/role/:id', async (req, res) => {
            const id = req.params.id;
            const { role } = req.body;
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: { role: role }
            };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.send(result);
        });

        // review route
        // post a review
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.send(result);
        });

        // get reviews for a specific product
        app.get('/reviews/:productId', async (req, res) => {
            const productId = req.params.productId;
            const query = { productId: productId };
            const result = await reviewsCollection.find(query).sort({ _id: -1 }).toArray();
            res.send(result);
        });

        // update a review
        app.patch('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const { newComment, newRating } = req.body;
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    comment: newComment,
                    rating: newRating,
                    date: new Date().toLocaleDateString('en-US') + " (Edited)"
                }
            };
            const result = await reviewsCollection.updateOne(filter, updateDoc);
            res.send(result);
        });

        // delete a review
        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await reviewsCollection.deleteOne(query);
            res.send(result);
        });

        // wishlist route
        // get wishlist for specific user
        app.get('/wishlist', async (req, res) => {
            const email = req.query.email;
            if (!email) return res.send([]);
            const query = { userEmail: email };
            const result = await wishlistCollection.find(query).toArray();
            res.send(result);
        });

        // add to wishlist
        app.post('/wishlist', async (req, res) => {
            const item = req.body;
            const query = { productId: item.productId, userEmail: item.userEmail };
            const existing = await wishlistCollection.findOne(query);
            if (existing) {
                return res.send({ message: "Already in your Wishlist", insertedId: null });
            }
            const result = await wishlistCollection.insertOne(item);
            res.send(result);
        });

        // delete from wishlist
        app.delete('/wishlist/:id', async (req, res) => {
            const query = { _id: new ObjectId(req.params.id) };
            const result = await wishlistCollection.deleteOne(query);
            res.send(result);
        });

        // compare route
        // get compare list for specific user
        app.get('/compare', async (req, res) => {
            const email = req.query.email;
            if (!email) return res.send([]);
            const query = { userEmail: email };
            const result = await compareCollection.find(query).toArray();
            res.send(result);
        });

        // add to compare
        app.post('/compare', async (req, res) => {
            const item = req.body;
            const query = { productId: item.productId, userEmail: item.userEmail };
            const existing = await compareCollection.findOne(query);
            if (existing) {
                return res.send({ message: "Already added", insertedId: null });
            }
            const result = await compareCollection.insertOne(item);
            res.send(result);
        });

        // delete from compare
        app.delete('/compare/:id', async (req, res) => {
            const query = { _id: new ObjectId(req.params.id) };
            const result = await compareCollection.deleteOne(query);
            res.send(result);
        });

        // for message
        // post method
        app.post('/messages', async (req, res) => {
        try {
        const message = req.body;
        const messageWithDate = {
            ...message,
            submittedAt: new Date()
        };
        const result = await messagesCollection.insertOne(messageWithDate);
        res.send(result);
        } catch (error) {
        console.error("Error saving message:", error);
        res.status(500).send({ message: "Failed to save message" });}
        });

        // get message
        app.get('/messages', async (req, res) => {
        const result = await messagesCollection.find().sort({ submittedAt: -1 }).toArray();
        res.send(result);
        });

        // delete message
        app.delete('/messages/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await messagesCollection.deleteOne(query);
        res.send(result);
        });

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

    } finally {
        // Keeps connection open
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Smart E-Commerce Server is Running');
});

app.listen(port, () => {
    console.log(`Smart E-Commerce Server is running on port ${port}`);
});