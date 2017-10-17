# FormData

Yet another FormData implementation for Node.js. Built over Readable stream and async generators.

[![dependencies Status](https://david-dm.org/octet-stream/form-data/status.svg)](https://david-dm.org/octet-stream/form-data)
[![devDependencies Status](https://david-dm.org/octet-stream/form-data/dev-status.svg)](https://david-dm.org/octet-stream/form-data?type=dev)
[![Build Status](https://travis-ci.org/octet-stream/form-data.svg?branch=master)](https://travis-ci.org/octet-stream/form-data)
[![Code Coverage](https://codecov.io/github/octet-stream/form-data/coverage.svg?branch=master)](https://codecov.io/github/octet-stream/form-data?branch=master)

## Installation

You can install this package from npm:

```
npm install --save then-busboy
```

Or with yarn:

```
yarn add then-busboy
```

## API

### `constructor FormData()`

Initialize new FormData instance

#### Instance methods

##### `set(name, value[, filename]) -> {void}`

Set a new value for an existing key inside **FormData**,
or add the new field if it does not already exist.

  - **{string}** name – The name of the field whose data is contained in **value**
  - **{any}** value – The field value. You can pass any JavaScript primitive type (including **null** and **undefined**),
    **[Buffer](https://nodejs.org/api/buffer.html#buffer_buffer)** or **[Readable](https://nodejs.org/api/stream.html#stream_class_stream_readable)** stream.
    Note that Arrays and Object will be converted to **string** by using **String** function.
  - **{string}** [filename = undefined] – A filename of given field. Can be added only for **Buffer** and **Readable** .

##### `get(name) -> {string | Buffer | stream.Readable}`

Returns the first value associated with the given name.
**Buffer** and **Readable** values will be returned as-is.

  - **{string}** – A name of the value you want to retrieve.

##### `has(name) -> {boolean}`

Check if a field with the given **name** exists inside **FormData**.

  - **{string}** – A name of the field you want to test for.

##### `delete(name) -> {void}`

Deletes a key and its value(s) from a **FormData** object.

  - **{string}** name – The name of the key you want to delete.

##### `keys() -> {iterator}`

Returns an **[iterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols)** allowing to go through the **FormData** keys

##### `values() -> {iterator}`

Returns an **[iterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols)** allowing to go through the **FormData** values

##### `entries() -> {iterator}`

Returns an **[iterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols)** allowing to go through the **FormData** key/value pairs

##### `[Symbol.iterator]() -> {iterator}`

An alias of [entries](#entries---iterator)
