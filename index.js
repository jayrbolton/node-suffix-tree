const assert = require('assert')

const STree = {}
module.exports = STree

// We don't separate nodes and edges; all are nodes
// Nodes link to children nodes by a hash of names
// Sometimes we refer to nodes as "edges", but they are just child nodes of some parent node

STree.create = function create (str) {
  const root = {id: 0, children: {}, start: 0}
  const tree = {
    activeNode: root,
    root: root, // root node
    left: -1, // current position pointer
    right: -1, // look ahead pointer
    idx: -1, // the last string we have added
    lastID: 0, // a node id incrementer
    strings: {}, // save what strings are at what indexes
    skip: 0,
    text: [],
    _tag: 'STree'
  }
  // Optionally start building the tree immediately
  if (str) {
    STree.add(str, tree)
  }
  return tree
}

// Add a new string to the tree
STree.add = function add (str, tree) {
  assert(typeof str === 'string' && str.length, 'pass in a string')
  assert(tree && tree._tag === 'STree', 'pass in a suffix-tree object')
  tree.idx += 1
  tree.strings[tree.idx] = str
  // Add each character individually
  for (let i = 0; i < str.length; ++i) {
    STree.addSingle(str[i], tree)
  }
  STree.addSingle('$' + tree.idx, tree)
  return tree
}

// Add a single token to the tree
// A token can be a character or a string
// Tokens can be multi-character (mainly to denote string endings)
STree.addSingle = function addSingle (char, tree) {
  assert(tree && tree._tag === 'STree', 'pass in a tree')
  assert((typeof char === 'number') || (typeof char === 'string' && char.length), 'pass in a character or string')

  tree.right += 1
  tree.text.push(char)
  let prevInternalNode // For tracking suffix links

  while (tree.left + tree.skip < tree.right) {
    let skipped = tree.left + tree.skip

    // Try to skip nodes if our extension goes beyond the edge length
    if (skipped < tree.right) {
      let edgeChar = tree.text[skipped + 1]
      let edge = tree.activeNode.children[edgeChar]
      if (edge) {
        let edgeLen = getNodeLength(tree, edge)
        let extension = tree.right - (tree.left + tree.skip)
        while (edgeLen < extension) {
          tree.activeNode = edge
          tree.skip += edgeLen
          extension = tree.right - (tree.left + tree.skip)
          if (!extension) break
          edgeChar = tree.text[tree.left + tree.skip + 1]
          edge = tree.activeNode.children[edgeChar]
          if (!edge) break
          edgeLen = getNodeLength(tree, edge)
        }
      }
    }
    const node = tree.activeNode

    skipped = tree.left + tree.skip
    let extension = tree.right - skipped - 1

    // No extension/lookahead
    if (extension <= 0) {
      if (node.children[char]) {
        return tree
      } else {
        // The edge does not exist; create a new leaf
        node.children[char] = createNode(tree.right, node, tree)
        tree.left += 1
        tree.activeNode = tree.root
        tree.skip = 0
      }
    } else {
      // We have an extension/lookahead; we must match or split a node
      const edgeChar = tree.text[skipped + 1]
      const edge = node.children[edgeChar]
      const extension = tree.right - skipped - 1
      const matchChar = tree.text[edge.start + extension]
      if (char === matchChar) {
        return tree
      } else {
        // Perform an internal node split at the matchChar
        // Create an ending for the current active edge
        const endChild = createNode(tree.right, edge, tree) // create a child for char
        const splitChild = createNode(edge.start + extension, edge, tree) // child for the split suffix
        if (edge.end !== undefined) {
          // The edge already has children
          // splitChild gets all the children
          const splitChildLength = getNodeLength(tree, edge) - extension
          splitChild.end = splitChild.start + splitChildLength - 1
          for (let childChar in edge.children) {
            splitChild.children[childChar] = edge.children[childChar]
            delete edge.children[childChar]
          }
        }
        edge.end = edge.start + extension - 1
        edge.children[char] = endChild
        edge.children[matchChar] = splitChild
        // Link the edge node to any previously created internal node (suffix linking)
        if (prevInternalNode) {
          prevInternalNode.link = edge
        }
        prevInternalNode = edge
        if (!node.link || node.link.parent === tree.root) {
          tree.activeNode = tree.root
        } else {
          tree.activeNode = node.link
        }
        if (tree.activeNode === tree.root) {
          tree.skip = 0
        } else {
          tree.skip -= 1
        }
        tree.left += 1
      }
    }
  }

  return tree
}

