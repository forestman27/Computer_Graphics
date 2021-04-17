import {VertexArray} from '../../src/VertexArray.js';
import {VertexAttributes} from '../../src/VertexAttribute.js';
import {ShaderProgram} from '../../src/ShaderProgram.js';
import {Matrix4} from '../../src/Matrix4.js';
import {Camera} from '../../src/Camera.js';
import {Vector3} from '../../src/Vector3.js';
import { Trackball } from '../../src/Trackball.js';
import { Generate } from '../../src/Generate.js';
import { Noise } from '../../src/Noise.js';

const canvas = document.getElementById('canvas');
window.gl = canvas.getContext('webgl2');

let vertexArray;
let shaderProgram;
let modelToWorld;

let clipFromEye;
let eyeFromModel;

let trackball;
let camera;

let DIST_TOP = 5;
let DIST_RIGHT = 5;
let DIST_THROUGH = 5;

let isLeftMouseDown = false;

function render() {
    gl.clearColor(0.5, 0.5, 0.5, 1);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    
    shaderProgram.bind();
    shaderProgram.setUniformMatrix4('clipFromEye', clipFromEye);
    // FOR OTHER STUFF
    // shaderProgram.setUniformMatrix4('eyeFromModel', eyeFromModel);
    shaderProgram.setUniformMatrix4('eyeFromModel', modelToWorld);
    vertexArray.bind();
    vertexArray.drawIndexed(gl.TRIANGLES);
    vertexArray.unbind();
    shaderProgram.unbind();
}

function onSizeChanged() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    const aspectRatio = canvas.width / canvas.height;

    let right;
    let top;

    if (aspectRatio < 1) {
        right = DIST_RIGHT;
        top = right / aspectRatio;
    } else {
        top = DIST_TOP;
        right = top * aspectRatio;
    }


    trackball.setViewport(canvas.width, canvas.height);

    clipFromEye = Matrix4.ortho(-right, right, -top, top, -DIST_THROUGH, DIST_THROUGH);
    eyeFromModel = camera.matrix; //trackball.rotation // Matrix4.identity()

    render();
}



function onMouseDown(event) {
    if (event.button === 0) {
        isLeftMouseDown = true;
        animateFrame();
        //const mousePixels = [event.clientX, canvas.height - event.clientY];
        //trackball.start(mousePixels);
    }
}

function onMouseDrag(event) {
    if (isLeftMouseDown) {
        //const mousePixels = [event.clientX, canvas.height - event.clientY];
        //trackball.drag(mousePixels, 2);
        ////eyeFromModel = trackball.rotation;
        //render();
    }
}

function onMouseUp(event) {
    if (isLeftMouseDown) {
        isLeftMouseDown = false;
        //const mousePixels = [event.clientX, canvas.height - event.clientY];
        //trackball.end(mousePixels);
    }
}

let radians = 0;

function animateFrame() {
        
    radians += 0.05;
    let from = new Vector3(0, 0, 0);
    let to = new Vector3(0,0,0.5);
    camera.setFromTo(from, to);

    eyeFromModel = camera.matrix;
    
    render();   
    if (isLeftMouseDown) {
        requestAnimationFrame(animateFrame);
    }
}

