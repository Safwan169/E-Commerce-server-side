const express = require('express')
const app = express()
const port=process.env.PORT || 5000

require('dotenv').config()
const cors =require('cors')
app.use(express.json())
app.use(cors())


const { MongoClient, ServerApiVersion } = require('mongodb');
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
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

const database=client.db("E-Commerce")
const data_Product=database.collection("Product-data")

    app.post('/product',async (req,res)=>{
        const name=req.body.name;
        const brand=req.body.brand;
        const Category =req.body.category;
        const price=req.body.price;
        console.log(name)

        if(name){

          const query = { title: `${name}` };
          
          const cursor=await data_Product.findOne(query)

          // const result= await cursor.toArray()
        return  res.send(cursor)
        }

        else if (brand|| Category||price) {

          
          const query = { 
             $or: [
            { brand: brand },
            { price: price },
            { Category : Category  }
          ] };
          
          const cursor= data_Product.find(query)
          const result= await cursor.toArray()
        return  res.send(result)
        } 
        
        else{
          const cursor=data_Product.find()
          const result= await cursor.toArray()
        return  res.send(result)
        }

    })
 




  
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);






app.get('/', (req, res) => {
    res.send('done')
  })

app.listen(port)
  
  
