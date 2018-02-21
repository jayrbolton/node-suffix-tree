const Debug = require('debug')
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
    end: -1,
    root,
    text: '',
    _tag: 'STree'
  }
  // Optionally start building the tree immediately
  if (str) {
    for (let i = 0; i < str.length; ++i) {
      STree.add(str[i], tree)
    }
  }
  return tree
}

STree.add = function add (char, tree) {
  assert(tree && tree._tag === 'STree', 'pass in a tree')
  assert(char && char.length, 'pass in a character or string')
  const debug = Debug('suffix-tree:add')
  // Add a multi-character string
  if (char.length > 1) {
    for (let i = 0; i < char.length; ++i) {
      STree.add(char[i], tree)
    }
    return tree
  }

  debug('state', {l: tree.left, r: tree.right, skip: tree.skip, node: tree.activeNode.id, text: tree.text})
  debug('ADD', char)
  tree.right += 1
  tree.end += 1
  tree.text += char
  let prevInternalNode // For tracking suffix links

  while (tree.left + tree.skip < tree.right) {
    let skipped = tree.left + tree.skip
    debug({skipped})

    // Try to skip forward to the next edge
    if (skipped < tree.right) {
      let edgeChar = tree.text[skipped + 1]
      let edge = tree.activeNode.children[edgeChar]
      if (edge) {
        let edgeLen = getNodeLength(tree, edge)
        let extension = tree.right - (tree.left + tree.skip)
        debug({edgeLen})
        debug({extension})
        while (edgeLen < extension) {
          tree.activeNode = edge
          tree.skip += edgeLen
          debug('SKIP!')
          extension = tree.right - (tree.left + tree.skip)
          if (!extension) break
          edgeChar = tree.text[tree.left + tree.skip + 1]
          edge = tree.activeNode.children[edgeChar]
          if (!edge) break
          edgeLen = getNodeLength(tree, edge)
        }
      }
      debug({node: tree.activeNode.id})
    }
    const node = tree.activeNode

    skipped = tree.left + tree.skip
    let extension = tree.right - skipped - 1

    // No extension
    if (extension <= 0) {
      if (node.children[char]) {
        debug('MATCH')
        return tree
      } else {
        // The edge does not exist; create a new leaf
        debug('CREATE')
        node.children[char] = createNode(tree.end)
        tree.left += 1
        tree.activeNode = tree.root
        tree.skip = 0
      }
    } else {
      const edgeChar = tree.text[skipped + 1]
      debug({edgeChar})
      const edge = node.children[edgeChar]
      debug({edge: edge.id})
      const extension = tree.right - skipped - 1
      debug({extension})
      const matchChar = tree.text[edge.start + extension]
      debug({matchChar})
      if (char === matchChar) {
        debug('MATCH')
        return tree
      } else {
        debug('SPLIT')
        // Perform an internal node split at the matchChar
        // Create an ending for the current active edge
        const endChild = createNode(tree.end) // create a child for char
        const splitChild = createNode(edge.start + extension) // child for the split suffix
        if (edge.end !== undefined) {
          // The edge already has children
          // splitChild gets all the children
          debug('HAS CHILDREN', edge.children)
          debug({start: edge.start, end: edge.end, id: edge.id})
          debug({len: getNodeLength(tree, edge)})
          debug(STree.format(tree))
          const splitChildLength = getNodeLength(tree, edge) - extension
          console.log({splitChildLength})
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
        debug('state', {l: tree.left, r: tree.right, skip: tree.skip, node: tree.activeNode.id, text: tree.text})
      }
    }
  }

  return tree
}

// Get the length of the string represented by a node
function getNodeLength (tree, node) {
  const end = node.end === undefined ? tree.end : node.end
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
    const end = childNode.end === undefined ? tree.end : childNode.end
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
  const debug = Debug('suffix-tree:findSuffix')
  debug(STree.format(tree))
  let node = tree.root
  let i = 0
  let foundMatch
  while (i < suffix.length) {
    debug('node', node.id)
    let firstChar = suffix[i]
    if (!node.children[firstChar]) {
      return -1
    }
    node = node.children[firstChar]
    if (foundMatch === undefined) {
      foundMatch = node.start
    }
    for (let j = node.start + 1; j <= node.end; ++j) {
      debug('matching', 'i, j', i, j, 'node.start', node.start, 'node.end', node.end)
      debug('matching', suffix[i + j], tree.text[j])
      if (suffix[i + j] !== tree.text[j]) {
        return -1
      }
    }
    if (node.end === undefined) {
      debug('FOUND on', node)
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
