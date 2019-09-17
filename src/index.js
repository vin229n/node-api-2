require('./db/mongoose')

const express = require('express')
const cors = require('cors')
const geocode = require('./utils/geocode')
const forecast = require('./utils/forcast')
const userRouter = require('./routers/user')
const auth = require('./middleware/auth')


const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.urlencoded({extended: true})); 
app.use(express.json());
app.use(userRouter)




app.get('/api/weather',auth,(req,res) => {
    if(!req.query.address) {
        return res.status(500).send({
            error: 'You must provide search address'
        })
    }

    geocode(req.query.address,(error,{latitude, longitude, location}) =>{
        if(error){
            return res.status(500).send(error)
        }
        else{
            forecast(latitude,longitude,(error,forecastdata) => {
                if(error)
                    return res.status(500).send(error)
                else{
                    return res.status(200).send({location,forecastdata})
                }
            })
        }
    })
})



app.get('*',auth,(req,res) =>{
    res.status(404).send('<h1>404 page not found')
})

app.listen(port,() => {
    console.log('Server is up on port '+port)
})
