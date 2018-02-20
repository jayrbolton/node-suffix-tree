# suffix-tree

> WORK IN PROGRESS

Suffix trees are useful for different types of string searching. They also allow you to search quickly over a set of strings. This is an efficient implementation using Ukkonnen's algorithm and requires O(n) time and O(n) space to construct a tree for a string of length n.

You can can check whether a string is a substring of another, whether a string is a suffix of another (starting from any point), the number of occurrences of a substring, or you can find the longest repeated substring. You can also do these operations on a set of multiple strings in O(n) time.

## Usage

```js
var suffixTree = require('@jayrbolton/suffix-tree')
var tree = suffixTree.create('banana')
var suffixIndex = tree.findSuffix('ana') // -> 3
var substringIndex = tree.findSubstring('ana') // -> 1
var occurrences = tree.occurrences('ana') // -> 2
var longestRepeating = tree.longestRepeating() // -> 'ana'
```

## API

### Data structure

A suffix tree is simple object where each key is a character in the string, and each value is a nested tree or a leaf. The end of the string is denoted '$'. A leaf holds the index of the start of any substrings that you can get by following a path in the tree to that leaf.

A suffix tree of "banana":

```js
banana
const bananaTree = {
  _conent: 'banana',
  0: {'$': 0}, // 'banana$'
  1: { // 'a'
    '$': 5, // 'nana'
    2: { //
      '$': 3,
      4: 1
    }
  }
  2
  na: {
    '$': 4,
    'na$': 2
  }
}
```

For example, if you follow the suffix 'nana' from the root, you will end up at the leaf labeled '2', meaning 'nana' is a vlaid suffix starting at index 2.

The tree's memory storage is `Theta(n)`

Check out this cool visualization of the tree-building algorithm: http://brenden.github.io/ukkonen-animation/

### create(string)

Takes a string and returns a suffix tree (see "Data structure" above)

This function's peformance is O(n) and memory usage is also O(n) using Ukkonen's algorithm.

```js
var suffixTree = require('suffix-tree')

var tree = suffixTree.create('banana')
```

### findSuffix(string, tree), tree.findSuffix(string)

Returns the index of the suffix for a given string. Returns -1 if the substring is not found, similar to `indexOf`.

This runs {{{

```js
var tree = suffixTree.create('banana')
var index = tree.findSuffix('nana') // -> 2
var index2 = tree.findSuffix('ana') // -> 3
var index3 = tree.findSuffix('xyz') // -> -1
```

### findSubstring(string, tree), tree.findSubstring(string)

Find a substring within a suffix tree. Returns the index of the substring's start position, or returns -1 if it is not found, similar to `indexOf`.

### occurrences(string, tree), tree.occurrences(string)

Find the number of occurrences of a substring in a suffix tree.

### longestRepeating(tree)

Find the longest repeating substring in a suffix tree.

## Install

With [npm](https://npmjs.org/) installed, run

```
$ npm install suffix-tree
```

## See Also

- [Wikipedia - Suffix Trees](https://en.wikipedia.org/wiki/Suffix_tree)

## License

MIT

