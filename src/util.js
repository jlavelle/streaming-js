const fs = require("fs");
const { mdo } = require("@masaeedu/do");
const {
  Cont,
  Unit: { unit },
  Either
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
  return rs.once("readable", () => {
    return cb();
  });
};

let counter = 0;

// :: NodeRStream -> Cont! ()
const waitForEndCont = rs => cb => {
  return rs.once("end", () => {
    return cb();
  });
};

// :: Cont! a -> Cont! b -> Cont! (Either a b)
const race = conta => contb => cb => {
  let res = undefined;
  conta(a => {
    if (res === undefined) {
      return cb(Either.Left(a));
    }
  });
  contb(b => {
    // console.log("readable");
    if (res === undefined) {
      return cb(Either.Right(b));
    }
  });
};

// :: NodeRSTream -> Cont! (Either () ())
const endOrReadableCont = rs =>
  race(waitForEndCont(rs))(waitForReadableCont(rs));

// :: Int -> NodeRStream -> Cont! Buffer
const read = chunkSize => rs => cb => {
  const chunk = rs.read();
  //console.log("read chunk: ", chunk);
  return cb(chunk);
};

// Misc

const log = x => cb => {
  console.log(x);
  return cb();
};

const isNull = x => x === null || x === undefined;

// :: (Monad (t Cont!), MonadTrans t) -> t Cont! ()
const immediately = M => M.lift(Cont)(setImmediate);

// ::(Monad (t Cont!), MonadTrans t) -> NodeRStream -> t Cont! Byte
const readByte = M => rs => M.lift(Cont)(read(1)(rs));

// :: (Monad (t Cont!), MonadTrans t) -> NodeRStream -> t Cont! ()
const waitForReadable = M => rs => M.lift(Cont)(waitForReadableCont(rs));

const waitForEnd = M => rs => M.lift(Cont)(waitForEndCont(rs));

const endOrReadable = M => rs => M.lift(Cont)(endOrReadableCont(rs));

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
  immediately,
  readByte,
  waitForReadable,
  endOrReadable,
  foreverC,
  iterateUntilC
};
