# suffix-tree

Suffix trees are useful for efficient string searching of suffixes and substrings. They're often used in bioinformatics on genomes. One big advantage is that you can search for the same suffix across many strings in linear time. This is an optimized implementation using Ukkonnen's algorithm and requires O(n) time and O(n) space to construct a tree for a string of length n.

You can can check whether a string is a substring of another, whether a string is a suffix of another (starting from any point), the number of occurrences of a substring, or you can find the longest repeated substring. You can also do these operations on a set of multiple strings in linear time.

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

### STree.create(initialStr)

Initiialize a suffix tree. Returns a suffix tree object.

Optionally pass in an initial string to add to the tree

```js
STree.create('banana')
```

### STree.add(string, tree)

Add another, separate string to the tree. This will result in a single, larger tree that combines all strings into one tree.

Mutates the given tree and returns it.

```js
const t = STree.create('banana')
STree.add('plantain', t)
```

### STree.format(tree)

Return a formatted string for a tree to see how it looks. This creates an left indentation-based tree.

```js
console.log(STree.foramt(tree))
```

### STree.findSuffix(string, tree)

Find a given suffix for any string in the tree. Will return an array of indexes of strings that have the suffix. Returns an empty array if the suffix is not found.

You can get the string from its index by using `getStringByIndex`

```js
const ids = STree.findSuffix('ana', tree)
```

### STree.getStringByIndex(id, tree)

Return the original string based on its index

```js
const t = STree.create('banana')
STree.add('plantain', t)
STree.getStringByIndex(0) // -> 'banana'
STree.getStringByIndex(1) // -> 'plantain'
```

### STree.allSuffixes(tree)

Return an array of arrays of ALL suffixes for the entire tree. Traverses every path of the tree

### STree.longestCommonSubstring(tree)

Get the longest common substring among all strings in a tree. Returns the actual string.

```js
const t = STree.create('plantain')
STree.add('entertain', t)
const s = STree.longestCommonSubstring(t) // -> 'tain'
```

### STree.findSubstrings(string, tree)

Find all occurrences of a substring in any string in the tree. Returns an object where:
* Each key in the object is an index to a string in the tree (use `getStringByIndex` to get the string)
* Each value in the object is an array of starting indexes for the substring occurrences in the string

```js
const t = STree.create('banana')
const occs = STree.findSubstrings('an', t) // -> {0: [1, 3]}
// We found occurences in string 0 ('banana'), at starting indexes 1 and 3 inside 'banana'
```

### Un-implemented functions

Suffix trees have a lot of other efficient functions that can be written for them. See [the Wikipedia page](https://en.wikipedia.org/wiki/Suffix_tree#Functionality) for a comprehensive list of these functions. They could either be added to this module or created in independent modules.

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

