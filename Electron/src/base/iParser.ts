export interface IParser {
    // Attempts to validate the given object so we can give errors for improper inputs
    // Returns parsed type if successful (string or nested parsable), undefined if underlying type wasn't supplied, and null if the type failed to parse
    parse(obj: any): any;
}

export interface IParsable {
    requiredParser(): string;
}

export function canParse(parser: IParser, parsable: IParsable) {
    return parsable != null && parsable.requiredParser != null && parsable.requiredParser() === parser.constructor.name;
}