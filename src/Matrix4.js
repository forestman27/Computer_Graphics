export class Matrix4 {
    
    constructor() {
        this.elements = new Float32Array(16);
        this.toBuffer = () => {return this.elements}
    }

    // 0 4 8  12
    // 1 5 9  13
    // 2 6 10 14
    // 3 7 11 15

    static identity() {
        var m = new Matrix4();
        m.elements[0] = 1;
        m.elements[5] = 1;
        m.elements[10] = 1;
        m.elements[15] = 1;
        return m;
    }

    static scale([x, y, z]) {
        var m = new Matrix4();

        m.elements[0] = x;
        m.elements[5] = y;
        m.elements[10] = z;
        m.elements[15] = 1;
        return m;
    }
    static translate([x, y, z]) {
        var m = new Matrix4();
        // Setting all the non-zero numbers.
        m.elements[0] = 1;
        m.elements[5] = 1;
        m.elements[10] = 1;
        // Right hand side.
        m.elements[12] = x;
        m.elements[13] = y;
        m.elements[14] = z;
        m.elements[15] = 1;
        return m;
    }

    static rotateZ(degrees) {
        var m = new Matrix4();
        m.elements[0] = Math.cos(degrees);
        m.elements[1] = Math.sin(degrees);
        m.elements[4] = Math.sin(degrees) * -1;
        m.elements[5] = Math.cos(degrees);
        m.elements[10] = 1;
        m.elements[15] = 1;
        return m;
    }
}
//}
//}//}//}