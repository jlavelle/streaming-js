// A lazy ListT transformer

const {
  Arr,
  ClassDef,
  Functor,
  Apply,
  Chain,
  implement,
  Maybe
} = require("@masaeedu/fp");
const Lazy = require("./lazy");

// :: Monad m -> ListTDict m
const ListT = M => {
  // type ListT m a = Lazy (m (Maybe (a, ListT m a)))

  const cons = a => as => Lazy.of(M.of(Maybe.Just([a, as])));

  // :: ListT m a -> m (Maybe a)
  const head = l => M.map(Maybe.map(([a, _]) => a))(Lazy.force(l));

  // :: ListT m a -> ListT m a
  const tail = l => M.map(Maybe.map(([_, b]) => b))(Lazy.force(l));

  // Functor
  const map = f => listt =>
    Lazy.map(ma =>
      M.map(
        Maybe.match({
          Nothing: Maybe.Nothing,
          Just: ([a, lt]) => Maybe.Just([f(a), map(f)(lt)])
        })(ma)
      )
    )(listt);

  // Monoid

  const append = lt1 => lt2 =>
    Lazy.defer(() => {
      const t1 = Lazy.force(lt1);
      return M.chain(x =>
        Maybe.match({
          Nothing: () => Lazy.force(lt2),
          Just: ([a, lt]) => () => M.of(Maybe.Just([a, append(lt)(lt2)]))
        })(x)()
      )(t1);
    });

  const empty = Lazy.of(M.of(Maybe.Nothing));

  const isEmpty = l =>
    M.map(
      Maybe.match({
        Nothing: true,
        Just: _ => false
      })
    )(Lazy.force(l));

  // Monad
  const of = a => Lazy.of(M.of(Maybe.of([a, Lazy.of(M.of(Maybe.Nothing))])));

  const chain = almb => lma =>
    Lazy.defer(() => {
      return M.chain(x =>
        Maybe.match({
          Nothing: M.of(Maybe.Nothing),
          Just: ([a, lt]) => Lazy.force(append(almb(a))(chain(almb)(lt)))
        })(x)
      )(Lazy.force(lma));
    });

  // Misc

  // :: (b -> m (Maybe (a, b))) -> b -> ListT m a
  const unfoldM = f => {
    const rec = s =>
      Lazy.defer(() =>
        M.chain(
          Maybe.match({
            Nothing: M.of(Maybe.Nothing),
            Just: ([a, b]) => M.of(Maybe.Just([a, rec(b)]))
          })
        )(f(s))
      );
    return rec;
  };

  //::  (r -> a -> m r) -> r -> ListT m a -> m r
  const foldlM = f => z => l =>
    M.chain(
      Maybe.match({
        Nothing: M.of(z),
        Just: ([a, lt]) => M.chain(nz => foldlM(f)(nz)(lt))(f(z)(a))
      })
    )(Lazy.force(l));

  //
  const fromFoldable = F => F.foldr(cons)(empty);

  const toArray = foldlM(as => a => M.of([...as, a]))([]);

  const take = n => listt => {
    if (n <= 0) return empty;
    return Lazy.map(
      M.chain(
        Maybe.match({
          Nothing: listt,
          Just: ([a, lt]) => Lazy.force(cons(a)(take(n - 1)(lt)))
        })
      )
    )(listt);
  };

  return {
    head,
    tail,
    cons,
    map,
    of,
    append,
    empty,
    isEmpty,
    chain,
    foldlM,
    unfoldM,
    fromFoldable,
    toArray,
    take
  };
};

const classes = Arr.fold(ClassDef)([Functor, Apply, Chain]);

module.exports = F => implement(classes)(ListT(F));
