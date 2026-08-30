/*
 * Module dependencies
 */
const express = require('express')
const cors = require('cors')
const query = require('./query');
const createCar = require('./createCar')
const changeOwner = require('./changeOwner')
const bodyParser = require('body-parser')


const app = express()

app.use(cors())
app.options('*', cors()); 

app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({
  extended: true
})); 


app.get('/get-identity', function (req, res) {
    query.main( req.query )
    .then(result => {
        const parsedData = JSON.parse( result )
        let identityList

        if( req.query.id ){
            identityList = [
                {
                    Key: req.query.id,
                    Record: {
                        ...parsedData
                    }
                }
            ]
            res.send( identityList )
            return
        }

        identityList = parsedData
        res.send( identityList )
    })
    .catch(err => {
        console.error({ err })
        res.send('FAILED TO GET DATA!')
    })
})

app.post('/create', function (req, res) {
    createCar.main( req.body  )
    .then(result => {
        res.send({message: 'Identity created successfully'})
    })
    .catch(err => {
        console.error({ err })
        res.send('FAILED TO CREATE IDENTITY!')
    })
})

app.post('/update', function (req, res) {
    changeOwner.main( req.body  )
    .then(result => {
        res.send({message: 'Clearance status updated successfully'})
    })
    .catch(err => {
        console.error({ err })
        res.send('FAILED TO UPDATE CLEARANCE STATUS!')
    })
})

app.listen(3000, () => console.log('Server is running at port 3000'))
