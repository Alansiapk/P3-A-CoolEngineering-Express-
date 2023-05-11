const express = require('express')
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { checkIfAuthenticatedJWT } = require('../../middlewares')
const { User, BlacklistedToken} = require('../../models');

// const generateAccessToken = (user) => {
//     //create a new JWT, first argument is the payload, object we store
//     //in the JWT
//     return jwt.sign({
//         'username': user.get('username'),
//         'id': user.get('id'),
//         'email': user.get('email')
//     }, process.env.TOKEN_SECRET, {
//         expiresIn: "1h"
//     });
// }

//generate token function for both access token and refresh token
const generateToken = (user, secret, expiresIn) => {
    return jwt.sign({
        'username': user.username,
        'id': user.id,
        'email': user.email
    }, secret, {
        'expiresIn': expiresIn
    })
}

const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;
}

router.post('/login', async (req, res) => {
    let user = await User.where({
        'email': req.body.email
    }).fetch({
        require: false
    });

    if (user && user.get('password') == getHashedPassword(req.body.password)) {
        
        req.session.user = {
            id: user.get('id'),
            username: user.get('username'),
            email: user.get('email')
        }

        console.log('login success===============')
        console.log(req.session.user)

        let accessToken = generateToken(user.toJSON(), process.env.TOKEN_SECRET, "30m");
        let refreshToken = generateToken(user.toJSON(), process.env.REFRESH_TOKEN_SECRET, "3w");
        // let refreshToken = generateAccessToken(user.toJSON(), process.env.REFRESH_TOKEN_SECRET, '7d');
        res.send({
            accessToken, refreshToken

        })


    } else {
        res.send({
            'error': 'Wrong email or password'
        })
    }
})

router.get('/profile', checkIfAuthenticatedJWT, async (req, res) => {
    const user = req.user;
    res.send(user);
})

router.post('/refresh', async (req, res) => {
    //we assume the refresh token is to be in the body
    let refreshToken = req.body.refreshToken;
    if (!refreshToken) {
        res.sendStatus(401);
    } else {
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
            if (err) {
                return res.sendStatus(401);
            } else {

                // check if the refresh token has been black listed
                let blacklistedToken = BlacklistedToken.where({
                    'token': refreshToken
                }).fetch({
                    require: false
                })


                // if the refresh token has already been blacklisted
                if (blacklistedToken) {
                    res.status(403);
                    return res.send('The refresh token has already expired')
                }

                let accessToken = generateToken(user, process.env.TOKEN_SECRET, '15m');
                res.json({
                    accessToken
                });
            }
        })
    }
})

router.post('/logout', async (req, res) => {
    let refreshToken = req.body.refreshToken;
    if (!refreshToken) {
        res.sendStatus(401);
    } else {
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, user) => {
            if (err) {
                return res.sendStatus(401);
            }

            const blacklistedToken = new BlacklistedToken();
            blacklistedToken.set('token', refreshToken);
            // blacklistedToken.set('date_created', new Date()); // use current date
            blacklistedToken.save();
            res.json({
                'message': 'logged out'
            })
        })

    }

})


module.exports = router;
