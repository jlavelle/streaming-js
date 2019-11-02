const fs = require("fs");
const Stream = require("../src/streaming");
const { Cont } = require("@masaeedu/fp");

const rs = fs.createReadStream("./package.json");

const bs = Stream.toList(Cont)(Stream.readBytes(rs));

const main = () =>
  bs(x => {
    console.log(x);
  });

main();
