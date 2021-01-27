"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const coordinate_1 = require("./coordinate");
class BlockPos {
    constructor(input) {
        this.toParse = input;
    }
    requiredParser() {
        return BlockPosParser.name;
    }
}
exports.BlockPos = BlockPos;
class BlockPosParser {
    parse(obj) {
        let pos = obj;
        if (pos.toParse == null) {
            return pos.toParse;
        }
        let xyz = pos.toParse.split(' ');
        if (xyz.length != 3) {
            return null;
        }
        for (let i = 0; i < 3; ++i) {
            let coord = coordinate_1.Coordinate.parse(xyz[i]);
            if (coord == null) {
                return null;
            }
        }
        return pos.toParse;
    }
}
exports.BlockPosParser = BlockPosParser;
//# sourceMappingURL=blockPosParser.js.map