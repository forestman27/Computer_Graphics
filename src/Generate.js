import { Vector3 } from './Vector3';
import { Matrix4 } from './Matrix4';
import { VertexAttributes } from './VertexAttribute';


export class Generate {

static plane(width, height, nlatitude, nlongitude) {

    let positions = [];
    let colors = [];
    let normals = [];
    for (let ilongitude = 0; ilongitude < nlongitude; ilongitude++) {
        let x = ilongitude / (nlongitude - 1) * width - width * 0.5;
        for (let ilatitude = 0; ilatitude < nlatitude; ilatitude++) {
            let y = ilatitude / (nlatitude - 1) * height - height * 0.5;
            positions.push(x, y, 0);
            colors.push(Math.random(), Math.random(), Math.random());
            normals.push(0, 0, 1);
        }
    }

    let indices = [];
    for (let ilongitude = 0; ilongitude < nlongitude - 1; ilongitude++) {
        let iNextLongitude = ilongitude + 1;

        for (let ilatitude = 0; ilatitude < nlatitude - 1; ilatitude++) {
            let iNextLatitude = ilatitude + 1;

            indices.push(ilongitude * nlatitude + ilatitude);
            indices.push(iNextLongitude * nlatitude + ilatitude);
            indices.push(ilongitude * nlatitude + iNextLatitude);

            indices.push(iNextLongitude * nlatitude + ilatitude);
            indices.push(iNextLongitude * nlatitude + iNextLatitude);
            indices.push(ilongitude * nlatitude + iNextLatitude);
        }
    }

    const attributes = new VertexAttributes();
    attributes.addAttribute('position', positions.length / 3, 3, positions);
    attributes.addAttribute('color', colors.length / 3, 3, colors);
    attributes.addAttribute('normal', normals.length / 3, 3, normals);
    attributes.addIndices(indices);
    return attributes;
}

// static torus(oradius, iradius, nlatitudes, nlongitudes) {
//     let seeds = [];
//     let seedNormals = [];

//     for (let ilatitude = 0; ilatitude < nlatitudes; ilatitude++) {
//         let radians = ilatitude / (nlatitudes) * 2 * Math.PI;
//         seeds.push([Math.cos(radians), Math.sin(radians), 0, 0]);
//         seedNormals.push([Math.cos(radians), Math.sin(radians), 0, 0]);
//     }

//     // Shift seed positions.
//     let seedOffset = (oradius + iradius) / 2;
//     let seedScale = (oradius - iradius) / 2;
//     for (let ilatitude = 0; ilatitude < nlatitudes; ilatitude++) {
//         for (let x = 0; x < 4; x++) {
//             seeds[ilatitude][x] *= seedScale;
//         }
//         seeds[ilatitude][0] += seedOffset;
//     }

//     let positions = [];
//     let normals = [];
//     let colors = [];

//     for (let ilongitude = 0; ilongitude < nlongitudes; ilongitude++) {
//         let degrees = ilongitude / nlongitudes * 360;
//         let rotation = Matrix4.rotateY(degrees);

//         for (let ilatitude = 0; ilatitude < nlatitudes; ilatitude++) {
//             let position = rotation.multiplyVector4(seeds[ilatitude]);
//             let normal = rotation.multiplyVector4(seedNormals[ilatitude]);
//             positions.push(position[0], position[1], position[2])
//             normals.push(normal[0], normal[1], normal[2]);
//             colors.push(241/255, 209/255, 162/255);
//             //colors.push(Math.random(), Math.random(), Math.random());
//             //colors.push(241/255, 209/255, 162/255);
//             //colors.push(Math.random(), Math.random(), Math.random());
//         }
//     }

//     let indices = [];

//     for (let ilongitude = 0; ilongitude < nlongitudes; ilongitude++) {
//         let iNextLongitude = (ilongitude + 1) % nlongitudes;

//         for (let ilatitude = 0; ilatitude < nlatitudes; ilatitude++) {
//             let iNextLatitude = (ilatitude + 1) % nlatitudes;

//             indices.push(
//                 ilongitude * nlatitudes + ilatitude,
//                 ilongitude * nlatitudes + iNextLatitude,
//                 iNextLongitude * nlatitudes + ilatitude,
//             );

//             indices.push(
//                 ilongitude * nlatitudes + iNextLatitude,
//                 iNextLongitude * nlatitudes + iNextLatitude,
//                 iNextLongitude * nlatitudes + ilatitude,
//             );
//         }
//     }


    
//     const attributes = new VertexAttributes();
//     attributes.addAttribute('position', positions.length / 3, 3, positions);
//     attributes.addAttribute('color', colors.length / 3, 3, colors);
//     attributes.addAttribute('normal', normals.length / 3, 3, normals);
//     attributes.addIndices(indices);
//     return attributes;
// }
// https://github.com/timoxley/threejs/blob/master/utils/exporters/obj/convert_obj_three.py
static obj(inputFile) {

    var positions = [];
    var normals = [];

    var vPositions = [];
    var vNormals = [];
    var faces = [];
    var maxxyz = new Vector3(0.0, 0.0, 0.0);

    var lines = inputFile.split("\n");

    lines.map((line1) => {
        // f 1 2 3 each line
        var line = line1.split(" ");
        var rowType = line[0];
        // f
        var values = line.slice(1).map(Number); // returns all but the first element as numbers
        // var values = []
        // line = line.slice(1);
        // switch(rowType) {
        //     case ("v"): for (var i = 0; i < line.length; i++) {
        //         values[i] = parseFloat(line[i])
        //     } break;
        //     case ("vn"): for (var i = 0; i < line.length; i++) {
        //         values[i] = parseFloat(line[i])
        //     } break;
        //     case ("f"): for (var i = 0; i < line.length; i++) {
        //         values[i] = parseInt(line[i])
        //     } break;
        //     default: break;
        // }
        //console.log(values)
        // [1, 2, 3] 
    

        switch(rowType) {
            case ("v"): vPositions.push(...values); vNormals.push(...[undefined, undefined, undefined]);
                if (values[0] > maxxyz.x) {
                    maxxyz.x = values[0];
                };
                if (values[1] > maxxyz.y) {
                    maxxyz.y = values[1];
                };
                if (values[2] > maxxyz.z) {
                    maxxyz.z = values[2];
                };
                break;
            case ("vn"): vNormals.push(...values); break;
            case ("f"):// faces.push(...values); 
                var len = values.length;

                // if (len == 4) {
                //     faces.push(...[faces.length, faces.length + 1, faces.length+2, faces.length + 3]); 
                // } else {
                //     faces.push(...[faces.length, faces.length + 1, faces.length+2]); 
                // }
    
                // could be three or four unfortunately. 
                // a, b, c, (d)
                values.map((vertex, index) => {
                    faces.push(...[faces.length]); 
                    positions.push(...vPositions.slice(vertex * 3 - 3, vertex * 3));
                    if (vNormals[vertex] == undefined) {
                        var tmp = vPositions.slice(vertex * 3 - 3, vertex * 3);
                        var v = new Vector3(tmp[0], tmp[1], tmp[2])
                        v = v.normalize();
                        normals.push(...[v.x, v.y, v.z])
                    } else {
                        normals.push(...vNormals.slice(vertex * 3 - 3, vertex * 3));        
                    }
                });
                break;
            default: break;
        }
    })

    var indices = faces;
    return {positions, normals, indices, maxxyz};
  }

// written by the professor
static torus(innerRadius, outerRadius, nlatitudes, nlongitudes) {
    const radius = outerRadius - innerRadius;
    const centerX = (innerRadius + outerRadius) * 0.5;
  
    const positions = [];
    const normals = [];
    const faces = [];
    for (let ilongitude = 0; ilongitude < nlongitudes; ++ilongitude) {
      let longitude = ilongitude / nlongitudes * 2 * Math.PI; 
      const iNextLongitude = (ilongitude + 1) % nlongitudes;
      for (let ilatitude = 0; ilatitude < nlatitudes; ++ilatitude) {
        let latitude = ilatitude / nlatitudes * 2 * Math.PI;
        const iNextLatitude = (ilatitude + 1) % nlatitudes;
  
        const unrotatedX = radius * Math.cos(latitude) + centerX;
        const unrotatedY = radius * Math.sin(latitude);
        const position = new Vector3(
          unrotatedX * Math.cos(longitude),
          unrotatedY,
          unrotatedX * Math.sin(longitude),
        );
        positions.push(position);
  
        const normal = new Vector3(
          Math.cos(latitude) * Math.cos(longitude),
          Math.sin(latitude),
          Math.cos(latitude) * Math.sin(longitude),
        );
        normals.push(normal);
  
        faces.push([
          ilongitude * nlatitudes + ilatitude,
          ilongitude * nlatitudes + iNextLatitude,
          iNextLongitude * nlatitudes + ilatitude,
        ]);
        faces.push([
          ilongitude * nlatitudes + iNextLatitude,
          iNextLongitude * nlatitudes + iNextLatitude,
          iNextLongitude * nlatitudes + ilatitude,
        ]);
      }
    }
  
    return {positions, faces, normals};
  }

static sphere(nlatitudes, nlongitudes) {

    let seeds = [];

    for (let ilatitude = 0; ilatitude < nlatitudes; ilatitude++) {
        let radians = ilatitude / (nlatitudes - 1) * Math.PI - Math.PI / 2;
        seeds.push([Math.cos(radians), Math.sin(radians), 0, 0]);
    }

    let positions = [];
    let normals = [];
    let colors = [];

    for (let ilongitude = 0; ilongitude < nlongitudes; ilongitude++) {
        let degrees = ilongitude / nlongitudes * 360;
        let rotation = Matrix4.rotateY(degrees);

        for (let ilatitude = 0; ilatitude < nlatitudes; ilatitude++) {
            let position = rotation.multiplyVector4(seeds[ilatitude]);
            positions.push(position[0], position[1], position[2])
            normals.push(position[0], position[1], position[2]);
            colors.push(Math.random(), Math.random(), Math.random());
        }
    }

    let indices = [];

    for (let ilongitude = 0; ilongitude < nlongitudes; ilongitude++) {
        let iNextLongitude = (ilongitude + 1) % nlongitudes;

        for (let ilatitude = 0; ilatitude < nlatitudes; ilatitude++) {
            let iNextLatitude = (ilatitude + 1) % nlatitudes;

            indices.push(
                ilongitude * nlatitudes + ilatitude,
                ilongitude * nlatitudes + iNextLatitude,
                iNextLongitude * nlatitudes + ilatitude,
            );

            indices.push(
                ilongitude * nlatitudes + iNextLatitude,
                iNextLongitude * nlatitudes + iNextLatitude,
                iNextLongitude * nlatitudes + ilatitude,
            );
        }
    }

    const attributes = new VertexAttributes();
    attributes.addAttribute('position', positions.length / 3, 3, positions);
    attributes.addAttribute('color', colors.length / 3, 3, colors);
    attributes.addAttribute('normal', normals.length / 3, 3, normals);
    attributes.addIndices(indices);
    return attributes;
}

static cube() {
    const positions = [
        //front face
        //0     
        -1, -1, 1,
        //1
        1, -1, 1,
        //2
        -1, 1, 1,
        //3
        1, 1, 1,

        //back face
        //4
        -1, -1, -1,
        //5
        1, -1, -1,
        //6
        -1, 1, -1,
        //7
        1, 1, -1,

        //left face
        //0 - 8     
        -1, -1, 1,
        //4 - 9
        -1, -1, -1,
        //2 - 10
        -1, 1, 1,
        //6 - 11
        -1, 1, -1,

        // right face
        //1 - 12
        1, -1, 1,
        //5 - 13
        1, -1, -1,
        //3 - 14
        1, 1, 1,
        //7 - 15
        1, 1, -1,

        // top face
        //2 - 16
        -1, 1, 1,
        //3 - 17
        1, 1, 1,
        //6- 18
        -1, 1, -1,
        //7 - 19
        1, 1, -1,

        // bottom face
        //0 - 20
        -1, -1, 1,
        //1 - 21
        1, -1, 1,
        //4 - 22
        -1, -1, -1,
        //5 - 23
        1, -1, -1,
    ]; const colors = [
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,

        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,

        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,

        1, 1, 0,
        1, 1, 0,
        1, 1, 0,
        1, 1, 0,

        1, 0, 1,
        1, 0, 1,
        1, 0, 1,
        1, 0, 1,

        0, 1, 1,
        0, 1, 1,
        0, 1, 1,
        0, 1, 1,
    ];
    const faces = [
        // front
        0, 1, 2,
        1, 3, 2,

        // back
        4, 6, 5,
        5, 6, 7,

        // left
        8, 10, 9,
        9, 10, 11,

        // right
        12, 13, 14,
        13, 15, 14,

        // top
        16, 17, 18,
        17, 19, 18,

        // bottom
        20, 22, 21,
        21, 22, 23,
    ];
    const normals = [

        // front
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,

        // back
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,

        // left
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,

        // right
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,

        // top
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,

        // bottom
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
    ];
    const attributes = new VertexAttributes();
    attributes.addAttribute('position', positions.length / 3, 3, positions);
    attributes.addAttribute('color', colors.length / 3, 3, colors);
    attributes.addAttribute('normal', normals.length / 3, 3, normals);
    attributes.addIndices(faces);
    return attributes;
}
}