require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 4001
const app = express()
const mongoose = require('mongoose');
var cors = require('cors')
const user_routes = require('./routes/user_routes')
const session = require('express-session')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const Appointment=require('./models/appointment')
const usershow_routes = require('./routes/usershow_routes')

const User =require('./models/user')
//models
// const Appointment=require('./models/appointment')
// const Medicine=require('./models/medicine')
// const User=require('./models/user')



//middleware
app.use(cors())
app.use(express.urlencoded({ extended: false }));
app.use(express.json())
//Body parser allows json to be passed into express
// app.use(bodyParser.urlencoded({ extended: false }));    
// app.use(bodyParser.json());
app.use(express.static('public'));
//allows json to be sent to via req express



app.use(session({
    secret: "test",
    resave: false,
    saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())





// //connect to mongoose
mongoose.connect('mongodb://localhost/home_care',
    //     { useNewUrlParser: true })
    //     .then(() => { console.log('db connected') },
    //         err => { console.log(err) })
    // //fix database index from deprecated mongoose
    // mongoose.set('useCreateIndex', true)

    //connecting to cloud database using mongoDB Atlas 
    // mongoose.connect('mongodb+srv://homecare:123456789A!@cluster0-fhzuj.mongodb.net/test?retryWrites=true',
    { useNewUrlParser: true })
    .then(() => { console.log('db connected') },
        err => { console.log(err) })
//fix database index from deprecated mongoose
mongoose.set('useCreateIndex', true)

//routes
app.use('/user/auth', require('./routes/auth.routes'))
app.use('/user/', passport.authenticate('jwt', { session: false }), require('./routes/user_routes'))




app.use('/user', user_routes)
app.use('/usershow', usershow_routes)

//cannot find route
app.get('/', (req, res) => {
    console.log("server is running")
    res.send("server is running")
})

//display all appointments belong to one patient
app.get('/appointment/patient/:id', (req, res) => {
    console.log(req.params.id)
    Appointment.find({ patient_id: req.params.id })
    .then(appointment =>{
      res.status(200).json({ appointment : appointment })
      return false
    })
    .catch(err => {
      res.json({ message: err })
      return false
    })
  })

  //create appointment
  app.post('/appointment', (req, res)=>{

    let data = {
        date : req.body.date,
        doctor_id:req.body.doctor_id,
        patient_id:req.body.patient_id,
        reservation_reason: req.body.reservation_reason,
        medicines:null,
        status:0
      }
    
      let appointment = new Appointment(data)
    
      appointment.save()
      .then(()=> {
       
       res.status(200).json({ appointment : appointment, message: "saved"})
      })
      .catch(err => {
       res.send({ message : err})
      })
    })

    //show one appointment
app.get('/appointment/:id', (req, res)=>{
  Appointment.findById(req.params.id)
  .then((appointment) =>{
      res.json({appointment})
  })
  .catch(err => { 
    res.json({message : err}) 
  })
})
    //update one appointment
    app.put('/appointment/:id', (req, res)=>{
        let update = req.body
        console.log(req.params.id)
        Appointment.findByIdAndUpdate(req.params.id, update)
        .then(() =>{
            res.json({message: "update done"});
        })
        .catch(err => {
            res.json({message: "there is a problem", err : err})
        })
      })

//display one user
app.get('/profile/:id', (req, res)=>{
  User.findById(req.params.id)
  .then((user) =>{
      res.json({user})
  })
  .catch(err => {   
  })
})

//update user
app.put('/profile/:id', (req, res)=>{
  let update = req.body

  User.findByIdAndUpdate(req.params.id, update)
  .then(() =>{
      res.json({message: "update done"});
  })
  .catch(err => {
      res.json({message: "there is a problem"})
  })
})

app.use('*', (req, res) => {
    res.status(201).json({ message: "Data not found!" })
})

app.listen(PORT, () => console.log(`connected to ${PORT}`))