Vector/Web
==========

Vector is a Matrix web client built using the Matrix React SDK (https://github.com/matrix-org/matrix-react-sdk).

Getting Started
===============

Vector is a modular webapp built with modern ES6 and requires and npm build system to build.
Instructions for building are below, but building from source shouldn't be necessary
for simple deployments.

1. Download the latest version from https://vector.im/packages/
1. Untar the tarball on your web server
1. Move (or symlink) the vector-x.x.x directory to an appropriate name
1. If desired, copy `config.sample.json` to `config.json` and edit it
   as desired. See below for details.
1. Enter the URL into your browser and log into vector!

Building From Source
====================

If you do wish to build vector from source:

1. Install or update `node.js` so that your `npm` is at least at version `2.0.0`
1. Clone the repo: `git clone https://github.com/vector-im/vector-web.git`
1. Switch to the vector directory: `cd vector-web`
1. Install the prerequisites: `npm install`
1. If you are using the `develop` branch of vector, you will probably need to
   rebuild one of the dependencies, due to https://github.com/npm/npm/issues/3055:
   `(cd node_modules/matrix-react-sdk && npm install)`
1. Configure the app by copying `config.sample.json` to `config.json` and modifying
   it (see below for details)
1. `npm run package` to build a tarball to deploy. Untaring this file will give
   a version-specific directory containing all the files that need to go on your
   web server.

Note that `npm run package` is not supported on Windows, so Windows users can run `npm
run build`, which will build all the necessary files into the `vector`
directory. The version of Vector will not appear in Settings without
using the package script. You can then mount the vector directory on your
webserver to actually serve up the app, which is entirely static content.

config.json
===========

You can configure the app by copying `vector/config.sample.json` to
`vector/config.json` and customising it:

1. `default_hs_url` is the default home server url.
1. `default_is_url` is the default identity server url (this is the server used
   for verifying third party identifiers like email addresses). If this is blank,
   registering with an email address or adding an email address to your account
   will not work.

Development
===========

Before attempting to develop on Vector you **must** read the developer guide
for `matrix-react-sdk` at https://github.com/matrix-org/matrix-react-sdk, which
also defines the design, architecture and style for Vector too.

The idea of Vector is to be a relatively lightweight "skin" of customisations on
top of the underlying `matrix-react-sdk`. `matrix-react-sdk` provides both the
higher and lower level React components useful for building Matrix communication
apps using React.

After creating a new component you must run `npm run reskindex` to regenerate
the `component-index.js` for the app (used in future for skinning)

**However, as of July 2016 this layering abstraction is broken due to rapid
development on Vector forcing `matrix-react-sdk` to move fast at the expense of
maintaining a clear abstraction between the two.**  Hacking on Vector inevitably
means hacking equally on `matrix-react-sdk`, and there are bits of
`matrix-react-sdk` behaviour incorrectly residing in the `vector-web` project
(e.g. matrix-react-sdk specific CSS), and a bunch of Vector specific behaviour
in the `matrix-react-sdk` (grep for Vector).  This separation problem will be
solved asap once development on Vector (and thus matrix-react-sdk) has
stabilised.  Until then, the two projects should basically be considered as a
single unit.  In particular, `matrix-react-sdk` issues are currently filed
against `vector-web` in github.

Please note that Vector is intended to run correctly without access to the public
internet.  So please don't depend on resources (JS libs, CSS, images, fonts)
hosted by external CDNs or servers but instead please package all dependencies
into Vector itself.

Setting up a dev environment
============================

Much of the functionality in Vector is actually in the `matrix-react-sdk` and
`matrix-js-sdk` modules. It is possible to set these up in a way that makes it
easy to track the `develop` branches in git and to make local changes without
having to manually rebuild each time.

First clone and build `matrix-js-sdk`:

1. `git clone git@github.com:matrix-org/matrix-js-sdk.git`
1. `pushd matrix-js-sdk`
1. `git checkout develop`
1. `npm install`
1. `npm install source-map-loader` # because webpack is made of fail (https://github.com/webpack/webpack/issues/1472)
1. `popd`

Then similarly with `matrix-react-sdk`:

1. `git clone git@github.com:matrix-org/matrix-react-sdk.git`
1. `pushd matrix-react-sdk`
1. `git checkout develop`
1. `npm install`
1. `rm -r node_modules/matrix-js-sdk; ln -s ../../matrix-js-sdk node_modules/`
1. `popd`

Finally, build and start vector itself:

1. `git clone git@github.com:vector-im/vector-web.git`
1. `cd vector-web`
1. `git checkout develop`
1. `npm install`
1. `rm -r node_modules/matrix-js-sdk; ln -s ../../matrix-js-sdk node_modules/`
1. `rm -r node_modules/matrix-react-sdk; ln -s ../../matrix-react-sdk node_modules/`
1. `npm start`
1. Wait a few seconds for the initial build to finish; you should see something like:

    ```
    Hash: b0af76309dd56d7275c8
    Version: webpack 1.12.14
    Time: 14533ms
             Asset     Size  Chunks             Chunk Names
         bundle.js   4.2 MB       0  [emitted]  main
        bundle.css  91.5 kB       0  [emitted]  main
     bundle.js.map  5.29 MB       0  [emitted]  main
    bundle.css.map   116 kB       0  [emitted]  main
        + 1013 hidden modules
    ```
   Remember, the command will not terminate since it runs the web server
   and rebuilds source files when they change. This development server also
   disables caching, so do NOT use it in production.
1. Open http://127.0.0.1:8080/ in your browser to see your newly built Vector.

When you make changes to `matrix-react-sdk`, you will need to run `npm run
build` in the relevant directory. You can do this automatically by instead
running `npm start` in the directory, to start a development builder which
will watch for changes to the files and rebuild automatically.

If you add or remove any components from the Vector skin, you will need to rebuild
the skin's index by running, `npm run reskindex`.

Filing issues
=============

All issues for Vector-web and Matrix-react-sdk should be filed at
https://github.com/matrix-org/matrix-react-sdk/issues

Triaging issues
===============

Issues will be triaged by the core team using the following primary set of tags:

priority:
    P1: top priority; typically blocks releases.
    P2: one below that
    P3: non-urgent
    P4/P5: bluesky some day, who knows.

bug or feature:
  bug severity:
     * cosmetic - feature works functionally but UI/UX is broken.
     * critical - whole app doesn't work
     * major - entire feature doesn't work
     * minor - partially broken feature (but still usable)

     * release blocker

     * ui/ux (think of this as cosmetic)

     * network (specific to network conditions)
     * platform (platform specific)

Enabling encryption
===================

End-to-end encryption in Vector and Matrix is not yet considered ready for
day-to-day use; it is experimental and should be considered only as a
proof-of-concept. See https://matrix.org/jira/browse/SPEC-162 for an overview
of the current progress.

Vector is built with support for end-to-end encryption by default.

To enable encryption for a room, type

```
/encrypt on
```

in the message bar in that room. Vector will then generate a set of keys, and
encrypt all outgoing messages in that room. (Note that other people in that
room will send messages in the clear unless they also `/encrypt on`.)

Note that historical encrypted messages cannot currently be decoded - history
is therefore lost when the page is reloaded.

There is currently no visual indication of whether encryption is enabled for a
room.
