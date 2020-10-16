const test = require("ava")

test("foo", t => t.pass())

// const FreeT = require("./freet");
// const fs = require("fs");
// const test = require("ava");
// const util = require("./util");
// const ListT = require("./listt");
// const Lazy = require("./lazy");
// const {
//   Arr,
//   Cont,
//   Either,
//   Unit: { unit },
//   Fnctr: { Identity }
// } = require("@masaeedu/fp");

// test("yield/toArray", t => {
//   const a = Arr.sequence(FreeT)([
//     Stream.yields(1),
//     Stream.yields(2),
//     Stream.yields(3)
//   ]);
//   t.deepEqual([1, 2, 3], Stream.toArray(Identity)(a));
// });

// test("each/toArray", t => {
//   const a = Stream.each(Arr)([1, 2, 3]);
//   t.deepEqual([1, 2, 3], Stream.toArray(Identity)(a));
// });

// test("each/toListT", t => {
//   const a = Stream.each(Arr)([1, 2, 3]);
//   t.deepEqual(
//     Either.Right([1, 2, 3]),
//     ListT(Either).toArray(Stream.toListT(Either)(a))
//   );
// });

// test("filter", t => {
//   const even = a => a % 2 === 0;
//   const a = Stream.filter(even)(Stream.each(Arr)([1, 2, 3, 4, 5, 6]));
//   t.deepEqual([2, 4, 6], Stream.toArray(Identity)(a));
// });

// test("takeWhile", t => {
//   t.deepEqual(
//     [1, 2, 3],
//     Stream.toArray(Identity)(
//       Stream.takeWhile(x => x < 4)(Stream.each(Arr)([1, 2, 3, 4, 5, 6]))
//     )
//   );
// });

// const upToFour = s => (s <= 4 ? Either.Right([s, s + 1]) : Either.Left(unit));
// const infinite = s => Either.Right([s, s + 1]);

// test("unfoldr", t => {
//   t.deepEqual(
//     [1, 2, 3, 4],
//     Stream.toArray(Identity)(Stream.unfoldr(Identity)(upToFour)(1))
//   );
//   const size = 100;
//   const x = Stream.unfoldr(Identity)(infinite)(0);
//   const xs = Stream.takeWhile(a => a < size)(x);
//   t.deepEqual(Arr.range(size), Stream.toArray(Identity)(xs));
// });

// test.cb("unfoldrC", t => {
//   const x1 = Stream.unfoldrC(x => Cont.of(upToFour(x)))(1);
//   Stream.toArray(Cont)(x1)(xs => {
//     t.deepEqual([1, 2, 3, 4], xs);
//     t.end();
//   });
//   const size = 100000;
//   const x2 = Stream.takeWhile(a => a < size)(
//     Stream.unfoldrC(x => Cont.of(infinite(x)))(0)
//   );
//   Stream.toArray(Cont)(x2)(xs => {
//     t.deepEqual(Arr.range(size), xs);
//     t.end();
//   });
// });

// test("forOf", t => {
//   const dup = Stream.forOf(Stream.each(Arr)([1, 2, 3]))(a =>
//     FreeT["*>"](Stream.yields(a))(Stream.yields(a))
//   );
//   t.deepEqual([1, 1, 2, 2, 3, 3], Stream.toArray(Identity)(dup));
// });

// test.cb("readChunks", t => {
//   util.withTempFile(([path, _]) => {
//     const ts = "this is a test file";
//     fs.writeFileSync(path, ts);
//     const rs = fs.createReadStream(path);
//     Stream.toArray(Cont)(Stream.readChunks(ts.length)(rs))(x => {
//       t.snapshot(x.toString("utf8"));
//       t.end();
//     });
//   });
// });

// test.cb("readBytes", t => {
//   util.withTempFile(([path, _]) => {
//     fs.writeFileSync(path, "this is a test file");
//     const rs = fs.createReadStream(path);
//     Stream.toArray(Cont)(Stream.readBytes(rs))(x => {
//       t.snapshot(Arr.map(b => b.toString("utf8"))(x));
//       t.end();
//     });
//   });
// });
