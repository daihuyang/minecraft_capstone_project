import { IParser, IParsable } from './iParser';
import { Coordinate } from './coordinate';
import { Optional } from './optionalParser';

export class Rotation implements IParsable {
    rotation: number;
    relative: boolean;
    toParse: string;

    constructor(input: string) {
        this.toParse = input;
    }

    requiredParser(): string {
        return RotationParser.name;
    }
}

export class RotationParser implements IParser {
    parserName(): string {
        return RotationParser.name;
    }

    parse(obj: any): any {
        let rot: Rotation = obj;
        if (rot.toParse == null) {
            return rot.toParse;
        }

        let coord: Coordinate = Coordinate.parse(rot.toParse);
        return coord == null ? coord : rot.toParse;
    }
}