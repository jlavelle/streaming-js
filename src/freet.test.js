const test = require("ava");
const {
  Fnctr: { Identity },
  Cont
} = require("@masaeedu/fp");
const FreeT = require("./freet");

// :: FreeT Identity Identity a -> a
const interpret = FreeT.iterT(Identity)(Identity)(x => x);

test("functor", t => {
  t.is(42, interpret(FreeT.map(x => x + 21)(FreeT.of(21))));
});

test("applicative", t => {
  t.is(42, interpret(FreeT.lift2(a => b => a + b)(FreeT.of(21))(FreeT.of(21))));
});

test("monad", t => {
  t.is(42, interpret(FreeT.chain(x => FreeT.of(x + 21))(FreeT.of(21))));
});

test("liftF", t => {
  const T = {
    map: f => ({ label, value }) => ({ label, value: f(value) })
  };
  const ft = FreeT.liftF(T)({ label: "Test", value: 10 });
  const intp = FreeT.iterT(T)(Identity)(x => x);
  t.deepEqual({ label: "Test", value: 10 }, intp(ft));
});

test("lift", t => {
  const foo = FreeT.lift(Cont)(Cont.of(42));
  const intp = FreeT.iterT(Identity)(Cont)(x => x);
  t.is(42, intp(foo)(x => x));
});
