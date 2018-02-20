# suffix-tree

> WORK IN PROGRESS

Suffix trees are useful for different types of string searching. They also allow you to search quickly over a set of strings. This is an efficient implementation using Ukkonnen's algorithm and requires O(n) time and O(n) space to construct a tree for a string of length n.

You can can check whether a string is a substring of another, whether a string is a suffix of another (starting from any point), the number of occurrences of a substring, or you can find the longest repeated substring. You can also do these operations on a set of multiple strings in O(n) time.

## Usage

```js
var STree = require('@jayrbolton/suffix-tree')
var tree = STree.create('banana')
var suffixIndex = STree.findSuffix('ana') // -> 3
var substringIndex = STree.findSubstring('ana') // -> 1
var occurrences = STree.occurrences('ana') // -> 2
var longestRepeating = STree.longestRepeating() // -> 'ana'
```

## API

## Install

With [npm](https://npmjs.org/) installed, run

```
$ npm install suffix-tree
```

## See Also

- [Wikipedia - Suffix Trees](https://en.wikipedia.org/wiki/Suffix_tree)

## License

MIT

