'use strict'
// Application Dependencies
const express = require('express');
const pg = require('pg');
const methodOverride = require('method-override');
const superagent = require('superagent');
const cors = require('cors');

// Environment variables
require('dotenv').config();

// Application Setup
const app = express();
const PORT = process.env.PORT || 3000;

// Express middleware
// Utilize ExpressJS functionality to parse the body of the request
app.use(express.urlencoded({extended:true}));

// Specify a directory for static resources
app.use(express.static('./public'));

// define our method-override reference
app.use(methodOverride('_method'));

// Set the view engine for server-side templating
app.set('view engine','ejs');

// Use app cors

app.use(cors());
// Database Setup
const client = new pg.Client(process.env.DATABASE_URL);

// app routes here
// -- WRITE YOUR ROUTES HERE --
app.get('/',showQutes);
app.get('/favorite-quotes',showFavQutes);
app.post('/save',saveFav);
app.post('/favorite-quotes/:quote_id',showDetails);
app.put('/update/:quote_id',updateQute);
app.delete('/delete/:quote_id',deleteQute);
// callback functions
// -- WRITE YOUR CALLBACK FUNCTIONS FOR THE ROUTES HERE --
function showQutes(request,response){
    const url = `https://thesimpsonsquoteapi.glitch.me/quotes?count=10`;
    superagent.get(url).set('User-Agent','1.0').then(data=>{
        const dataArr = data.body;
        response.render('home',{dataArr});
    });
}
function saveFav(request,response){
    const {name,qute,image,dirction} = request.body;
    const values = [name,qute,image,dirction];
    const sql = `INSERT INTO mytable (name,qute,img,dir) VALUES ($1, $2, $3, $4);`
    client.query(sql,values).then(data=>{
        response.redirect('/favorite-quotes')
    }) 
}
function showFavQutes(request,response){
    const sql = `SELECT * FROM mytable;`
    client.query(sql).then(data => {
        // const arr = data.rows;
        // let oddArr = [];
        // let evenArr = [];
        // arr.forEach(ele => {
        //     if(ele.dir == 'Left'){
        //         oddArr.push(ele)
        //     }else{
        //         evenArr.push(ele)
        //     }
        // })
        let dataArr = data.rows;
        response.render('favorite',{dataArr});
    })
}
function showDetails(request,response){
    const id = request.params.quote_id;
    const sql = `SELECT * FROM mytable WHERE id=$1;`
    client.query(sql,[id]).then(data => {
        const dataArr = data.rows;
        response.render('details',{dataArr});
    })
}
function updateQute(request,response){
    const id = request.params.quote_id;
    const qute = request.body.qute;
    const sql = `UPDATE mytable SET qute=$1 WHERE id = $2;`
    client.query(sql,[qute,id]).then(data => {
        const dataArr = data.rows;
        response.redirect(`/favorite-quotes/${id}`);
    });
}
function deleteQute(request,response){
    const id = request.params.quote_id;
    const sql = `DELETE FROM mytable WHERE id=$1;`
    client.query(sql,[id]).then(()=>{
        response.redirect(`/showFavQutes`);
    })
}
// helper functions
function Charachter(object){
    this.name = object.character,
    this.img = object.image,
    this.qute = object.quote,
    this.dir = object.characterDirection
};
// app start point
client.connect().then(() =>
    app.listen(PORT, () => console.log(`Listening on port: ${PORT}`))
);
