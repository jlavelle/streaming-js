const test = require("ava");
const ListT = require("./listt");
const {
  Arr,
  Maybe,
  Either,
  Fnctr: { Identity }
} = require("@masaeedu/fp");

const List = ListT(Identity);
const ListE = ListT(Either);

const tl = List.fromFoldable(Arr)([1, 2, 3, 4, 5]);
const tle = ListE.fromFoldable(Arr)([1, 2, 3, 4, 5]);

test("fromFoldable/toArray", t => {
  t.deepEqual([1, 2, 3, 4, 5], List.toArray(tl));
  t.deepEqual(Either.Right([1, 2, 3, 4, 5]), ListE.toArray(tle));
});

test("functor", t => {
  t.deepEqual([2, 3, 4, 5, 6], List.toArray(List.map(a => a + 1)(tl)));
  t.deepEqual(
    Either.Right([2, 3, 4, 5, 6]),
    ListE.toArray(ListE.map(a => a + 1)(tle))
  );
});

test("applicative", t => {
  const ex = [2, 3, 4, 5, 6, 3, 4, 5, 6, 7];
  const f = a => b => a + b;
  t.deepEqual(ex, List.toArray(List.ap(List.cons(f(1))(List.of(f(2))))(tl)));
  t.deepEqual(
    Either.Right(ex),
    ListE.toArray(ListE.ap(ListE.cons(f(1))(ListE.of(f(2))))(tle))
  );
});

test("monad", t => {
  const ex = [2, 3, 3, 4, 4, 5, 5, 6, 6, 7];
  t.deepEqual(
    ex,
    List.toArray(List.chain(a => List.cons(a + 1)(List.of(a + 2)))(tl))
  );
  t.deepEqual(
    Either.Right(ex),
    ListE.toArray(ListE.chain(a => ListE.cons(a + 1)(ListE.of(a + 2)))(tle))
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
