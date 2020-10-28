export class Color {
    r: number;
    g: number;
    b: number;

    constructor(red: number, green: number, blue: number) {
        this.r = red;
        this.g = green;
        this.b = blue;
    }

    // Can't be a member function because ipc seems to strip off functions
    static toStyle(c: Color): string {
        return `rgb(${c.r},${c.g},${c.b})`;
    }

    static equals(l: Color, r: Color): boolean {
        return l.r === r.r && l.g === r.g && l.b === r.b;
    }
}

export class EditorButton {
    constructor(name: string, link: string, color: Color, active: boolean) {
        this.name = name;
        this.link = link;
        this.color = color;
        this.active = active;
    }

    static readonly maxNameLength: number = 12;

    name: string;
    link: string;
    color: Color;
    active: boolean;
}