import * as fs from 'fs';

export class Loc {
    loadedLanguage: string;
    languageMap: any = {};
    readonly fallbackLanguage: string = "en-US";

    constructor(language: string) {
        // Fill map with fallback language, then overwrite values with new language, anything missing in the new language will default to fallback
        this.loadedLanguage = this.fallbackLanguage;
        this.loadLanguage(this.fallbackLanguage, this.languageMap);
        // Don't load twice if fallback matches chosen language
        if (this.fallbackLanguage !== language && this.loadLanguage(language, this.languageMap)) {
            this.loadedLanguage = language;
        }
    }

    loadLanguage(language: string, map: any): boolean {
        // To be consistent with Minecraft we use underscores, but actual language codes have dashes, so convert to underscore so we can find the file
        let filePath = `${__dirname}/../../resources/loc/${language.replace('-', '_')}.lang`;
        try {
            // Sync so users can immediately start querying strings
            let locFile: string = fs.readFileSync(filePath, 'utf8');
            let pairs: string[] = locFile.split('\n');
            for (let key in pairs) {
                let keyValue: string[] = pairs[key].split('=');
                map[keyValue[0].trim()] = keyValue[1].trim();
            }
        }
        catch (e) {
            return false;
        }
        return true;
    }

    get(key: string): string {
        let result = this.languageMap[key];
        // If there's nothing in the map that means it's not in either the selected or fallback language, so return key so user at least sees something
        return result == null ? key : result;
    }
}