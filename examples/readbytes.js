const fs = require("fs");
const Stream = require("../src/streaming");

const rs = fs.createReadStream("./package.json");

const bs = Stream.print(Stream.readBytes(rs));

const main = () => bs(x => {});

main();
