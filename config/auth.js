// expose our config directly to our application using module.exports
module.exports = {

    'facebookAuth' : {
        'clientID'      : '550713458436256', // your App ID
        'clientSecret'  : '57c33d10e1695db5b39a3cf8fcb76d17', // your App Secret
        'callbackURL'   : 'http://localhost:3000/auth/facebook/callback',
    },

    'twitterAuth' : {
        'consumerKey'       : 'ay5sGUMjSuCaMjFJo8XWpRt9f',
        'consumerSecret'    : 'BWzK7lIGGHR0nDWj6njQOOjDBT3JtVG0584HdadzDusP6OQML4',
        'callbackURL'       : 'http://localhost:3000/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID'      : '1027171993032-2mj533b3f1pa7gvvd21caiicu5021ucl.apps.googleusercontent.com',
        'clientSecret'  : 'sg7tCM-FWGN1cs-NdXOumxTQ',
        'callbackURL'   : 'http://localhost:3000/auth/google/callback'
    }

};
