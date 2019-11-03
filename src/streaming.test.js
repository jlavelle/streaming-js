const Stream = require("./streaming");
const FreeT = require("./freet");
const fs = require("fs");
const test = require("ava");
const util = require("./util");
const {
  Arr,
  Cont,
  Fnctr: { Identity }
} = require("@masaeedu/fp");

test("yield/toList", t => {
  const a = Arr.sequence(FreeT)([
    Stream.yields(1),
    Stream.yields(2),
    Stream.yields(3)
  ]);
  t.deepEqual([1, 2, 3], Stream.toList(Identity)(a));
});

test("each/toList", t => {
  const a = Stream.each(Arr)([1, 2, 3]);
  t.deepEqual([1, 2, 3], Stream.toList(Identity)(a));
});

test("filter", t => {
  const even = a => a % 2 === 0;
  const a = Stream.filter(even)(Stream.each(Arr)([1, 2, 3, 4, 5, 6]));
  t.deepEqual([2, 4, 6], Stream.toList(Identity)(a));
});

test("takeWhile", t => {
  t.deepEqual(
    [1, 2, 3],
    Stream.toList(Identity)(
      Stream.takeWhile(x => x < 4)(Stream.each(Arr)([1, 2, 3, 4, 5, 6]))
    )
  );
});

test.cb("readBytes", t => {
  util.withTempFile(([path, _]) => {
    fs.writeFileSync(path, "this is a test file");
    const rs = fs.createReadStream(path);
    Stream.toList(Cont)(Stream.readBytes(rs))(x => {
      t.snapshot(x.toString("utf8"));
      t.end();
    });
  });
});
