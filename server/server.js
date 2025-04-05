const express = require('express');
const bodyParser = require('body-parser');
const database=require('./config/db')
const userRoute=require('./routes/userRoute')
const courseRoute=require('./routes/courseRoute')
const fileUpload = require('express-fileupload');
const cors=require('cors')
const path=require('path')
const app = express();

const _dirname=path.resolve()

app.use(cors())
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/' 
  }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/user',userRoute)
app.use('/course',courseRoute)

app.use(express.static(path.join(_dirname,"/client/dist")))
app.get('*',(req,res)=>{
  res.sendFile(path.resolve(_dirname,'client','dist','index.html'))
})

app.listen(3000);
;