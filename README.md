# accountdown-oauth
[accountdown](https://npmjs.org/package/accountdown) plugin to manage OAuth authentication

## Example

### Create an account
``` js
var accountdown = require('accountdown');
var level = require('level');
var db = level('/tmp/users.db');

var users = accountdown(db, {
    login: { oauth: require('accountdown-oauth') }
});

var user = process.argv[2];
var token = process.argv[3];
var tokenSecret = process.argv[4];
var bio = process.argv[5];

var opts = {
    login: { oauth: { username: user, oauth_token: token, oauth_token_secret: tokenSecret } },
    value: { bio: bio }
};
users.create(user, opts, function (err) {
    if (err) console.error(err);
});
```

### verify credentials
```
var accountdown = require('accountdown');
var level = require('level');
var db = level('/tmp/users.db');

var users = accountdown(db, {
    login: { oauth: require('accountdown-oauth') }
});

var creds = {
    username: process.argv[2],
    password: process.argv[3]
};
users.verify('oauth', creds, function (err, ok) {
    if (err) console.error(err)
    else console.log('verified:', ok)
});
```

## Methods
```js
var oauth = require('accountdown-oauth')
```

### var o = oauth(db, prefix, opts)
Return a oauth instance `o` given a database handle `db` and an array prefix `prefix`.

Optionally set an `opts.key` to use a different key as the identity than `username`.

### o.create(id, creds)

Create a new login for the account identified by `id` with `creds`, an object
with `username` and `password` properties.

Return an array of rows that can be fed into
[level-create-batch](https://npmjs.org/package/level-create-batch).

## o.verify(creds, cb)

Verify `creds`, a username with `username`, `oauth_token` and `oauth_token_secret` properties.

`cb(err, success, id)` fires with any errors or a boolean `success` and the
account identifier `id`.

## License
MIT