async function initialize() {
    camera = new Camera(new Vector3(0, 1, 1), new Vector3(0, 0, 0), new Vector3(0, 1, 0));
    trackball = new Trackball();

    const vertexSource = `
  uniform mat4 clipFromEye;
  uniform mat4 eyeFromModel;

  in vec3 position;
  in vec3 color;
  in vec3 normal;

  out vec3 fnormal;
  out vec3 fcolor;
  out vec3 positionEye;
  out vec3 ftexcoords;

  void main() {
    gl_PointSize = 2.0; 
    positionEye = (eyeFromModel * vec4(position, 1.0)).xyz; 
    gl_Position = clipFromEye * eyeFromModel * vec4(position, 1.0);
    //fnormal = (eyeFromModel * vec4(normal,0)).xyz;  
    fnormal = (eyeFromModel * vec4(normal,0)).xyz;
    
    // shrink so that it doesn't wrap
    // also could just enable no wrapping
    ftexcoords = position * vec3(0.2) + vec3(0.5);
    
    
    fcolor = color;
  }
  `;

  // LIGHT SOURCE
    const fragmentSource = `
  precision mediump sampler3D;

  const vec3 lightDirection = normalize(vec3(0,0,1));
  const vec3 lightVector = normalize(vec3(1.0));
  const vec3 lightColor = vec3(1.0);
  const vec3 lightPosition = vec3(1.0);
  const float ambientWeight = 0.2;
  in vec3 positionEye;
  in vec3 fnormal;
  in vec3 fcolor;
  in vec3 ftexcoords;
  out vec4 fragmentColor;

  uniform sampler3D noise;
  

  void main() {
    vec3 normal = normalize(fnormal);
    
    //DEFINED TWICE
    //vec3 lightVector = normalize(lightPosition - positionEye);

    // Diffuse
    //float litness = max(0.0, dot(normal, lightDirection));
    float litness = max(0.0, dot(normal, lightVector));
    vec3 diffuse = litness * lightColor * (1.0 - ambientWeight);

    // Ambient 
    vec3 ambient = lightColor * ambientWeight;

    // inserting here *************************************************************************************

    // Specular
    vec3 eyeVector = -normalize(positionEye);
    // vec3 reflectedLightVector = 2.0 * dot(normal, lightVector) * normal - lightVector;
    // float specularity = max(0.0, dot(reflectedLightVector, eyeVector));
    vec3 halfVector = normalize(lightVector + eyeVector);
    float specularity = max(0.0, dot(halfVector, normal));
    const float shininess = 45.0;
    vec3 specular = vec3(1.0) * pow(specularity, shininess);
  
    //vec3 rgb = (ambient + diffuse) * albedo + specular;

    // uninserting here *************************************************************************************


    float distanceY = length(ftexcoords.xz);
    float phaseShift = texture(noise, ftexcoords).r;

    // first number decrease the number of rings
    // multiply second by a larger number for a bigger intensity
    float grain = abs(sin((ftexcoords.x + ftexcoords.z) * 150.0 + phaseShift * 500.0));
    
    // multiply by a power to make more black
    vec3 albedo = vec3(pow(grain, 0.5));


    //fragmentColor = texture(noise, ftexcoords);
    // added specular.
    vec3 rgb = (ambient + diffuse) * albedo + specular;
    fragmentColor = vec4(rgb, 1.0);

  }
  `;

    const bytes = Noise.field3(new Vector3(32, 32, 32), new Vector3(0.1, 0.1, 0.1), 3);
    gl.activeTexture(gl.TEXTURE0);
    const noise = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_3D, noise);
    gl.texImage3D(gl.TEXTURE_3D, 0, gl.R8, 32, 32, 32, 0, gl.RED, gl.UNSIGNED_BYTE, bytes);
    gl.generateMipmap(gl.TEXTURE_3D);

    shaderProgram = new ShaderProgram(vertexSource, fragmentSource);
    vertexArray?.destroy();
    let attributes = Generate.generateTorus(2, 1, 50, 50);
    console.log(attributes);
    vertexArray = new VertexArray(shaderProgram, attributes);

    modelToWorld = Matrix4.scale(1, 1, 1);
    window.addEventListener('resize', onSizeChanged);

    window.addEventListener('keydown', event => {
       let rotationAmount = 3;

       if (event.key === 'ArrowRight') {
           modelToWorld = modelToWorld.multiplyMatrix4(Matrix4.rotateY(-rotationAmount));
       }
       if (event.key === 'ArrowLeft') {
           modelToWorld = modelToWorld.multiplyMatrix4(Matrix4.rotateY(rotationAmount));
       }
       if (event.key === 'ArrowUp') {
           modelToWorld = modelToWorld.multiplyMatrix4(Matrix4.rotateX(-rotationAmount));
       }
       if (event.key === 'ArrowDown') {
           modelToWorld = modelToWorld.multiplyMatrix4(Matrix4.rotateX(rotationAmount));
       }
       if (event.key === 'w') {
           modelToWorld = modelToWorld.multiplyMatrix4(Matrix4.rotateAroundAxis(new Vector3(1, 1, 0.5), rotationAmount));
       }
       if (event.key === 's') {
           modelToWorld = modelToWorld.multiplyMatrix4(Matrix4.rotateAroundAxis(new Vector3(-1, -1, 0.5), rotationAmount));
       }
       render();
    });

    // window.addEventListener('mousedown', onMouseDown);
    // window.addEventListener('mousemove', onMouseDrag);
    // window.addEventListener('mouseup', onMouseUp);

    onSizeChanged();
}

initialize();