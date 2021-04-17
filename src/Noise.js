import { Vector3 } from './Vector3';

export class Noise {
    static perlinNoise(p) {
      const base = new Vector3(
        Math.floor(p.x) & 255,
        Math.floor(p.y) & 255,
        Math.floor(p.z) & 255,
      );
  
      const apex = new Vector3(
        (base.x + 1) % 256,
        (base.y + 1) % 256,
        (base.z + 1) % 256,
      );
  
      const fraction = new Vector3(
        p.x - Math.floor(p.x),
        p.y - Math.floor(p.y),
        p.z - Math.floor(p.z),
      );
  
      const weights = new Vector3(
        this.fade(fraction.x),
        this.fade(fraction.y),
        this.fade(fraction.z),
      );
  
      const pp = this.permutations;
  
      const xyzGradient = pp[pp[pp[base.x] + base.y] + base.z];
      const xYzGradient = pp[pp[pp[base.x] + apex.y] + base.z];
      const xyZGradient = pp[pp[pp[base.x] + base.y] + apex.z];
      const xYZGradient = pp[pp[pp[base.x] + apex.y] + apex.z];
      const XyzGradient = pp[pp[pp[apex.x] + base.y] + base.z];
      const XYzGradient = pp[pp[pp[apex.x] + apex.y] + base.z];
      const XyZGradient = pp[pp[pp[apex.x] + base.y] + apex.z];
      const XYZGradient = pp[pp[pp[apex.x] + apex.y] + apex.z];
  
      let xyzDot = this.dotgrad(xyzGradient, fraction.x, fraction.y, fraction.z);
      let XyzDot = this.dotgrad(XyzGradient, fraction.x - 1, fraction.y, fraction.z);
      let xYzDot = this.dotgrad(xYzGradient, fraction.x, fraction.y - 1, fraction.z);
      let XYzDot = this.dotgrad(XYzGradient, fraction.x - 1, fraction.y - 1, fraction.z);
      let xyZDot = this.dotgrad(xyZGradient, fraction.x, fraction.y, fraction.z - 1);
      let XyZDot = this.dotgrad(XyZGradient, fraction.x - 1, fraction.y, fraction.z - 1);
      let xYZDot = this.dotgrad(xYZGradient, fraction.x, fraction.y - 1, fraction.z - 1);
      let XYZDot = this.dotgrad(XYZGradient, fraction.x - 1, fraction.y - 1, fraction.z - 1);
  
      const a = this.lerp(xyzDot, XyzDot, weights.x);
      const b = this.lerp(xYzDot, XYzDot, weights.x);
      const c = this.lerp(xyZDot, XyZDot, weights.x);
      const d = this.lerp(xYZDot, XYZDot, weights.x);
  
      const e = this.lerp(a, b, weights.y);
      const f = this.lerp(c, d, weights.y);
  
      const g = this.lerp(e, f, weights.z);
  
      return g;
    }
  
    static fractalPerlinNoise(vecThree, layerCount) {
      let sum = 0;
      for (let i = 0; i < layerCount; i += 1) {
        const weight = (1 << i) / ((1 << layerCount) - 1);
        sum += this.perlinNoise(vecThree.scalarMultiply(1 / (1 << i))) * weight;
      }
      return sum;
    }
  
    static dotgrad(hash, x, y, z) {
      switch (hash & 0xF) {
        case 0x0: return  x + y;
        case 0x1: return -x + y;
        case 0x2: return  x - y;
        case 0x3: return -x - y;
        case 0x4: return  x + z;
        case 0x5: return -x + z;
        case 0x6: return  x - z;
        case 0x7: return -x - z;
        case 0x8: return  y + z;
        case 0x9: return -y + z;
        case 0xA: return  y - z;
        case 0xB: return -y - z;
        case 0xC: return  y + x;
        case 0xD: return -y + z;
        case 0xE: return  y - x;
        case 0xF: return -y - z;
        default: return 0;
      }
    }
  
    static fade(t) {
      return t * t * t * (t * (t * 6 - 15) + 10);
    }
    
    static lerp(a, b, t) {
      return a + t * (b - a);
    }
  
    static field3(dimensions, scale, layerCount) {
      const bytes = new Uint8Array(dimensions.x * dimensions.y * dimensions.z);
      for (let z = 0; z < dimensions.z; ++z) {
        for (let y = 0; y < dimensions.y; ++y) {
          for (let x = 0; x < dimensions.x; ++x) {
            const vecThree = new Vector3(x * scale.x, y * scale.y, z * scale.z);
            const value = Noise.fractalPerlinNoise(vecThree, layerCount) * 0.5 + 0.5;
            bytes[z * dimensions.x * dimensions.y + y * dimensions.x + x] = Math.floor(value * 255);
          }
        }
      }
      return bytes;
    }
  }
  
  Noise.permutations = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
  for (let i = 0; i < 256; ++i) {
    Noise.permutations[i + 256] = Noise.permutations[i];
  }