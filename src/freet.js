// A Church-encoded free monad transformer,
// based on https://hackage.haskell.org/package/free-5.1.2/docs/Control-Monad-Trans-Free-Church

const {
  Functor,
  Apply,
  Chain,
  implement,
  ClassDef,
  Arr
} = require("@masaeedu/fp");

const FreeT = (() => {
  // type FreeT f m a = forall r. (a -> m r) -> (forall x. (x -> m r) -> f x -> m r) -> m r

  // Functor
  const map = f => freet => pure => bind => freet(a => pure(f(a)))(bind);

  // Applicative
  const of = a => pure => _ => pure(a);

  const ap = freetab => freeta => pure => bind =>
    freetab(fn => freeta(a => pure(fn(a)))(bind))(bind);

  // Monad
  const chain = afreetb => freeta => pure => bind =>
    freeta(a => afreetb(a)(pure)(bind))(bind);

  // MonadTrans

  const lift = M => m => pure => _ => M.chain(pure)(m);

  // MonadFree

  // :: f (FreeT f m a) -> FreeT f m a
  const wrap = f => pure => bind => bind(freet => freet(pure)(bind))(f);

  // :: Functor f -> f a -> FreeT f m a
  const liftF = F => f => wrap(F.map(of)(f));

  // Interpretation

  // Functor f -> Monad m -> (f (m a) -> m a) -> FreeT f m a -> m a
  const iterT = F => M => phi => freet =>
    freet(M.of)(xmr => fx => phi(F.map(xmr)(fx)));

  return {
    map,
    of,
    ap,
    chain,
    wrap,
    liftF,
    iterT,
    lift
  };
})();

const classes = Arr.fold(ClassDef)([Functor, Apply, Chain]);

module.exports = implement(classes)(FreeT);
