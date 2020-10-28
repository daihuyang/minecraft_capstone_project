export class ErrorViewInfo {
    constructor(message: string, showBack: boolean, showLink: boolean) {
        this.message = message;
        this.showBack = showBack;
        this.showLink = showLink;
    }

    message: string;
    showBack: boolean;
    showLink: boolean;
}