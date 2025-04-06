const express = require('express');
const bodyParser = require('body-parser');
const database=require('./config/db')
const userRoute=require('./routes/userRoute')
const courseRoute=require('./routes/courseRoute')
const fileUpload = require('express-fileupload');
const cors=require('cors')
const path=require('path')
const app = express();

app.use(cors())
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/' 
  }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/user',userRoute)
app.use('/course',courseRoute)

app.listen(3000);
;