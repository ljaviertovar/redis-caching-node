const express = require('express')
const responseTime = require('response-time')
const redis = require('redis')
const axios = require('axios')

const runApp = async () => {

  
  const client = redis.createClient()
  client.on('error', (err) => console.log('Redis Client Error', err));
  await client.connect();
  console.log('Redis connected!')

  const app = express()
  app.use(responseTime())

  app.get('/character', async (req, res) => {

    try {

      const cacheCharacters = await client.get('characters')
      if (cacheCharacters) {
        return res.json(JSON.parse(cacheCharacters))
      }

      const response = await axios.get('https://rickandmortyapi.com/api/character')

      /* Another way to save the data is to save it with the name of the requets url, with the property
       req.originalUrl which would be the same as '/character'
       await client.set(req.originalUrl, JSON.stringify(response.data))
      */

      await client.set('characters', JSON.stringify(response.data))
      return res.status(200).json(response.data)

    } catch (err) {
      return res.status(err.response.status).json({ mmessage: err.mmessage })
    }

  })

  app.get('/characters/:id', async (req, res) => {

    try {

      const cacheCharacter = await client.get('cacheCharacter' + req.params.id)
      if (cacheCharacter) {
        return res.json(JSON.parse(cacheCharacter))
      }

      const response = await axios.get('https://rickandmortyapi.com/api/character/' + req.params.id)

      await client.set('cacheCharacter' + req.params.id, JSON.stringify(response.data))
      return res.json(response.data)

    } catch (err) {
      return res.status(err.response.status)
        .json({ mmessage: err.mmessage })
    }

  })

  app.listen(process.env.PORT || 3000, () => {
    console.log(`server on port 3000`)
  })

}

runApp()




