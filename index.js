const Debug = require('debug')
const assert = require('assert')

const STree = {}
module.exports = STree

STree.create = function create (str) {
  const root = createNode(0)
  const tree = {
    activeNode: root,
    activeEdge: null,
    activeEdgeIdx: null,
    activeLength: 0,
    skippedLength: 0,
    skippedEdge: 0,
    end: -1,
    remainder: 0,
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

// In the visualization, pay attention to the green blocks
// We need some kind 'skippedLength' that we subtract from total active length.

// Add a character or string into the tree
STree.add = function add (char, tree) {
  assert(tree && tree._tag === 'STree', 'pass in a tree')
  assert(char, 'pass in a character or string')
  const debug = Debug('suffix-tree:add')
  // Add a multi-character string
  if (char.length > 1) {
    for (let i = 0; i < char.length; ++i) {
      STree.add(char[i], tree)
    }
    return tree
  }

  // Add a single character to the tree
  tree.end += 1
  tree.remainder += 1
  tree.text += char
  let prevInternalNode // For tracking suffix links
  debug('NEW CHAR', char)
  let looping = true // A flag to stop the while loop early

  while (tree.remainder > 0 && looping) {
    const activeLength = tree.activeLength - tree.skippedLength
    if (activeLength) {
      // get the active edge
      const edge = tree.activeNode.children[tree.activeEdge]
      // get the character at the active point
      const activeChar = tree.text[edge.start + activeLength]
      if (char === activeChar) {
        debug('  MATCH', char)
        // we have an internal character match; move the active point forward
        tree.activeLength += 1
        looping = false
      } else {
        debug('  SPLIT internal node', edge.id)
        // Perform an internal node split
        // Create an ending for the current active edge
        edge.end = edge.start + activeLength - 1
        // Create two more child nodes
        const childNode1 = createNode(tree.end)
        const splitStart = edge.start + activeLength
        const splitStartChar = tree.text[splitStart]
        const childNode2 = createNode(splitStart)
        if (edge.children[splitStartChar]) {
          // If there are existing children, be sure to keep them as children
          childNode2.children[splitStartChar] = edge.children[splitStartChar]
        }
        if (edge.children[char]) {
          childNode2.children[char] = edge.children[char]
        }
        edge.children[char] = childNode1
        edge.children[splitStartChar] = childNode2
        // Link the edge node to any previously created internal node (suffix linking)
        if (prevInternalNode) {
          prevInternalNode.link = edge
        }
        prevInternalNode = edge
        tree.remainder -= 1
        tree.skippedLength = 0
        tree.skippedEdge = 0
        if (tree.activeNode === tree.root) {
          debug('  SET ACTIVE LEN length after split')
          tree.activeLength -= 1
          tree.activeEdgeIdx += 1
          tree.activeEdge = tree.text[tree.activeEdgeIdx]
        } else {
          tree.activeNode = tree.activeNode.link || tree.root
        }
      }
    } else {
      if (tree.activeNode.children[char]) {
        // Edge already exists
        debug('  SET active point')
        tree.activeLength += 1
        tree.activeEdge = char
        tree.activeEdgeIdx = tree.activeNode.children[char].start
        looping = false
      } else {
        // Edge does not exist; create it
        debug('  CREATE leaf', char)
        // The edge does not exist; create a new leaf
        tree.activeNode.children[char] = createNode(tree.end)
        tree.remainder -= 1
        tree.activeNode = tree.root
      }
    }
    jumpNode(tree)
    debug(STree.format(tree))
    debug({len: tree.activeLength, node: tree.activeNode.id, edge: tree.activeEdge, rem: tree.remainder, skipL: tree.skippedLength, skipE: tree.skippedEdge})
  }

  if (tree.remainder === 0) {
    // Remainder is now zero; always reset the activeEdge
    tree.activeEdge = null
    tree.activeEdgeIdx = null
    tree.activeLength = 0
  }
  return tree
}

// If our active point extends over another node, we want to move our active node and reduce our active length
function jumpNode (tree) {
  const debug = Debug('suffix-tree:add')
  if (tree.activeLength) {
    let edge = tree.activeNode.children[tree.activeEdge]
    let edgeLen = getNodeLength(tree, edge)
    while (edge && edgeLen <= (tree.activeLength - tree.skippedLength)) {
      debug('  JUMP node')
      tree.activeNode = edge
      tree.skippedLength += edgeLen
      // TODO set this to += edgeLen?
      // Also make it a skipped value so we can restore the prev value?
      tree.skippedEdge += edgeLen
      tree.activeEdge = tree.text[tree.activeEdgeIdx + tree.skippedEdge]
      edge = tree.activeNode.children[tree.activeEdge]
      if (edge) edgeLen = getNodeLength(tree, edge)
    }
  }
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
