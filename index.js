'use strict';
var defined = require('defined');

module.exports = OAuth;

function OAuth (db, prefix, opts) {
    if (!(this instanceof OAuth)) return new OAuth(db, prefix, opts);
    this.db = db;
    this.prefix = prefix;
    if (!opts) opts = {};
    this._key = defined(opts.key, 'username');
}

OAuth.prototype.verify = function (creds, cb) {
    var err = this._checkCreds(creds);

    if (err) return cb && process.nextTick(function () { cb(err) });

    var key = this.prefix.concat(creds[this._key]);
    this.db.get(key, function (err, row) {
        if (err && err.type === 'NotFoundError') {
            return cb(null, false);
        }
        if (err) return cb(err);

        cb(null, creds.oauth_token === row.oauth_token &&
                 creds.oauth_token_secret === row.oauth_token_secret, row.id);
    });
};

OAuth.prototype.create = function (id, creds) {
    var err = this._checkCreds(creds);
    if (err) return err;

    return [
        {
            key: this.prefix.concat(creds[this._key]),
            value: {
                id: id,
                oauth_token: creds.oauth_token,
                oauth_token_secret: creds.oauth_token_secret
            }
        }
    ];
};

OAuth.prototype._checkCreds = function (creds) {
    if (!creds || typeof creds !== 'object') {
        return new Error('supplied credentials are not an object');
    }
    if (!creds[this._key]) {
        return new Error(this._key.concat(' required'));
    }
    var token = creds.oauth_token;
    if (typeof token === 'undefined') {
        return new Error('OAuth token is required');
    }
    if (typeof token === 'string') token = Buffer(token);
    if (!Buffer.isBuffer(token)) {
        return new Error('OAuth token must be a string or buffer');
    }

    var tokenSecret = creds.oauth_token_secret;
    if (typeof tokenSecret === 'undefined') {
        return new Error('OAuth toekn secret is required');
    }
    if (typeof tokenSecret === 'string') tokenSecret = Buffer(tokenSecret);
    if (!Buffer.isBuffer(tokenSecret)) {
        return new Error('OAuth token secret must be a string or buffer');
    }
};