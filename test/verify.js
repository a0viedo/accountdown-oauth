var accountdown = require('accountdown');
var test = require('tape');
var level = require('level-test')();
var db = level('verify-' + Math.random());

var params = {
    substack: {
        login: { oauth: { username: 'substack', oauth_token: 'beep boop', oauth_token_secret: 'beep boop secret' } },
        value: { bio: 'beep boop' }
    },
    trex: {
        login: { oauth: { username: 'trex', oauth_token: 'dinoking', oauth_token_secret: 'dinoking secret' } },
        value: { bio: 'rawr' }
    },
    cow: {
        login: { oauth: { username: 'cow', oauth_token: 'moo', oauth_token_secret: 'moo secret' } },
        value: { bio: 'moo' }
    },
    xyz: {
        login: { oauth: { username: 'xyz', oauth_token: 'should fail', oauth_token_secret: '... secret' } },
        value: { bio: 'what' }
    }
};

test('verify', function (t) {
    t.plan(16);

    var users = accountdown(db, {
        login: { oauth: require('../') }
    });

    var pending = 1;
    users.create('substack', params.substack, onerror);
    users.create('trex', params.trex, onerror);
    users.create('cow', params.cow, onerror);
    users.create(555, params.xyz, onerror);

    function onerror (err) {
        t.ifError(err);
        if (-- pending === 0) check();
    }

    function check () {
        users.verify(
            'oauth', { username: 'substack', oauth_token: 'beep boop', oauth_token_secret: 'beep boop secret' },
            function (err, ok, id) {
                t.ifError(err);
                t.equal(ok, true);
                t.equal(id, 'substack');
            }
        );
        users.verify(
            'oauth', { username: 'trex', oauth_token: 'dinoking', oauth_token_secret: 'dinoking secret' },
            function (err, ok, id) {
                t.ifError(err);
                t.equal(ok, true);
                t.equal(id, 'trex');
            }
        );
        users.verify(
            'oauth', { username: 'trex', oauth_token: 'moo', oauth_token_secret: 'moo secret' },
            function (err, ok, id) {
                t.ifError(err);
                t.equal(ok, false);
                t.equal(id, 'trex');
            }
        );
        users.verify(
            'oauth', { username: 'xyz', oauth_token: '...', oauth_token_secret: '... secret' },
            function (err, ok, id) {
                t.ifError(err);
                t.equal(ok, false);
                t.equal(id, 555);
            }
        );
    }
});