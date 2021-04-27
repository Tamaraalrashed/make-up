'use strict';

require('dotenv').config();

const express=require('express');
const pg=require('pg');
const superagent=require('superagent');
const methodOverride=require('method-override');
const cors=require('cors');


const app=express();
const PORT=process.env.PORT;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('./public'));
app.set('view engine', 'ejs');



const client = new pg.Client( { connectionString: process.env.DATABASE_URL, ssl: process.env.LOCALLY ? false : {rejectUnauthorized: false}} );

client.connect()
.then(()=>{
    app.listen(PORT,()=>{
        console.log(`listening ${PORT}`);
    })
});


app.get('/', (req,res)=>{
    res.render('homePage');
});

app.post('/getResult',resultHandler);
app.get('/allproducts',allProductsHandler);
app.get('/maybellineProduct',maybellineHandler);
app.get('/myCard',myCardHandler);
 app.get('/product/:id',detailsHandler);
 app.put('/update/:id',updateHandler);
 app.delete('/delete/:id',deleteHandler);

function resultHandler(req,res){
    // console.log(req.body);
    let brand=req.body.brand;
let greater=req.body.price_greater_than;
let lower=req.body.price_lower_than;
let URL=`http://makeup-api.herokuapp.com/api/v1/products.json?brand=${brand}&price_greater_than=${greater}&price_less_than=${lower}`;

superagent.get(URL)
.then((data)=>{
    res.render('productByPrice', {makeup:data.body})
})
}

function allProductsHandler(req,res){
    // console.log(req.query);
    let URL='http://makeup-api.herokuapp.com/api/v1/products.json?brand=maybelline';
    superagent.get(URL)
.then((data)=>{
    // console.log(data.body);
let allProducts=data.body.map((item)=>{
let newProducts =new Products(item);
return newProducts;
})
     res.render('maybellineProduct', {makeup:allProducts})
})
}

function maybellineHandler(req,res){
// console.log(req.query);
let {image, name, price, description}=req.query;
let SQL='INSERT INTO makeup (image, name, price, description) VALUES($1,$2,$3,$4) RETURNING *;';
let values=[image, name, price, description];
client.query(SQL,values)
.then(()=>{
    res.redirect('/myCard')
})
}


function myCardHandler(req,res){
    let SQL='SELECT * FROM makeup;';
    client.query(SQL)
    .then((data)=>{
        res.render('myCard', {makeup:data.rows})
    })
    }

    


function detailsHandler(req,res){
    let SQL='SELECT * FROM makeup WHERE id=$1;';
    let values=[req.params.id];
    client.query(SQL,values)
    .then((data)=>{
        res.render('productDetails', {makeup:data.rows[0]})
    })
}

function updateHandler(req,res){
    let {image, name, price, description}=req.body;
    let SQL='UPDATE makeup SET image=$1, name=$2, price=$3, description=$4 WHERE id=$5';
    let values=[image, name, price, description, req.params.id];
    client.query(SQL,values)
    .then((data)=>{
        res.redirect(`/product/${req.params.id}`)
    })
}

function deleteHandler(req,res){
    let SQL='DELETE FROM makeup WHERE id=$1';
    let values=[req.params.id];
    client.query(SQL,values)
    .then((data)=>{
        res.redirect('/myCard')
    })
}



function Products(product){
    this.name=product.name;
    this.price=product.price;
    this.image=product.image_link;
    this.description=product.description;
}
  

