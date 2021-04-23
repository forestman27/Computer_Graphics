export class Matrix4 {
    constructor()
    {
        this.elements = new Float32Array(16);
        //0 4 8 12
        //1 5 9 13
        //2 6 10 14
        //3 7 11 15
    }

    static identity()
    {
        let m = new Matrix4();
        m.elements.fill(0);
        m.elements[0] = 1;
        m.elements[5] = 1;
        m.elements[10] = 1;
        m.elements[15] = 1;
        return m;
    }

    static scale(fx, fy, fz)
    {
        let m = new Matrix4();
        m.elements.fill(0);
        m.elements[0] = fx;
        m.elements[5] = fy;
        m.elements[10] = fz;
        m.elements[15] = 1;
        return m;
    }

    static translate(ox, oy, oz)
    {
        let m = new Matrix4();
        m.elements.fill(0);
        m.elements[0] = 1;
        m.elements[5] = 1;
        m.elements[10] = 1;
        m.elements[15] = 1;
        m.elements[12] = ox;
        m.elements[13] = oy;
        m.elements[14] = oz;
        return m; 
    }


    static rotateZ(degrees)
    {
        let radians = degrees * (Math.PI/180);
        let m = new Matrix4();
        m.elements.fill(0);
        m.elements[0] = Math.cos(radians);
        m.elements[1] = Math.sin(radians);
        m.elements[4] = -1 * Math.sin(radians);
        m.elements[5] = Math.cos(radians);
        m.elements[10] = 1;
        m.elements[15] = 1;
        return m; 
    }

    static rotateX(degrees)
    {
        let radians = degrees * (Math.PI/180);
        let m = new Matrix4();
        m.elements.fill(0);
        m.elements[5] = Math.cos(radians);
        m.elements[6] = Math.sin(radians);
        m.elements[9] = -1 * Math.sin(radians);
        m.elements[10] = Math.cos(radians);
        m.elements[0] = 1;
        m.elements[15] = 1;
        return m; 
    }
    

    static rotateY(degrees)
    {
        let radians = degrees * (Math.PI/180);
        let m = new Matrix4();
        m.elements.fill(0);
        m.elements[0] = Math.cos(radians);
        m.elements[2] = Math.sin(radians);
        m.elements[8] = -1 * Math.sin(radians);
        m.elements[10] = Math.cos(radians);
        m.elements[5] = 1;
        m.elements[15] = 1;
        return m; 
    }

    static ortho(left, right, bottom, top, near, far)
    {
        let m = new Matrix4();
        m.elements.fill(0);
        m.elements[0] = 2 / (right-left);
        m.elements[5] = 2 / (top-bottom);
        m.elements[10] = 2 / (near-far);
        m.elements[15] = 1;
        m.elements[12] = -1 * ((right + left) / (right - left));
        m.elements[13] = -1 * ((top + bottom) / (top - bottom));
        m.elements[14] = ((near + far) / (near - far));
        return m;
    }

    multiplyVector4(vector) 
    {
        //0 4 8 12
        //1 5 9 13
        //2 6 10 14
        //3 7 11 15
        let result = [];
        let currDotProduct = 0;
        let vecIndexCounter = 0;
        for(let r = 0; r < 4; r++)
        {
            for(let c = 0; c < 4; c++)
            {
                let matrixVal = this.elements[r + (4*c)];
                currDotProduct += matrixVal * vector[vecIndexCounter];
                vecIndexCounter++;
                if(vecIndexCounter == 4)
                {
                    vecIndexCounter = 0;
                    result.push(currDotProduct);
                    currDotProduct = 0;
                } 
            }
        }
        
        return result;
    }

    multiplyMatrix4(otherMatrix)
    {
        let result = new Matrix4();
        for(let r = 0; r < 4; r++)
        {
            for(let c = 0; c < 4; c++)
            {
                for(let i = 0; i < 4; i++)
                {
                    result.elements[r + (4*c)] += this.elements[r + (4*i)] * otherMatrix.elements[i + (4*c)];
                }
            }
        }
        return result;
    }

    static rotateAroundAxis(axis, degrees) {
        let matrix = new Matrix4();

        let radians = degrees * (Math.PI / 180);

        let s = Math.sin(radians);
        let c = Math.cos(radians);
        let v = axis.normalize();

        matrix.elements[0] = (1 - c) * v.x * v.x + c;
        matrix.elements[1] = (1 - c) * v.y * v.x + s * v.z;
        matrix.elements[2] = (1 - c) * v.z * v.x - s * v.y;

        matrix.elements[4] = (1 - c) * v.x * v.y - s * v.z;
        matrix.elements[5] = (1 - c) * v.y * v.y + c;
        matrix.elements[6] = (1 - c) * v.z * v.y + s * v.x;

        matrix.elements[8] = (1 - c) * v.x * v.z + s * v.y;
        matrix.elements[9] = (1 - c) * v.y * v.z - s * v.x;
        matrix.elements[10] = (1 - c) * v.z * v.z + c;

        matrix.elements[15] = 1;

        return matrix;
    }

    toBuffer() 
    {
        return this.elements;
    }
}