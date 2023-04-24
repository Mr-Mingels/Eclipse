require('dotenv').config()
const express = require('express')
const path = require('path');
const cors = require('cors')
const bodyParser = require('body-parser')
const SpotifyWebApi = require('spotify-web-api-node')

const app = express()
app.use(cors())
app.use(bodyParser.json())
console.log('hello there')

app.post('/refresh', (req, res) => {
    const refreshToken = req.body.refreshToken
    console.log('hi')
    const spotifyApi = new SpotifyWebApi({
        redirectUri: process.env.REDIRECT_URI,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken,
    })

    spotifyApi
    .refreshAccessToken()
    .then(data => {
           res.json({
            accessToken: data.body.access_token,
            expiresIn: data.body.expires_in,
           })
        })
        .catch((err) => {
            console.log(err)
            res.sendStatus(400)
        })
})

app.post('/login', (req, res) => {
    const code = req.body.code
    console.log('Received code:', code)
    console.log('past')
    const spotifyApi = new SpotifyWebApi({
        redirectUri: process.env.REDIRECT_URI,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
    })

    spotifyApi
    .authorizationCodeGrant(code)
    .then(data => {
        res.json({
            accessToken: data.body.access_token,
            refreshToken: data.body.refresh_token,
            expiresIn: data.body.expires_in
        })
        console.log('in then')
    })
    .catch((err) => {
        console.log(err)
        res.sendStatus(400)
    })
})

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });

  if (process.env.NODE_ENV === "production") {
    app.use(express.static("client/build"));
  
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
    });
  }
  
  


