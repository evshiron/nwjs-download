# nwjs-download

A command line utility for downloading nw.js.

node.js 4.1+ is required.

## Install

```
$ npm install nwjs-download -g
```

## Usage

```
# List versions.
$ nwd list

# Show latest version.
$ nwd latest

# Show stable version.
$ nwd stable

# Show caches.
$ nwd caches

# Download specified version to cache.
$ nwd download -v v0.14.4 -p darwin -a x64 -f normal
```

## License

MIT.