const fs = require("fs");
const { mdo } = require("@masaeedu/do");
const {
  Cont,
  Unit: { unit }
} = require("@masaeedu/fp");
const FreeT = require("./freet");

// :: Monad m -> m Bool -> (() -> m a) -> (() -> m a) -> m a
const ifElseM = M => mbool => i => e =>
  M.chain(b => {
    if (b) {
      return i();
    } else {
      return e();
    }
  })(mbool);

// :: Applicative f -> Bool -> (() -> f ()) -> f ()
const when = F => b => act => (b ? act() : F.of(unit));

// Node file IO with Cont

// :: FilePath -> Cont! NodeRStream
const mkReadStream = path => cb => {
  const s = fs.createReadStream(path);
  return cb(s);
};

// :: NodeRStream -> Cont! ()
const waitForReadableCont = rs => cb => {
  return rs.once("readable", cb);
};

// :: Int -> NodeRStream -> Cont! Buffer
const read = chunkSize => rs => cb => cb(rs.read());

// Misc

const log = x => cb => {
  console.log(x);
  return cb();
};

const isNull = x => x === null || x === undefined;

const fromJust = ({ label, values }) => {
  if (label === "Nothing") {
    throw Error("fromJust: Nothing");
  } else {
    return values[0];
  }
};

// :: (Monad (t Cont!), MonadTrans t) -> t Cont! ()
const immediately = M => M.lift(Cont)(setImmediate);

// ::(Monad (t Cont!), MonadTrans t) -> NodeRStream -> t Cont! Byte
const readByte = M => rs =>
  M.lift(Cont)(Cont["*>"](waitForReadableCont(rs))(read(1)(rs)));

// :: (Monad (t Cont!), MonadTrans t) -> NodeRStream -> t Cont! ()
const waitForReadable = M => rs => M.lift(Cont)(waitForReadableCont(rs));

// :: (Monad (t Cont!), MonadTrans t) -> t Cont! a -> t Cont! a
const foreverC = M => act => {
  const rec = mdo(M)(() => [() => immediately(M), () => act, () => rec]);
  return rec;
};

// :: (Monad (t Cont!), MonadTrans t) -> (a -> Bool) -> t Cont! a -> t Cont! a
const iterateUntilC = M => pred => act => {
  const rec = mdo(M)(({ res }) => [
    () => immediately(M),
    [res, () => act],
    () => (pred(res) ? M.of(res) : rec)
  ]);
  return rec;
};

module.exports = {
  ifElseM,
  isNull,
  when,
  mkReadStream,
  read,
  waitForReadableCont,
  log,
  fromJust,
  immediately,
  readByte,
  waitForReadable,
  foreverC,
  iterateUntilC
};
