const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const bodyParser = require('body-parser')

require('dotenv').config()
const cors = require('cors')
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(cors(
  {
    origin: ["http://localhost:5174", "http://localhost:5173", "https://safwan-commrerce.netlify.app"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }

));

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const json = require('body-parser/lib/types/json')
const { default: axios } = require('axios')
const SSLCommerzPayment = require('sslcommerz-lts')
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
    const cart_data = database.collection("cart-data")

    app.post('/products', async (req, res) => {
      const cursor = data_Product.find()
      const result = await cursor.toArray()
      return res.send(result)

    })

    app.post('/product', async (req, res) => {
      const name = req.body;

      if (name?.search && name?.search !== 'undefined') {

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

    // for details 
    app.get('/details/:id', async (req, res) => {
      const data = req.params.id

      const query = { _id:  new ObjectId (data) };
      const cursor = await data_Product?.findOne(query)

      return res.send(cursor)


    })



    // for checkOut
    app.post('/checkout', async (req, res) => {
      const data = req.body;

    const paymentData = {
      total_amount: data?.TotalAmount, // payment amount
      currency: 'BDT', // e.g., 'BDT'
      tran_id: 'REF123', // unique transaction id
      success_url: 'http://localhost:5000/payment-success',
      fail_url: 'http://localhost:5000/payment-fail',
      cancel_url: 'http://localhost:5000/payment-cancel',
      ipn_url: 'http://localhost:5000/ipn',
      shipping_method: 'No',
      product_name: 'Test Product',
      product_category: 'Test Category',
      product_profile: 'general',
      cus_name: 'SAFWAN',
      cus_email: 'SAFWAN@example.com',
      cus_add1: 'Dhaka',
      cus_add2: 'Dhaka',
      cus_city: 'Dhaka',
      cus_state: 'Dhaka',
      cus_postcode: '1000',
      cus_country: 'Bangladesh',
      cus_phone: '123',
      cus_fax: '123',
      multi_card_name: 'mastercard',
  };

  try {
      const sslcz = new SSLCommerzPayment(`${process.env.PAYMENT_ID}`, `${process.env.PAYMENT_PASSWORD}`, false); // Use true for live, false for sandbox
      const paymentResponse = await sslcz.init(paymentData);
      if (paymentResponse.GatewayPageURL) {
          res.status(200).send({ url: paymentResponse.GatewayPageURL });
      } else {
          res.status(400).send({ error: 'Failed to initiate payment' });
      }
  } catch (error) {
      res.status(500).send({ error: error.message });
  }
     
  })



 // Success URL
app.post('/payment-success', (req, res) => {
  // Handle success response
  res.status(200).send('Payment Successful');
});

// Fail URL
app.post('/payment-fail', (req, res) => {
  // Handle failed response
  res.status(400).send('Payment Failed');
});

// Cancel URL
app.post('/payment-cancel', (req, res) => {
  // Handle cancelled response
  res.status(400).send('Payment Cancelled');
});

// IPN (Instant Payment Notification)
app.post('/ipn', (req, res) => {
  // Handle IPN from SSLCommerz
  res.status(200).send('IPN Received');
});






    // add data in cart and also increment quantity 
    app.post('/cart',async(req,res)=>{
      const data=req.body

      // console.log(data)
      const filter={
        email:data?.email,

        id:data?.id
      }
      const updateDoc={
        $inc: { quantity: 1 }
      }

      const findOneData=await cart_data.findOne({email:data?.email,id:data?.id})

      // console.log(data.email,findOneData)
  

      if (findOneData ||!findOneData==undefined) {

      

       const result= await cart_data.updateOne(filter,updateDoc)

       res.send(result)

        
      }

       else{ const result = await cart_data.insertOne(data);

       res.send(result)

       }
    





    })

  // cart quantity increment 
  app.post('/cartInc',async(req,res)=>{

    const data=req.body


    const filter={

      email:data?.email,
      id:data?.id
    }
    const updateDoc={
      $inc:{
        quantity: 1
      }
    }

      const request= await cart_data.updateOne(filter,updateDoc)

      res.send(request)


  })
  // cart quantity Decrement 
  app.post('/cartDec',async(req,res)=>{

    const data=req.body

    const filter={
      email:data?.email,
      id:data?.id
    }
    const updateDoc={
      $inc:{
        quantity: -1
      }
    }

      const request= await cart_data.updateOne(filter,updateDoc)
res.send(request)

  })


    // get cart data 
    app.get('/cart',async(req,res)=>{
      const data =req.query.email
      // console.log(data,'data')

      const cursor= cart_data?.find({email:data})
      const result=await cursor.toArray()

      // console.log(result)

      res.send(result)


    })


    app.post('/dd', async (req, res) => {
      try {
        const { brand, category, price } = req.query;
        // console.log(brand)

        // Construct the query object dynamically
        const query = {};

        if (brand !== 'undefined') {
          query.brand = brand;

        }

        if (category !== 'undefined') {
          query.category = category;
        }


        const items = await data_Product
          .find(query)
          .toArray();

        if (items.length === 0) {
          // res.status(404).json({ message: 'No data found' });
        } else if (category !== 'undefined' || brand !== "undefined") {


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
      // console.log(price, req.query)

      let sortOrder = {};
      if (price !== 'undefined') sortOrder.price = price === 'low' ? 1 : -1;
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