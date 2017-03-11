var http = require('http')
var url = require('url')
var process = require('process')
var fs = require('fs')
var storage = require('node-persist')

/*
 * GET /reg/<key>
 *   200: returns value for given key. Example: { value: "http://foo.com/bar" }
 *   404: key not found
 * PUT /reg/<key> | body: <value>
 *   201: key/value pair added to map
 *   500: something went wrong
 */

var port = 6135
storage.initSync({dir: process.cwd() + '/map/'})
var writeKeys = []
try {
    var writeKeys = JSON.parse(fs.readFileSync('writekeys.json'))
    console.log(`loaded ${writeKeys.length} writekeys`)
} catch(e) {
    console.warn('!WARNING! No writekeys loaded. Everybody will be able to modify the map.')
}

http.createServer((req, res) => {
    console.log(`request: ${req.method} ${req.url}`)
    let [_, first, second] = url.parse(req.url).path.split('/')
    try {
        if(first != 'reg') {
            v = storage.getItemSync(first)
            if(v != undefined) {
                res.writeHead(302, {
                    'Content-Type': 'text/html',
                    'Location': v
                })
                res.end(`<p>302.Gently redirecting to ${v}</p>`)
            } else {
                res.writeHead(404, {'Content-Type': 'text/html'})
                res.end(`<p>404: Sorry, I don't know the requested URL :-(</p>`)
            }
        }
        let k = second
        if (req.method == 'GET') {
            v = storage.getItemSync(k)
            if (v === undefined) {
                throw({code: 404, name: 'NotFound', message: 'Key not found'})
            } else {
                res.writeHead(200, {'Content-Type': 'text/plain'})
                res.end(`${v}\n`)
            }
        } else if (req.method == 'PUT') {
            if(writeKeys.length > 0 && ! writeKeys.includes(req.headers['x-key'])) {
                throw({code: 403, name: "AuthError", message: 'No write permission.'})
            }
            let body = [];
            req.on('data', function(chunk) {
                body.push(chunk);
            }).on('end', function() {
                body = Buffer.concat(body).toString();
                storage.setItemSync(k, body)
                console.log(`key ${k} added`)
                res.writeHead(200, {'Content-Type': 'text/plain'})
                res.end(`${req.headers.host}/${k}\n`)
            });
        } else {
            throw({code: 400, name: 'ProtocolError', message: 'Unsupported HTTP Methods'})
        }
    } catch(e) {
        console.log(`Failure: ${e.message}`)
        if(!res.finished) {
            if(e['code']) {
                res.writeHead(e['code'], {'Content-Type': 'text/plain'})
            }
            res.end(`${e.message}\n`)
        }
    }
}).listen(port)

console.log('listening...')
