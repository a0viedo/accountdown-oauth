var accountdown = require('accountdown');
var test = require('tape');
var level = require('level-test')();
var db = level('exists-' + Math.random());

test('exists', function (t) {
    t.plan(5);

    var users = accountdown(db, {
        login: { oauth: require('../') }
    });
    var opts = {
        login: { oauth: { username: 'substack', oauth_token: 'token', oauth_token_secret: 'token secret' } },
        value: { bio: 'beep boop' }
    };
    users.create('substack', opts, function (err) {
        t.ifError(err);

        users.get('substack', function (err, row) {
            t.ifError(err);
            t.deepEqual(row, { bio: 'beep boop' });

            users.create('substack', opts, function (err) {
                t.equal(err.code, 'EXISTS');
            });
        });
    });

    users.create('substack', opts, function (err) {
        t.equal(err.code, 'LOCKED');
    });
});