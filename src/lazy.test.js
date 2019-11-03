const test = require("ava");
const Lazy = require("./lazy");

test("functor", t => {
  t.is(42, Lazy.force(Lazy.map(a => a + 21)(Lazy.of(21))));
});

test("applicative", t => {
  t.is(42, Lazy.force(Lazy.lift2(a => b => a + b)(Lazy.of(21))(Lazy.of(21))));
});

test("monad", t => {
  t.is(42, Lazy.force(Lazy.chain(x => Lazy.of(x + 21))(Lazy.of(21))));
});
