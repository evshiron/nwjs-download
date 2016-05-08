# nwjs-download

A command line utility for downloading nw.js.

node.js 4.x+ is required.

## Install

```shell
$ npm install evshiron/nwjs-download -g
```

## Usage

```shell
# List versions.
$ nwd list

# Show latest version.
$ nwd latest

# Show stable version.
$ nwd stable

# Download specified version to cache.
$ nwd download -v v0.14.4 -p darwin -a x64 -f normal
```

## License

MIT.