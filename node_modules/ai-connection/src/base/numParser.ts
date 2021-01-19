import { IParser, IParsable } from './iParser';

export class Num implements IParsable {
    toParse: string;

    constructor(input: string) {
        this.toParse = input;
    }

    requiredParser(): string {
        return NumParser.name;
    }
}

export class NumParser implements IParser {
    parse(obj: any): any {
        let num: Num = obj;
        if (num.toParse == null) {
            return num.toParse;
        }
        let result: number = Number(num.toParse);
        if (Number.isNaN(result)) {
            return null;
        }
        return result;
    }
}