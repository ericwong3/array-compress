# ArrayCompress

Compress array of objects by deduplicating object key's. Useful when storing tabular data under limited space (e.g. local storage).



## Example
Given an array of data, e.g.
```
[
    {name: 'Alice', address: 'Taiwan'},
    {name: 'Bob', address: 'United States'},
]
```
The ArrayCompress can convert it into array of array and strip away the duplicate keys, i.e.
```
Keys: ['name', 'address']
Values: [['Alice', 'Taiwan'], ['Bob', 'United State']]
```



## Features

- No dependency
- Works well with sparse data (e.g. each row has different property)
- Works with data containing `null` and `undefined`
- Covered by tests



## Usage

```js
var ArrayCompress = require('@ericwong3/array-compress');
var compressor = new ArrayCompress();

var myData = [
    {name: 'Alice', address: 'Taiwan', age: 21, favouriteColor: 'red'},
    {name: 'Bob', address: 'United States', age: 13, favouriteColor: 'yellow'},
    {name: 'Charlie', address: 'Hong Kong', age: 55, favouriteColor: 'green'},
    {name: 'Dave', address: 'Japan', age: 87, favouriteColor: 'blue'},
];

var compressed = compressor.compress(myData);
/* compressed = {
    ks: ['name', 'address', 'phone', 'favouriteColor'],
    kv: [
        {c: ['Alice', 'Taiwan', 21, 'red']},
        {c: ['Bob', 'United States', 13, 'yellow']},
        {c: ['Charlie', 'Hong Kong', 55, 'green']},
        {c: ['Dave', 'Japan', 87, 'blue']}
    ]
} */

console.log(JSON.stringify(myData).length);     // Raw Length: 287
console.log(JSON.stringify(compressed).length); // Compressed length: 205, reduced by 28%

var uncompressedData = compressor.decompress(compressed);
// uncompressedData will be equal to myData
```


## Compression Ratio

The compression ratio largely depends on number of columns and rows. Since the approach is to deduplicate column keys, therefore compression ratio increase as number of columns or rows increase. For any moderately sized tabular, we expect to see at least 25% reduction in size.

In the above example, size is cut down to ~72%.

One sample candidate application would be [LINE Rangers Handbook](https://rangers.lerico.net), their [rangers (game units) API](https://rangers.lerico.net/api/getRangersBasics) returns the data in array of object, where each array item is one unit. They have a total of 1300+ units (rows) and 64 attributes (keys) per object, this result in a huge 2MB+ JSON which is quite big for local storage. By using this compression method, we can compress the JSON from a whopping *1.98MB* to *453KB*, a *77% decrease* which is much more decent for local storage.

Conversely, it is *NOT recommended* for use with small dataset (i.e. <5 columns / <5 rows) as the compressed result might be even bigger than uncompressed.



## Advanced Usage

### Working with sparse data

This program automatically scans the data and determine if each row is sparse, and applies a field mapping logic to leave out non-defined property from the compressed output. (Sparse is defined as "not containing all properties from all rows")

As an example, if we compress:

```js
var myData = [
    {a: 1,         b: 2,  c: 5   },
    {a: 1,                       }, // sparse
    {a: undefined, b: 7,         }, // sparse
    {              b: 4,         }, // sparse
    {                     c: 10  }, // sparse
    {a: 50,        b: 51, c: null},
]
```

The producted output will be:

```js
{
    ks: ['a','b','c'],
    vs: [
        { c: [1, 2, 5]             },
        { c: [1],            m: '1'},
        { c: [undefined, 7], m: '3'},
        { c: [4],            m: '2'},
        { c: [10],           m: '4'},
        { c: [50, 51, null]        },
    ]
}
```

For first and last row, since it contains all properties, `m` field will be omitted from output. And for the sparse rows, the `m` field will be used to denote how the values in `c` is being mapped to keys defined in `ks`. For the inner working of `m` field, please consult the source code.
