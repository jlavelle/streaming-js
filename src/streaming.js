const FreeT = require("./freet");
const Of = require("./of");
const { Unit, Arr, Cont, Either } = require("@masaeedu/fp");
const { mdo } = require("@masaeedu/do");
const util = require("./util");
const ListT = require("./listt");

const { unit } = Unit;

// type Stream a m r = FreeT (Of a) m r

// :: a -> Stream a m ()
const yields = a => FreeT.liftF(Of)([a, unit]);

// ::: Applicative m -> (r -> b) -> (a -> b -> b) -> Stream a m r -> m (Of b r)
const fold = A => done => step => stream =>
  stream(r => A.of([done(r), r]))(xmr => ([a, x]) =>
    A.map(([b, xp]) => [step(a)(b), xp])(xmr(x))
  );

// Warning: not stack safe
// :: Monad m -> (s -> m (Either r (a, s))) -> s -> Stream a m r
const unfoldr = M => step => seed => pure => bind => {
  const rec = s =>
    M.chain(
      Either.match({
        Left: r => pure(r),
        Right: ([a, ns]) => bind(x => rec(x))([a, ns])
      })
    )(step(s));

  return rec(seed);
};

// TODO: Make this more general
// :: (s -> Cont! (Either r (a, s))) -> s -> Stream a Cont! r
const unfoldrC = step => seed => pure => bind => {
  const rec = s =>
    mdo(Cont)(({ e }) => [
      () => setImmediate,
      [e, () => step(s)],
      () =>
        Either.match({
          Left: r => pure(r),
          Right: ([a, ns]) => bind(x => rec(x))([a, ns])
        })(e)
    ]);
  return rec(seed);
};

// :: Stream a m r -> (a -> FreeT f m r) -> FreeT f m r
const forOf = stream => f => pure => bind =>
  stream(pure)(xmr => ([a, x]) => f(a)(_ => xmr(x))(bind));

// :: Applicative m -> Stream a m r -> m [a]
const toArray = A => stream =>
  A.map(Of.first)(fold(A)(_ => [])(Arr.Cons)(stream));

// :: Monad m -> Stream a m r -> ListT m a
const toListT = A => stream => {
  const listt = ListT(A);
  return stream(_ => listt.empty)(xmr => ([a, x]) => listt.cons(a)(xmr(x)));
};

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

//:: Int -> NodeRStream -> Stream Buffer Cont! ()
const readChunks = size => rs => {
  const whileReadable = mdo(FreeT)(({ chunk }) => [
    () => util.immediately(FreeT),
    [chunk, () => util.readChunk(FreeT)(size)(rs)],
    () => {
      if (util.isNull(chunk)) return endOrRead;
      else return FreeT.chain(_ => whileReadable)(yields(chunk));
    }
  ]);

  const endOrRead = mdo(FreeT)(({ status }) => [
    [status, () => util.endOrReadable(FreeT)(rs)],
    () =>
      Either.match({
        Left: _ => FreeT.of(unit),
        Right: _ => whileReadable
      })(status)
  ]);

  return endOrRead;
};

//:: NodeRStream -> Stream Byte Cont! ()
const readBytes = readChunks(1);

// :: Stream a Cont! r -> Cont! r
const print = stream =>
  stream(Cont.of)(xmr => ([a, x]) => Cont.chain(_ => xmr(x))(util.log(a)));

module.exports = {
  yields,
  fold,
  unfoldr,
  unfoldrC,
  forOf,
  toArray,
  toListT,
  each,
  filter,
  takeWhile,
  readChunks,
  readBytes,
  print
};
