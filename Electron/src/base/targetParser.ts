import { IParser, IParsable } from './iParser';

class Rule {
    inverted: boolean;
    name: string;
    value: string;

    constructor(ruleName: string, ruleValue: string, ruleInverted: boolean) {
        this.inverted = ruleInverted;
        this.name = ruleName;
        this.value = ruleValue;
    }
}

export class Target implements IParsable {
    rules: Rule[];
    selector: string = null;
    toParse: string = null;

    // Don't parse right away, we parse after putting it in the body to simplify parameter extraction on rest calls
    constructor(targetInput: string) {
        this.toParse = targetInput;
    }

    requiredParser(): string {
        return TargetParser.name;
    }
}

export class TargetParser implements IParser {
    // If we can't parse a selector or rules, we assume the user specified a player name, same as Minecraft
    static defaultSelector: string = 'nearestPlayer';
    static noSelector: string = 'none';
    static defaultRuleName: string = 'name';

    parse(obj: any): any {
        let target: Target = obj;
        let targetString = target.toParse;
        if (target.toParse == null) {
            return target.toParse;
        }
        target.toParse = target.toParse.trim();

        this.parseSelector(target);
        if (target.selector == null) {
            return null;
        }
        // If no selector was specified it must be referring to a character by name
        if (target.selector == TargetParser.noSelector) {
            return targetString;
        }

        // All that's left is an optional list of rules in brackets
        if (target.toParse.length == 0) {
            // Nothing left, user chose not to specify rules
            return targetString;
        }

        this.parseRules(target);
        // If we failed to parse rules
        if (target.rules == null) {
            return null;
        }

        // Rules successfully validated, return underlying string
        return targetString;
    }

    parseRules(target: Target) {
        let rules: string = target.toParse;
        target.rules = null;
        // Make sure rule list is in brackets
        if (rules.length < 2 || rules[0] != '[' || rules[rules.length - 1] != ']') {
            return;
        }
        // Then take off brackes
        rules = rules.substring(1, rules.length - 1);

        target.rules = [];
        // Get array of individual rules, which are key=value pairs
        let ruleList: string[] = rules.split(',');
        for (let i = 0; i < ruleList.length; ++i) {
            let rule: string = ruleList[i];
            let keyValue: string[] = rule.split('=');
            // Anything other than key=value is invalid
            if (keyValue.length != 2 || keyValue[0].length == 0 || keyValue[1].length == 0) {
                target.rules = null;
                return;
            }

            let key: string = keyValue[0];
            let value: string = keyValue[1];
            // =! is allowed to invert, so first character would be there in split
            let inverted: boolean = value[0] == '!';
            // Once we know if it's inverted, take off the !
            if (inverted) {
                value = value.substr(1);
            }

            target.rules.push(new Rule(key, value, inverted));
        }
    }

    parseSelector(target: Target) {
        let selector = target.toParse;
        target.selector = null;
        // This isn't long enough to be anything valid
        if (selector.length < 2) {
            return;
        }
        // If the user didn't use @ they must be specifying a character name
        if (selector[0] != '@') {
            target.selector = TargetParser.noSelector;
            return;
        }
        let typeChar = selector[1].toLowerCase();
        // Slice off '@x' so we continue parsing past it
        target.toParse = target.toParse.slice(2);

        switch (typeChar) {
            case 'p': target.selector = 'nearestPlayer'; break;
            case 'r': target.selector = 'randomPlayer'; break;
            case 'a': target.selector = 'allPlayers'; break;
            case 'e': target.selector = 'allEntities'; break;
        }
    }
}