const STree = require('..')
const test = require('tape')

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

// TODO -- fix
test.skip('on abcabcdefbcabcd', function (t) {
  const str = 'bananaplantain'
  const tree = STree.create(str)
  testSuffixes(tree, str, t)
  t.end()
})

// TODO
test.skip('generalized on abab and baba', function (t) {
  const str1 = 'banana'
  const str2 = 'plantain'
  const tree = STree.create()
  STree.add(str1 + str2, tree)
  console.log(STree.format(tree))
  t.end()
})

// Test all suffixes for a suffix tree
function testSuffixes (tree, str, t) {
  str += '$0'
  const suffixes = STree.allSuffixes(tree).sort(sortSuffixes)
  t.strictEqual(suffixes.length, str.length - 1)
  suffixes.forEach(function (suff, idx) {
    let correct = str.slice(str.length - idx - 2)
    t.strictEqual(suff, correct, suff + ' vs ' + correct)
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
