import {VertexArray} from '../../src/VertexArray.js';
import {VertexAttributes} from '../../src/VertexAttribute.js';
import {ShaderProgram} from '../../src/ShaderProgram.js';
import {Matrix4} from '../../src/Matrix4.js';
import {Camera} from '../../src/Camera.js';
import {Vector3} from '../../src/Vector3.js';
import {Vector2} from '../../src/Vector2.js';
import {Vector4} from '../../src/Vector4.js';

import { Trackball } from '../../src/Trackball.js';
import { Generate } from '../../src/Generate.js';
import { Noise } from '../../src/Noise.js';


const canvas = document.getElementById('canvas');
window.gl = canvas.getContext('webgl2');

let shaderProgram;
let vertexArray;
let worldToClip;
//let clipFromEye;
let isLeftMouseDown = false;
let trackball;
// this will be the for tracking the mouse speed when the user flicks the mouse and lets go.
var speed = new Vector2(0,0);
// this is used to adjust the distance so that the object isn't too big or small. 
var distance = 0.0;

function render() {
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1, 1, 1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);

  shaderProgram.bind();
  shaderProgram.setUniformMatrix4('modelToWorld', trackball.rotation);
  shaderProgram.setUniformMatrix4('worldToClip', worldToClip);
  shaderProgram.setUniform1f('distance', (distance/3));


  // uniform mat4 worldFromModel;
  // uniform mat4 clipFromEye;
  // uniform mat4 eyeFromWorld;

  // shaderProgram.setUniformMatrix4('worldFromModel', trackball.rotation);
  // shaderProgram.setUniformMatrix4('clipFromEye', clipFromEye);
  
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
    right = 9;
    top = right / aspectRatio;
  } else {
    top = 9;
    right = top * aspectRatio;
  }

  worldToClip = Matrix4.ortho(-right, right, -top, top, -10, 10);
  //clipFromEye = Matrix4.ortho(-right, right, -top, top, -10, 10);

  trackball.setViewport(canvas.width, canvas.height);

  render();
}

async function initialize() {
  trackball = new Trackball();

  // const {positions, normals, indices} = generate.torus(50, 50, 6, 3);
  // const attributes = new VertexAttributes();
  // attributes.addAttribute('normal', normals / 3, 3, normals);
  // attributes.addAttribute('position', positions / 3, 3, positions);
  // attributes.addIndices(indices);

  var attributes = new VertexAttributes();
  let inputFile = await fetch("cow-nonormals.obj").then(response => response.text());

  //var {positions, normals, indices, dimenxyz} = Generate.obj(inputFile);  
  var {positions, normals, indices, maxxyz} = Generate.obj(inputFile)
  console.log(maxxyz);
  distance = 0.0;
  if (maxxyz.x > distance) distance = maxxyz.x;
  if (maxxyz.y > distance) distance = maxxyz.y;
  if (maxxyz.z > distance) distance = maxxyz.z;


  
  attributes.addAttribute('normal', normals / 3, 3, normals);
  attributes.addAttribute('position', positions / 3, 3, positions);
  attributes.addIndices(indices);
  
  const vertexSource = `
  uniform mat4 modelToWorld;
  uniform mat4 worldToClip;
  uniform float distance;

  in vec3 position;
  in vec3 normal;

  out vec3 fnormal;
  out vec3 positionEye;

  void main() {
    gl_Position = worldToClip * modelToWorld * vec4(position, distance);
    fnormal = (modelToWorld * vec4(normal, 0)).xyz;
    positionEye = gl_Position.xyz; //(eyeFromWorld * worldFromModel * vec4(position, 1.0)).xyz;
  } 
  `;
  //   // LIGHT SOURCE
    const fragmentSource = `
    const float ambientWeight = 0.3;
    const float shininess = 90.0;
    const vec3 lightPosition = vec3(1.0, 1.0, 5.0);
    const vec3 lightColor = vec3(0.0, 0.6, 0.9);
    
    in vec3 fnormal;
    in vec3 positionEye;
    
    out vec4 fragmentColor;
    
    void main() {
      vec3 lightVector = normalize(lightPosition - positionEye);
      vec3 normal = normalize(fnormal);
    
      // Diffuse
      float litness = max(0.0, dot(normal, lightVector));
      vec3 diffuse = litness * lightColor * (1.0 - ambientWeight);
    
      // Ambient
      vec3 ambient = lightColor * ambientWeight;
    
      // Specular
      vec3 eyeVector = -normalize(positionEye);
      // vec3 reflectedLightVector = 2.0 * dot(normal, lightVector) * normal - lightVector;
      // float specularity = max(0.0, dot(reflectedLightVector, eyeVector));
      vec3 halfVector = normalize(lightVector + eyeVector);
      float specularity = max(0.0, dot(halfVector, normal));
      vec3 specular = vec3(1.0) * pow(specularity, shininess);
      // added the albedo from lab
      vec3 albedo = vec3(0.7);
      vec3 rgb = (ambient + diffuse) * albedo + specular;
    
      fragmentColor = vec4(rgb, 1.0);
    }
  `;

  
  //pair the two shaders together
  shaderProgram = new ShaderProgram(vertexSource, fragmentSource);
  //pair the shader program and the vertex data/attributes
  vertexArray = new VertexArray(shaderProgram, attributes);
  
  window.addEventListener('resize', onSizeChanged);
  window.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseDrag);
  window.addEventListener('mouseup', onMouseUp);
  onSizeChanged();
}

function onMouseDown(event) {
  if (event.button === 0) {
    isLeftMouseDown = true;
    const mousePixels = new Vector2(event.clientX, canvas.height - event.clientY);
    trackball.start(mousePixels);
  }
  // start tracking the mouse movement
}

function onMouseDrag(event) {
  speed = new Vector2(event.clientX, canvas.height - event.clientY);
  if (isLeftMouseDown) {
    const mousePixels1 = new Vector2(event.clientX, canvas.height - event.clientY);
    trackball.drag(mousePixels1, 2);
    render();
  }
}

function onMouseUp(event) {
  // this should be set when the 
  if (isLeftMouseDown) {
    isLeftMouseDown = false;
    var mousePixels = new Vector2(event.clientX, canvas.height - event.clientY);


    function getDirection() {
      console.log("direcitons")
      //speed = new Vector2(event.clientX, canvas.height - event.clientY);
      var placeholder = new Vector2(event.clientX, canvas.height - event.clientY);
      var direction = new Vector2(speed.x - placeholder.x, speed.y - placeholder.y)
      var pace = Math.abs(speed.x - placeholder.x) + Math.abs(speed.y - placeholder.y)

      function myFunc() {
        trackball.rotation = trackball.rotation.multiplyMatrix4(Matrix4.rotateAroundAxis(new Vector3(-direction.x, direction.y, 0), pace/10));
        render();
        if (!isLeftMouseDown) {
          setTimeout(myFunc, 10);
        }
      }
      if (pace > 1) {
        setTimeout(myFunc, 100);
      }
    }
    setTimeout(getDirection, 10);
  }
}
initialize();


