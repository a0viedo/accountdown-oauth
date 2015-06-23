var accountdown = require('accountdown');
var test = require('tape');
var level = require('level-test')();
var through = require('through2');
var db = level('list-' + Math.random());

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
    }
};

test('list', function (t) {
    t.plan(4);

    var users = accountdown(db, {
        login: { oauth: require('../') }
    });

    var pending = 3;
    users.create('substack', params.substack, onerror);
    users.create('trex', params.trex, onerror);
    users.create('cow', params.cow, onerror);

    function onerror (err) {
        t.ifError(err);
        if (-- pending === 0) list();
    }

    function list () {
        var rows = [];
        users.list().pipe(through.obj(write, end));

        function write (row, enc, next) {
            rows.push(row);
            next();
        }
        function end () {
            t.deepEqual(rows.sort(cmp), [
                { key: 'substack', value: { bio: 'beep boop' } },
                { key: 'trex', value: { bio: 'rawr' } },
                { key: 'cow', value: { bio: 'moo' } }
            ].sort(cmp));
        }
    }

    function cmp (a, b) { return a.key < b.key ? -1 : 1 }
});