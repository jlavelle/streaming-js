const test = require("ava");
const {
  Fnctr: { Identity },
  Cont
} = require("@masaeedu/fp");
const FreeT = require("./freet");

const Free = FreeT(Identity)(Identity)

// :: FreeT Identity Identity a -> a
const interpret = Free.iterT(x => x);

test("functor", t => {
  t.is(42, interpret(Free.map(x => x + 21)(Free.of(21))));
});

test("applicative", t => {
  t.is(42, interpret(Free.lift2(a => b => a + b)(Free.of(21))(Free.of(21))));
});

test("monad", t => {
  t.is(42, interpret(Free.chain(x => Free.of(x + 21))(Free.of(21))));
});

test("liftF", t => {
  const T = {
    map: f => ({ label, value }) => ({ label, value: f(value) })
  };
  const ft = FreeT(T)(Identity).liftF({ label: "Test", value: 10 });
  const intp = FreeT(T)(Identity).iterT(x => x);
  t.deepEqual({ label: "Test", value: 10 }, intp(ft));
});

test("lift", t => {
  const foo = FreeT(Identity)(Cont).lift(Cont.of(42));
  const intp = FreeT(Identity)(Cont).iterT(x => x);
  t.is(42, intp(foo)(x => x));
});
