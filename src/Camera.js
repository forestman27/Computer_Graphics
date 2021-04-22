import { Vector3 } from "./Vector3";
import { Matrix4 } from './Matrix4';

export class Camera{
    constructor(from, to, worldUp){
        this.from = from;
        this.forward = new Vector3(from.x - to.x, from.y - to.y, from.z - to.z).normalize();
        this.worldUp = worldUp;
        this.orient();
    }

    orient()
    {
        this.right = this.forward.cross(this.worldUp).normalize();
        this.up = this.right.cross(this.forward);
        
        let rotation = Matrix4.create([
            this.right.x,       this.right.y,       this.right.z,       0,
            this.up.x,          this.up.y,          this.up.z,          0,
            -this.forward.x,    -this.forward.y,    -this.forward.z,    0,
            0,                  0,                  0,                  1
        ])
        this.matrix = rotation.multiplyMatrix4(Matrix4.translate(-this.from.x, -this.from.y, -this.from.z))
    }

    setFromTo(from, to)
    {
        this.from = from;
        this.forward = new Vector3(from.x - to.x, from.y - to.y, from.z - to.z).normalize();
        this.orient();
    }
}