const fs = require("fs");
const Stream = require("../src/streaming");

const rs = fs.createReadStream("/dev/urandom");

const bs = Stream.print(Stream.readBytes(rs));

const main = () => bs(x => {});

main();