// Get the length of the string represented by a node
function getNodeLength (tree, node) {
  const end = node.end === undefined ? tree.right : node.end
  return end + 1 - node.start
}

// Create a node with a given start index
function createNode (start, parent, tree) {
  tree.lastID += 1
  return { start: start, children: {}, id: tree.lastID, parent }
}

// Convert a suffix tree into a formatted tree using indentations
STree.format = function format (tree) {
  assert(tree && tree._tag === 'STree', 'pass in a tree')
  let str = 'Full Text: ' + tree.text.join('') + '\n'
  let indentation = 0
  str += formatNode(tree, tree.root, indentation)
  return str
}

// Created a formatted indentation string for a single tree -- used in STree.format
function formatNode (tree, node, indent) {
  let str = ''
  for (let char in node.children) {
    const childNode = node.children[char]
    let end = tree.right
    if (childNode.end !== undefined) end = childNode.end
    const substr = tree.text.slice(childNode.start, end + 1).join('')
    str += ' '.repeat(indent) + childNode.id + '. "' + substr + '" | ' + childNode.start + '-' + end
    if (childNode.link) {
      str += ' -> ' + childNode.link.id
    }
    str += '\n' + formatNode(tree, childNode, indent + 3)
  }
  return str
}

STree.getStringByIndex = function getStringByIndex (idx, tree) {
  const str = tree.strings[idx]
  if (str === undefined) {
    throw new Error('Undefined string for index ' + idx + '. Max is ' + tree.idx)
  }
  return str
}

// Find the starting indexes for a suffix in a tree, if it exists
// Returns [] if there are no suffixes
STree.findSuffix = function findSuffix (suffix, tree) {
  assert(typeof suffix === 'string', 'pass in a suffix string')
  assert(tree && tree._tag === 'STree', 'pass in a suffix-tree object')
  suffix += '\0'
  // Current node position
  let node = tree.root
  let i = 0
  // We find the end of a suffix if:
  // We have run through our full string
  // The next character in the current node is a number end token
  // Or the current node is ended, and there is at least one child edge with a number end token
  while (i < suffix.length) {
    let firstChar = suffix[i]
    if (firstChar === '\0') {
      let results = []
      Object.keys(node.children).forEach(function (key) {
        if (key[0] === '$' && key.length > 1) {
          results.push(parseInt(key.slice(1)))
        }
      })
      return results
    }
    let child = node.children[firstChar]
    if (!child) {
      return []
    }

    let len = getNodeLength(tree, child)
    for (let j = 1; j < len; ++j) {
      let currentChar = suffix[i + j]
      let charToMatch = tree.text[child.start + j]
      if (currentChar === '\0' && charToMatch[0] === '$' && charToMatch.length > 1) {
        const idx = parseInt(charToMatch.slice(1))
        // Successfully matched suffix!
        return [idx]
      } else if (currentChar !== charToMatch) {
        // No match; failure
        return []
      }
    }

    i += len
    node = child
  }
  return []
}

// Return an array of arrays of ALL suffixes
// Traverses every path of the tree
STree.allSuffixes = function allSuffixes (tree) {
  return allSuffixesRecur(tree, tree.root, '', [])
}

function allSuffixesRecur (tree, node, parentStr, arr) {
  for (let char in node.children) {
    let edge = node.children[char]
    let substr = parentStr
    if (edge.end === undefined) {
      substr += tree.text.slice(edge.start).join('')
      arr.push(substr)
    } else {
      let nestedParentStr = parentStr + tree.text.slice(edge.start, edge.end + 1).join('')
      arr = allSuffixesRecur(tree, edge, nestedParentStr, arr)
    }
  }
  return arr
}

/*
// TODO maybe keep track of what tokens belong to what strings
// could keep another array that maps to the .text array called occurrences
// each elem in occurences is an array of string indexes
// Maybe this could clean up findSuffixes logic too
// -- also, general function that traverses the tree given a string and returns the next token
// Find all occurrences of a substring
function findSubstrings (str, tree) {
  // Need to:
  // Traverse down the tree, just like findSuffixes (generalize this?)
  // must match ALL corresponding characters
  // up to the ln of `str`
  // then, to find indexes:
  //  continue traversin on any char until you hit an ending token
  //  if you hit an inner end token, return that only 
  //  if you hit a node branch, follow both branches and add both to results
  for (let i = 0; i < str.length; ++i) {
  }
  // TODO
}
*/

/*
// Get the longest common substring among all strings in a tree
function longestCommonSubstring (tree) {
  // TODO
  // Follow every child from root until you hit an ending token, either as a child or inner
}
*/
