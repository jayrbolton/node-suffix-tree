const STree = require('..')
const test = require('tape')

test('create on xyzxyaxyz$', function (t) {
  const tree = STree.create('xyzxyaxyz$')
  console.log(STree.format(tree))
  t.deepEqual(tree.text, 'xyzxyaxyz$', 'text')
  t.deepEqual(tree.root, tree.activeNode, 'activeNode and root')
  t.strictEqual(tree.remainder, 0, 'remainder')
  t.strictEqual(tree.activeLength, 0, 'activeLength')
  t.strictEqual(tree.activeEdge, null, 'activeEdge')
  t.strictEqual(tree.activeEdgeIdx, null, 'activeEdgeIdx')
  t.end()
})

// Another one to test: 'abacabadabacabae'
// and: 'aabaaabb'

test.only('create and search on abccbabbabbc$', function (t) {
  const tree = STree.create('abccbabbabbc$')
  console.log(STree.format(tree))
  // t.strictEqual(STree.findSuffix('bc$', tree), 10, 'woops')
  t.end()
  /*
  const examples = [
    ['$', 12, 'a'],
    ['c$', 11, 'ab'],
    ['bc$', 10, 'abc'],
    ['bbc$', 9, 'abcc'],
    ['abbc$', 8, 'abbc'],
    ['babbc$', 7, 'bab'],
    ['bbabbc$', 6, 'bbc'],
    ['abbabbc$', 5, 'abccbabbabbc'],
    ['babbabbc$', 4, 'babbabbc'],
    ['cbabbabbc$', 3, 'abc$'],
    ['ccbabbabbc$', 2, 'bbabb$'],
    ['bccbabbabbc$', 1, 'babc$'],
    ['abccbabbabbc$', 0, 'b$']
  ]
  examples.slice(11).forEach(function ([suff, idx, bad]) {
    t.strictEqual(STree.findSuffix(suff, tree), idx, 'good match on ' + suff)
    t.strictEqual(STree.findSuffix(bad, tree), -1, 'bad match on ' + bad)
  })
  t.end()
  */
})

test('create on a random fragment', function (t) {
  const tree = STree.create('que+eo+meliore%2C%0Aquo+$')
  console.log(STree.format(tree))
    /*
  t.deepEqual(tree.text, 'abccbabbabbc$', 'text')
  t.deepEqual(tree.root, tree.activeNode, 'activeNode and root')
  t.strictEqual(tree.remainder, 0, 'remainder')
  t.strictEqual(tree.activeLength, 0, 'activeLength')
  t.strictEqual(tree.activeEdge, null, 'activeEdge')
  t.strictEqual(tree.activeEdgeIdx, null, 'activeEdgeIdx')
  */
  t.end()
})
