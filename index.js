const assert = require('assert')

const STree = {}
module.exports = STree

STree.create = function create (str) {
  const root = createNode(0)
  const tree = {
    activeNode: root,
    right: -1,
    left: -1,
    skip: 0,
    total: 0,
    root,
    text: '',
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
  // Append the null character plus the idx of this string
  str += '\0'
  tree.total += 1
  // Add a multi-character string
  for (let i = 0; i < str.length; ++i) {
    STree.addChar(str[i], tree)
  }
  return tree
}

// Add a single character to the tree
STree.addChar = function addChar (char, tree) {
  assert(tree && tree._tag === 'STree', 'pass in a tree')
  assert(char && char.length, 'pass in a character or string')

  tree.right += 1
  tree.text += char
  let prevInternalNode // For tracking suffix links

  while (tree.left + tree.skip < tree.right) {
    let skipped = tree.left + tree.skip

    // Try to skip forward to the next edge
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

    // No extension
    if (extension <= 0) {
      if (node.children[char]) {
        return tree
      } else {
        // The edge does not exist; create a new leaf
        node.children[char] = createNode(tree.right)
        tree.left += 1
        tree.activeNode = tree.root
        tree.skip = 0
      }
    } else {
      const edgeChar = tree.text[skipped + 1]
      const edge = node.children[edgeChar]
      const extension = tree.right - skipped - 1
      const matchChar = tree.text[edge.start + extension]
      if (char === matchChar) {
        return tree
      } else {
        // Perform an internal node split at the matchChar
        // Create an ending for the current active edge
        const endChild = createNode(tree.right) // create a child for char
        const splitChild = createNode(edge.start + extension) // child for the split suffix
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
        tree.activeNode = tree.activeNode.link || tree.root
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
function createNode (start) {
  id += 1
  return { start: start, children: {}, id }
}
let id = -1

// Convert a suffix tree into a formatted tree using indentations
STree.format = function format (tree) {
  let str = 'Full Text: ' + tree.text + '\n'
  let indentation = 0
  str += formatNode(tree, tree.root, indentation)
  return str
}

// Created a formatted indentation string for a single tree -- used in STree.format
function formatNode (tree, node, indent) {
  let str = ''
  for (let char in node.children) {
    const childNode = node.children[char]
    const end = childNode.end === undefined ? tree.right : childNode.end
    const substr = tree.text.slice(childNode.start, end + 1)
    str += ' '.repeat(indent) + childNode.id + '. "' + substr + '" | ' + childNode.start + '-' + end
    if (childNode.link) {
      str += ' -> ' + childNode.link.id
    }
    str += '\n' + formatNode(tree, childNode, indent + 3)
  }
  return str
}

STree.findSuffix = function findSuffix (suffix, tree) {
  assert(suffix && suffix.length, 'pass in a suffix string')
  assert(tree && tree._tag === 'STree', 'pass in a suffix-tree object')
  let node = tree.root
  let i = 0
  let foundMatch
  while (i < suffix.length) {
    let firstChar = suffix[i]
    if (!node.children[firstChar]) {
      return -1
    }
    node = node.children[firstChar]
    if (foundMatch === undefined) {
      foundMatch = node.start
    }
    for (let j = node.start + 1; j <= node.end; ++j) {
      if (suffix[i + j] !== tree.text[j]) {
        return -1
      }
    }
    if (node.end === undefined) {
      return foundMatch
    }
    const nodeLen = node.end + 1 - node.start
    i += nodeLen
  }
  return -1
}

// Return an array of arrays of ALL suffixes
// Traverses every path of the tree -- O(n^2)
STree.allSuffixes = function allSuffixes (tree) {
  return allSuffixesRecur(tree, tree.root, '', [])
}

function allSuffixesRecur (tree, node, parentStr, arr) {
  for (let char in node.children) {
    let edge = node.children[char]
    let substr = parentStr
    if (edge.end === undefined) {
      substr += tree.text.slice(edge.start)
      arr.push(substr)
    } else {
      let nestedParentStr = parentStr + tree.text.slice(edge.start, edge.end + 1)
      arr = allSuffixesRecur(tree, edge, nestedParentStr, arr)
    }
  }
  return arr
}
