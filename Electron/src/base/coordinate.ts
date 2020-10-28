
export class Coordinate {
    coord: number;
    relative: boolean;

    static parse(coord: string): Coordinate {
        coord = coord.trim();
        let result: Coordinate = new Coordinate();
        // ~15 signifies relative position, just like Minecraft
        if (coord[0] == '~') {
            result.relative = true;
            // cut off ~
            coord = coord.substr(1);
        }
        else {
            result.relative = false;
        }
        result.coord = Number(coord);
        return result;
    }
}

