const { Functor, implement, ClassDef, Arr } = require("@masaeedu/fp");

const Of = (() => {
  const map = f => ([a, b]) => [a, f(b)];

  const first = ([a, _]) => a;
  const second = ([_, b]) => b;

  return {
    map,
    first,
    second
  };
})();

const classes = Arr.fold(ClassDef)([Functor]);

module.exports = implement(classes)(Of);
