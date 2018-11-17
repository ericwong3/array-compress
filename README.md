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
- Works even if some object has extra attributes
- Covered by tests



### Usage

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
```


### Compression Ratio

The compression ratio largely depends on number of columns and rows. Since the approach is to deduplicate column keys, therefore compression ratio increase as number of columns or rows increase. For any moderately sized tabular, we expect to see at least 25% reduction in size.

In the above example, size is cut down to ~72%.

One sample candidate application would be [LINE Rangers Handbook](https://rangers.lerico.net), their [rangers (game units) API](https://rangers.lerico.net/api/getRangersBasics) returns the data in array of object, where each array item is one unit. They have a total of 1300+ units (rows) and 64 attributes (keys) per object, this result in a huge 2MB+ JSON which is quite big for local storage. By using this compression method, we can compress the JSON from a whopping *1.98MB* to *453KB*, a *77% decrease* which is much more decent for local storage.

Conversely, it is *NOT recommended* for use with small dataset (i.e. <5 columns / <5 rows) as the compressed result might be even bigger than uncompressed.

