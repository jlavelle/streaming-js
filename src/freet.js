// A free monad transformer,
// based on https://hackage.haskell.org/package/free-5.1.2/docs/Control-Monad-Trans-Free.html

const {
  Functor,
  Apply,
  Chain,
  implement,
  ClassDef,
  Arr
} = require("@masaeedu/fp");
const { adt } = require("@masaeedu/adt");

const FreeT = F => M => {
  // type FreeF f a b = Pure a | Free (f b)

  const FreeFAdt = adt({ Pure: ["a"], Free: ["f b"] });
  const { Pure, Free, match } = FreeFAdt;

  const FreeF = (() => {
    const map = f => x => {
      return match({
        Pure: a  => Pure(a),
        Free: fb => Free(F.map(f)(fb))
      })(x)
    }
    return {
      ...FreeFAdt,
      map
    }
  })();

  // type FreeT f m a = m (FreeF f a (FreeT f m a))

  // Functor
  const map = f => M.map(match({
    Pure: a  => Pure(f(a)),
    Free: fb => Free(F.map(map(f))(fb))
  }))

  // Applicative
  const of = a => M.of(Pure(a))

  // Monad
  const chain = amb => M.chain(match({
    Pure: a => amb(a),
    Free: fa => M.of(Free(F.map(chain(amb))(fa)))
  }))

  const wrap = x => M.of(Free(x))

  const liftF = f => wrap(F.map(of)(f))

  const lift = c => M.map(Pure)(c)

  const iterT = phi => M.chain(val => {
    return match({
      Pure: x => M.of(x),
      Free: y => phi(y)
    })(FreeF.map(iterT(phi))(val))
  })

  return {
  //  hoistF,
  //  hoistM,
  //  decompose,
    map,
    of,
    ap,
    chain,
    wrap,
    liftF,
    iterT,
    lift,
    FreeF
  };
};

const classes = Arr.fold(ClassDef)([Functor, Apply, Chain]);

module.exports = F => M => implement(classes)(FreeT(F)(M));
