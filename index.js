require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const bodyParser = require('body-parser');
// Basic Configuration
const port = process.env.PORT || 3000;
const db = process.env['MONGO_URI'];
const mongoose = require('mongoose');
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true,  useFindAndModify: false });
//mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true});
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));

const urlSchema = new mongoose.Schema({
  url: String, Short_id: Number
});
const urlModel = mongoose.model('urlModel', urlSchema);
const counterSchema = new mongoose.Schema({
  id: String,
  seq: Number
});
const counterModel = mongoose.model('counter', counterSchema);

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// // Your first API endpoint
// app.get('/api/hello', function(req, res) {
//   res.json({ greeting: 'hello API' });
// });

// app.get('/api/shorturl/:short', function(req,res){
//   const {short} = req.params;
//   console.log(Number(short));
//   //urlModel.findOne({Short_id: Number(short)}, (error, data)=>{
//     urlModel.findOne({_id: short}, (error, data)=>{
//     if (!data) {
//       res.json({ error: 'invalid url' });
//     } else {
//       console.log('found '+data.url);
//     res.redirect(data.url);
//     }
//   })
// });
app.get('/api/shorturl/:short', (req,res)=>{
  const {short} = req.params;
  console.log(Number(short));
  urlModel.findOne({Short_id: Number(short)}, (error, data)=>{
    if (!data) {
      console.log('short url not found')
      res.json({ error: 'invalid url' });
    } else {
      console.log('shor url found '+data.url);
    res.redirect(data.url);
    }
  });
});

app.post('/api/shorturl', (req,res)=>{
  // var validAddress = dns.lookup('boilerplate-project-urlshortener.prasert73.repl.co/?v=123', (error,address)=>{
  //   console.log(error);
  //   console.log(address);
  // });
  //Not able to use dns.lookup because send address with query ''/?=xxxxxxx', turn out that dns.lookup become error.
  const url = req.body.url;
  console.log(url)
  const regex =  /^(http:\/\/|https:\/\/)/;
  console.log(url.replace(regex, ""));
  if (regex.test(url)){
    counterModel.findOneAndUpdate({id: "autoincrement"}, {"$inc":{"seq": 1}}, {new: true}, (error, data)=>{
    let seqId;
    if (!data) {
        const newdata = new counterModel({id: "autoincrement", seq: 1});
        newdata.save();
        seqId=1;
        } else {
        seqId=data.seq;
        }
    var urlRecord = new urlModel({url: url, Short_id : seqId});
    urlRecord.save((error,data)=>{
      res.json({ original_url : data.url, short_url : data.Short_id})
      });
    });
  } else {
      res.json({ error: 'invalid url' });
    }
});

// app.post('/api/shorturl', function(req, res){
//   //let seqId;
//     const url = req.body.url;
//     const regex = /^(http:\/\/|https:\/\/)(\.*)/;
//     const url2 = url.replace(regex, '$2');
//     console.log(url2);
//     if (regex.test(url)){ 
//     var validAddress = dns.lookup(url2,(error,address)=>{
//     if(error) {
//       res.json({error: "invalid url"});
//     } else {
//         counterModel.findOneAndUpdate({id: "autoincrement"}, {"$inc":{"seq": 1}}, {new: true}, (error, data)=>{
//           let seqId;
//           console.log(data);
//           if (!data) {
//             const newdata = new counterModel({id: "autoincrement", seq: 1});
//             newdata.save();
//             seqId=1;
//             } else {
//                 seqId=data.seq;
//               }
//         var urlRecord = new urlModel({url: url, Short_id : seqId });
//         urlRecord.save((error,data)=>{
//             //res.json({ original_url : data.url, short_url : data.Short_id})
//               res.json({ original_url : data.url, short_url : data._id})
//             });
//           });
//         }
//     });
//     } else {
//       res.json({error: "invalid url"});
//       }  
// });
    

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
