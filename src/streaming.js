const FreeT = require("./freet");
const Of = require("./of");
const { Unit, Arr, Cont } = require("@masaeedu/fp");
const { mdo } = require("@masaeedu/do");
const util = require("./util");

const { unit } = Unit;

// type Stream a m r = FreeT (Of a) m r

// :: a -> Stream a m ()
const yields = a => FreeT.liftF(Of)([a, unit]);

// ::: Applicative m -> (r -> b) -> (a -> b -> b) -> Stream a m r -> m (Of b r)
const fold = A => done => step => stream =>
  stream(r => A.of([done(r), r]))(xmr => ([a, x]) =>
    A.map(([b, xp]) => [step(a)(b), xp])(xmr(x))
  );

// :: Applicative m -> Stream a m r -> m [a]
const toList = A => stream =>
  A.map(Of.first)(fold(A)(_ => [])(Arr.Cons)(stream));

// :: Foldable f -> f a -> Stream a m ()
const each = F =>
  F.foldr(a => stream => pure => bind =>
    bind(_ => stream(pure)(bind))([a, unit])
  )(FreeT.of(unit));

// :: (a -> Bool) -> Stream a m r -> Stream a m r
const filter = pred => stream => pure => bind =>
  stream(pure)(xmr => ([a, x]) => (pred(a) ? bind(xmr)([a, x]) : xmr(x)));

// :: (a -> Bool) -> Stream a m r -> Stream a m ()
const takeWhile = pred => stream => pure => bind =>
  stream(_ => pure(unit))(xmr => ([a, x]) => {
    if (pred(a)) return bind(xmr)([a, x]);
    else return pure(unit);
  });

// :: NodeRStream -> Stream Byte Cont! ()
const readBytes = rs => {
  const br = util.foreverC(FreeT)(
    FreeT.chain(yields)(util.readByte(FreeT)(rs))
  );
  return FreeT.chain(_ => takeWhile(b => !util.isNull(b))(br))(
    util.waitForReadable(FreeT)(rs)
  );
};

// :: Stream a Cont! r -> Cont! r
const print = stream =>
  stream(Cont.of)(xmr => ([a, x]) => Cont.chain(_ => xmr(x))(util.log(a)));

module.exports = {
  yields,
  fold,
  toList,
  each,
  filter,
  takeWhile,
  readBytes,
  print
};
