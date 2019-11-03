const test = require("ava");
const ListT = require("./listt");
const {
  Arr,
  Maybe,
  Fnctr: { Identity }
} = require("@masaeedu/fp");

const List = ListT(Identity);

const tl = List.fromFoldable(Arr)([1, 2, 3, 4, 5]);

test("fromFoldable/toArray", t => {
  t.deepEqual([1, 2, 3, 4, 5], List.toArray(tl));
});

test("functor", t => {
  t.deepEqual([2, 3, 4, 5, 6], List.toArray(List.map(a => a + 1)(tl)));
});

test("applicative", t => {
  t.deepEqual(
    [2, 3, 4, 5, 6, 3, 4, 5, 6, 7],
    List.toArray(List.ap(List.cons(a => a + 1)(List.of(a => a + 2)))(tl))
  );
});

test("monad", t => {
  t.deepEqual(
    [2, 3, 3, 4, 4, 5, 5, 6, 6, 7],
    List.toArray(List.chain(a => List.cons(a + 1)(List.of(a + 2)))(tl))
  );
});

test("drop", t => {
  t.deepEqual(
    [4, 5, 6],
    List.toArray(List.drop(3)(List.fromFoldable(Arr)([1, 2, 3, 4, 5, 6])))
  );
});

test("laziness", t => {
  const a = List.fromFoldable(Arr)(Array(100000).fill(1));
  const lf = List.map(x => x + 1)(a);
  const ll = List.append(lf)(lf);
  const lu = List.unfoldM(b => Maybe.Just([b, b]))(2);
  const la = List.ap(List.of(x => x + 1))(a);
  const lm = List.chain(x => List.of(x + 1))(a);
  const size = 100;
  const drop = 1000; // seems to be the max on my machine :(
  const ex = Array(size).fill(2);
  const from = l => List.toArray(List.take(size)(List.drop(drop)(l)));
  t.deepEqual(ex, from(lf));
  t.deepEqual(ex, from(ll));
  t.deepEqual(ex, from(lu));
  t.deepEqual(ex, from(la));
  t.deepEqual(ex, from(lm));
});
