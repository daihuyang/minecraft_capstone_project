// Since all keys in the input object are null checked to validate that all inputs are provided, we need to specifically call out optional parameters using this parser
import { IParser, IParsable } from './iParser';

export class Optional implements IParsable {
    value: any;

    constructor(val: any) {
        this.value = val;
    }

    requiredParser(): string {
        return OptionalParser.name;
    }
}

export class OptionalParser implements IParser {
    parse(obj: any): any {
        let opt: Optional = obj;
        return opt.value;
    }
}