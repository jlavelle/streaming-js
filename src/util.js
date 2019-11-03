const fs = require("fs");
const { mdo } = require("@masaeedu/do");
const tmp = require("tmp");
const {
  Cont,
  Unit: { unit },
  Either
} = require("@masaeedu/fp");

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
    rs.removeAllListeners();
    return cb();
  });
};

// :: NodeRStream -> Cont! ()
const waitForEndCont = rs => cb => {
  return rs.once("end", () => {
    rs.removeAllListeners();
    return cb();
  });
};

// :: Cont! a -> Cont! b -> Cont! (Either a b)
const race = conta => contb => cb => {
  let res = undefined;
  conta(a => {
    if (res === undefined) {
      res = Either.Left(a);
      return cb(res);
    }
  });
  contb(b => {
    if (res === undefined) {
      res = Either.Right(b);
      return cb(res);
    }
  });
};

// :: NodeRSTream -> Cont! (Either () ())
const endOrReadableCont = rs =>
  race(waitForEndCont(rs))(waitForReadableCont(rs));

// :: Int -> NodeRStream -> Cont! Buffer
const read = chunkSize => rs => cb => {
  const chunk = rs.read(chunkSize);
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
const readChunk = M => chunkSize => rs => M.lift(Cont)(read(chunkSize)(rs));

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

// :: Cont! (FilePath, Descriptor)
const withTempFile = cb => {
  return tmp.file((error, path, fd, cleanup) => {
    if (error) throw error;
    cb([path, fd]);
    cleanup();
  });
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
  readChunk,
  waitForReadable,
  waitForEnd,
  endOrReadable,
  foreverC,
  iterateUntilC,
  withTempFile
};
