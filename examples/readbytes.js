const fs = require("fs");
const Stream = require("../src/streaming");
const { Cont } = require("@masaeedu/fp");

const rs = fs.createReadStream("/dev/urandom");

const bs = Stream.print(Stream.readBytes(rs));

const main = () =>
  bs(x => {
    console.log(x);
  });

main();
