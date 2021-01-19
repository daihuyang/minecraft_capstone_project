import { IParser, IParsable } from './iParser';
import { Coordinate } from './coordinate';

export class BlockPos implements IParsable {
    toParse: string;

    constructor(input: string) {
        this.toParse = input;
    }

    requiredParser(): string {
        return BlockPosParser.name;
    }
}

export class BlockPosParser implements IParser {
    parse(obj: any): any {
        let pos: BlockPos = obj;
        if (pos.toParse == null) {
            return pos.toParse;
        }

        let xyz: string[] = pos.toParse.split(' ');
        if (xyz.length != 3) {
            return null;
        }

        for (let i = 0; i < 3; ++i) { 
            let coord: Coordinate = Coordinate.parse(xyz[i]);
            if (coord == null) {
                return null;
            }
        }
        return pos.toParse;
    }
}