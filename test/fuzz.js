const assert = require('assert')
const STree = require('..')

// Try to find short strings that break the implementation through brute force
// This tests all possible variations of a 5-char string for a 10-letter alphabet

function fuzz () {
  let len = 10
  let alpha = 'abcdfghijk'
  for (let v = 0; v < len; v++) {
    for (let w = 0; w < len; w++) {
      for (let x = 0; x < len; x++) {
        for (let y = 0; y < len; y++) {
          for (let z = 0; z < len; z++) {
            let str = [alpha[v], alpha[w], alpha[x], alpha[y], alpha[z]].join('')
            let tree = STree.create(str)
            testSuffixes(tree, str)
          }
        }
      }
    }
  }
  console.log('all ok')
}

// Test all suffixes for a suffix tree
function testSuffixes (tree, str) {
  str += '$0'
  const suffixes = STree.allSuffixes(tree).sort(sortSuffixes)
  assert.strictEqual(suffixes.length, str.length - 1)
  suffixes.forEach(function (suff, idx) {
    let correct = str.slice(str.length - idx - 2)
    assert.strictEqual(suff, correct, suff + ' vs ' + correct + ' (result vs expected)')
  })
}

// Sort all suffixes by length, with shortest first
function sortSuffixes (a, b) {
  if (a.length < b.length) {
    return -1
  } else if (a.length > b.length) {
    return 1
  } else {
    return 0
  }
}

console.log('fuzzing...')
fuzz()
