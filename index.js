const express = require('express')
const app = express()
const port = process.env.PORT || 5000

require('dotenv').config()
const cors = require('cors')
app.use(express.json())
app.use(cors(
  {
    origin: ["http://localhost:5174", "http://localhost:5173", "https://safwan-commrerce.netlify.app"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }

));

const { MongoClient, ServerApiVersion } = require('mongodb');
const json = require('body-parser/lib/types/json')
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@cluster0.6zehkma.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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


    const database = client.db("E-Commerce")
    const data_Product = database.collection("Product-data")

    app.post('/products', async (req, res) => {
      const cursor = data_Product.find()
      const result = await cursor.toArray()
      return res.send(result)

    })

    app.post('/product', async (req, res) => {
      const name = req.body;

      if (name?.search&&name?.search!=='undefined') {

        let query = { title: `${name?.search}` };

        const cursor = await data_Product?.findOne(query)
        if (cursor) {
          return res?.send([cursor])


        } else {
          return res?.send([])
        }

      }


      else {
        const cursor = data_Product.find().sort({ price: -1 })
        const result = await cursor.toArray()
        // return res.send(result)
      }

    })
    app.post('/dd', async (req, res) => {
      try {
          const { brand, category, price } = req.query;
          console.log(brand)
    
          // Construct the query object dynamically
          const query = {};
    
          if (brand!=='undefined') {
              query.brand = brand;
    
          }
    
          if (category!=='undefined') {
              query.category = category;
          }

         
          const items = await data_Product
              .find(query)         
              .toArray();          
    
          if (items.length === 0) {
              // res.status(404).json({ message: 'No data found' });
          } else if( category!=='undefined' || brand!=="undefined") {


              res.status(200).json(items);
          }
      } catch (error) {
          // res.status(500).json({ error: 'An error occurred' });
      }
    });

// for all data searchData

    app.post('/all', async (req, res) => {

      const data = parseInt(req.query.size)
      const price = req.query.price
      console.log(price,req.query)

      let sortOrder = {};
      if ( price!=='undefined') sortOrder.price = price === 'low' ? 1 : -1;
      const cursor = data_Product.find().sort(sortOrder)
        .skip(data * parseInt(8))
        .limit(parseInt(8))
      const result = await cursor.toArray()
      return res.send(result)

    })





  } finally {

  }
}
run().catch(console.dir);






app.get('/', (req, res) => {
  res.send('done')
})

app.listen(port)