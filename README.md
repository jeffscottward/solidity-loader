Solidity Loader
===============
This solidity loader was orignally designed to be used in conjuntion with the `pudding-loader`. See this basic setup below.

##### Basic Setup

```
module: {
    loaders: [
    {
      test: /\.js$/,
      exclude: /(node_modules)/,
      loaders: ['babel'],
      include: path.join(__dirname, 'src'),
      query: {
        presets: ['es2015'],
        plugins: ['transform-runtime']
      }
    },
    { test: /\.sol$/, loaders: ["pudding-loader","solidity-loader"]},
    { test: /\.css$/, loader: "style-loader!css-loader" },
    { test: /\.png$/, loader: "url-loader?limit=100000" },
    { test: /\.json$/, loader: "json-loader" },
    { test: /\.jpg$/, loader: "file-loader" }]
  }
```
In order for the `pudding-loader` and `solidity-loader` to work together, they need to be in this particlar order in `loaders: []`. (Possible race condition issue?)

This setup allows you to hot-reload and export callable javascript functions to an RPC endpoint.

------------------------

##### Pure Solidity Setup

```
module: {
    loaders: [
    {
      test: /\.js$/,
      exclude: /(node_modules)/,
      loaders: ['babel'],
      include: path.join(__dirname, 'src'),
      query: {
        presets: ['es2015'],
        plugins: ['transform-runtime']
      }
    },
    { test: /\.sol$/, loaders: ["solidity-loader?export=true"]},
    { test: /\.css$/, loader: "style-loader!css-loader" },
    { test: /\.png$/, loader: "url-loader?limit=100000" },
    { test: /\.json$/, loader: "json-loader" },
    { test: /\.jpg$/, loader: "file-loader" }]
  }
```

The `?export=true` query creates an object with contract factories and contract information.

It's a basic import and doesn't do everything, but sets up the watchers, and allows basic imports.

------------------------

Questions or Issues? File it! Or better yet, a pull request, with a demo to test with. Thanks and enjoy.

**Contributors:**

@jeffscottward

@SilentCicero