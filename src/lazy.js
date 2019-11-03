const {
  Functor,
  Apply,
  Chain,
  implement,
  ClassDef,
  Arr
} = require("@masaeedu/fp");

const Lazy = (() => {
  const defer = thunk => {
    let v = null;
    return () => {
      if (thunk === undefined) return v;
      v = thunk();
      thunk = undefined;
      return v;
    };
  };

  const force = l => l();

  // Functor
  const map = f => l => defer(() => f(force(l)));

  // Applicative
  const of = a => defer(() => a);
  const ap = f => x => defer(() => force(f)(force(x)));

  // Monad
  const chain = f => l => defer(() => force(f(force(l))));

  return {
    defer,
    force,
    map,
    of,
    ap,
    chain
  };
})();

const classes = Arr.fold(ClassDef)([Functor, Apply, Chain]);

module.exports = implement(classes)(Lazy);
