const STree = require('..')
const test = require('tape')

// require('./fuzz')

test.only('what', function (t) {
  const str1 = 'anax'
  const str2 = 'ana'
  const tr = STree.create()
  STree.add(str1, tr)
  STree.add(str2, tr)
  console.log(STree.format(tr))
  t.end()
})

test('on xyzxyaxyz', function (t) {
  const str = 'xyzxyaxyz'
  const tree = STree.create(str)
  testSuffixes(tree, str, t)
  t.end()
})

test('on banana', function (t) {
  const str = 'banana'
  const tree = STree.create(str)
  testSuffixes(tree, str, t)
  t.end()
})

test('on abacabadabacabae', function (t) {
  const str = 'abacabadabacabae'
  const tree = STree.create(str)
  testSuffixes(tree, str, t)
  t.end()
})

test('on asdfsfasdfasdfx', function (t) {
  const str = 'asdfsfasdfasdfx'
  const tree = STree.create(str)
  testSuffixes(tree, str, t)
  t.end()
})

test('on aaaaaaa', function (t) {
  const str = 'aaaaaaaa'
  const tree = STree.create(str)
  testSuffixes(tree, str, t)
  t.end()
})

test('on tctcatcaa#ggaaccattg@tccatctcgc', function (t) {
  const str = 'tctcatcaa#ggaaccattg@tccatctcgc'
  const tree = STree.create(str)
  testSuffixes(tree, str, t)
  t.end()
})

test('on abababa', function (t) {
  const str = 'abababa'
  const tree = STree.create(str)
  testSuffixes(tree, str, t)
  t.end()
})

test('on abcabcdefbcabcd', function (t) {
  const str = 'abcabcdefbcabcd'
  const tree = STree.create(str)
  testSuffixes(tree, str, t)
  t.end()
})

test('on abcabcdefhabcabcdw', function (t) {
  const str = 'abcabcdefhabcabcdw'
  const tree = STree.create(str)
  testSuffixes(tree, str, t)
  t.end()
})

test('on abcabcdefbcabcd', function (t) {
  const str = 'abcabcdefbcabcd'
  const tree = STree.create(str)
  testSuffixes(tree, str, t)
  t.end()
})

test('on ananapan', function (t) {
  const str = 'ananapan'
  const tree = STree.create(str)
  testSuffixes(tree, str, t)
  t.end()
})

test('generalized suffix search', function (t) {
  const str1 = 'train'
  const str2 = 'plain'
  const str3 = 'brain'
  const tree = STree.create()
  STree.add(str1, tree)
  STree.add(str2, tree)
  STree.add(str3, tree)
  console.log(STree.format(tree))
  t.deepEqual(STree.findSuffix('brain', tree), [2])
  t.deepEqual(STree.findSuffix('plain', tree), [1])
  t.deepEqual(STree.findSuffix('train', tree), [0])
  t.deepEqual(STree.findSuffix('rain', tree), [2, 0])
  t.deepEqual(STree.findSuffix('lain', tree), [1])
  t.deepEqual(STree.findSuffix('ain', tree), [1, 0, 2])
  t.deepEqual(STree.findSuffix('in', tree), [1, 0, 2])
  t.deepEqual(STree.findSuffix('n', tree), [1, 0, 2])
  t.deepEqual(STree.findSuffix('', tree), [0, 1, 2])
  t.end()
})

test('fetch string by index', function (t) {
  const str1 = 'xyz'
  const str2 = 'abc'
  const tree = STree.create()
  STree.add(str1, tree)
  STree.add(str2, tree)
  t.deepEqual(STree.getStringByIndex(0, tree), 'xyz')
  t.deepEqual(STree.getStringByIndex(1, tree), 'abc')
  t.throws(() => STree.getStringByIndex(2, tree))
  t.end()
})

// Test all suffixes for a suffix tree
function testSuffixes (tree, str, t) {
  str += '$0'
  const suffixes = STree.allSuffixes(tree).sort(sortSuffixes)
  t.strictEqual(suffixes.length, str.length - 1)
  suffixes.forEach(function (suff, idx) {
    let correct = str.slice(str.length - idx - 2)
    t.strictEqual(suff, correct, suff + ' vs ' + correct + ' (result vs expected)')
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
