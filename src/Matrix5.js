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

    static rotateX(degrees) {
        let matrix = this.identity();
        let radians = degrees * (Math.PI / 180);
        matrix.elements[0] = Math.cos(radians);
        matrix.elements[2] = Math.sin(radians);
        matrix.elements[8] = -Math.sin(radians);
        matrix.elements[10] = Math.cos(radians);
        return matrix;
    }
    static rotateY(degrees) {
        let matrix = this.identity();
        let radians = degrees * (Math.PI / 180);
        matrix.elements[5] = Math.cos(radians);
        matrix.elements[6] = Math.sin(radians);
        matrix.elements[9] = -Math.sin(radians);
        matrix.elements[10] = Math.cos(radians);
        return matrix;
    }
    static rotateZ(degrees) {
        let matrix = this.identity();
        let radians = degrees * (Math.PI / 180);
        matrix.elements[0] = Math.cos(radians);
        matrix.elements[1] = Math.sin(radians);
        matrix.elements[4] = -Math.sin(radians);
        matrix.elements[5] = Math.cos(radians);
        return matrix;
    }
    multiplyVector4(vector4) {
        let output = new Float32Array(4);
        for (let i = 0; i < 4; i++) {
            let sum = 0;
            for (let j = 0; j < 4; j++) {
                sum += this.elements[i * 4 + j] * vector4[j];
            }
            output[i] = sum;
        }
        return output;
    }
    multiplyMatrix4(matrix) {
        let output = new Matrix4();
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                let sum = 0;
                for (let a = 0; a < 4; a++) {
                    sum += this.elements[i + a * 4] * matrix.elements[j * 4 + a];
                }
                output.elements[i + j * 4] = sum;
            }
        }
        return output;
    }
    multiplyMatrix42(that) {
        let matrix = new Matrix4();
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                matrix.elements[i * 4 + j] = this.elements[j] * that.elements[i * 4] +
                    this.elements[4 + j] * that.elements[1 + i * 4] +
                    this.elements[8 + j] * that.elements[2 + i * 4] +
                    this.elements[12 + j] * that.elements[3 + i * 4];
            }
        }
        return matrix;
    }
    toBuffer() {
        return this.elements;
    }
    static ortho(left, right, bottom, top, near, far) {
        let matrix = new Matrix4();
        matrix.elements[0] = 2 / (right - left);
        matrix.elements[5] = 2 / (top - bottom);
        matrix.elements[10] = 2 / (near - far);
        matrix.elements[12] = -(right + left) / (right - left);
        matrix.elements[13] = -(top + bottom) / (top - bottom);
        matrix.elements[14] = (near + far) / (near - far);
        matrix.elements[15] = 1;
        return matrix;
    }
}
//}
//}//}//}