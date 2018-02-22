# suffix-tree

> Work in progress: basic algorithm is working, generalized suffix trees not yet done

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

You can view all tested strings in `test/index.js` -- if you have a string that you want to include in the test suite, please open an issue or pr.

## API

WIP

## Install

With [npm](https://npmjs.org/) installed, run

```
$ npm install @jayrbolton/suffix-tree
```

## See Also

- [Visualization of Ukkonnen's algorithm](brenden.github.io/ukkonen-animation/)
- [Explanation of Ukkonnen's algorithm](https://stackoverflow.com/questions/9452701/ukkonens-suffix-tree-algorithm-in-plain-english/9513423#9513423)
- [Wikipedia - Ukkonnen's algorithm](https://en.wikipedia.org/wiki/Suffix_tree)
- [Wikipedia - Suffix Trees](https://en.wikipedia.org/wiki/Suffix_tree)

## License

MIT

