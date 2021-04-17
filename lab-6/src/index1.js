import {VertexArray} from './vertex_array';
import {VertexAttributes} from './vertex_attributes';
import {ShaderProgram} from './shader_program';
import {Matrix4} from './Matrix4';
import {Vector2} from './Vector2';
import {Trackball} from './Trackball';

const canvas = document.getElementById('canvas');
window.gl = canvas.getContext('webgl2');

let shaderProgram;
let vertexArray;
let worldToClip;
let isLeftMouseDown = false;
let trackball;

function render() {
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1, 1, 1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);

  shaderProgram.bind();
  shaderProgram.setUniformMatrix4('modelToWorld', trackball.rotation);
  shaderProgram.setUniformMatrix4('worldToClip', worldToClip);
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

  trackball.setViewport(canvas.width, canvas.height);

  render();
}

function generateSphere (nlatitudes, nlongitudes) {
  const seeds = [];
  for(let ilatitude = 0; ilatitude < nlatitudes; ilatitude++)
  {
    const radians = ilatitude / (nlatitudes - 1) * Math.PI * 2.0;
    seeds.push([Math.cos(radians), Math.sin(radians), 0, 1]);
  }


  const positions = [];
  const normals = [];

  for(let ilongitude = 0; ilongitude < nlongitudes; ilongitude++)
  {
    const degrees = ilongitude / nlongitudes * 360;
    const rotation = Matrix4.rotateY(degrees);
    for(let ilatitude = 0; ilatitude < nlatitudes; ilatitude++)
    {
      const position = rotation.multiplyVector4(seeds[ilatitude]);
      positions.push(position[0], position[1], position[2]);
      normals.push(position[0], position[1], position[2]);
    } 
  }

  const indices = [];
  for(let ilongitude = 0; ilongitude < nlongitudes; ilongitude++)
  {
    const iNextLongitude = (ilongitude + 1) % nlongitudes;
    for(let ilatitude = 0; ilatitude < nlatitudes - 1; ilatitude++)
    {
      const iNextLatitude = ilatitude + 1;
      // Bottom-left triangle
      indices.push(
        ilongitude * nlatitudes + ilatitude,
        ilongitude * nlatitudes + iNextLatitude,
        iNextLongitude * nlatitudes + ilatitude,
      )

      // Top-right triangle
      indices.push(
        ilongitude * nlatitudes + iNextLatitude,
        iNextLongitude * nlatitudes + iNextLatitude,
        iNextLongitude * nlatitudes + ilatitude,
      )
    }
  }

  return {positions, normals, indices};
}

function generateTorus (nlatitudes, nlongitudes, outerRadius, innerRadius) {
  const seeds = [];
  const seedNormals = [];

  const scale = (outerRadius-innerRadius)/2;
  const translate = (outerRadius-innerRadius)/2+innerRadius;
  
  for(let ilatitude = 0; ilatitude < nlatitudes; ilatitude++)
  {
    const radians = ilatitude / (nlatitudes) * (2 * Math.PI);
    const seed = [translate + (scale * Math.cos(radians)), scale * Math.sin(radians), 0, 1];
    const normal = [Math.cos(radians), Math.sin(radians), 0, 0];
    seedNormals.push(normal);
    seeds.push(seed);
    
    //seeds.push([Math.cos(radians), Math.sin(radians), 0, 1]);
  }

  const positions = [];
  const normals = [];

  for(let ilongitude = 0; ilongitude < nlongitudes; ilongitude++)
  {
    const degrees = ilongitude / nlongitudes * 360;
    const rotation = Matrix4.rotateY(degrees);
    for(let ilatitude = 0; ilatitude < nlatitudes; ilatitude++)
    {
      const position = rotation.multiplyVector4(seeds[ilatitude]);
      const normal = rotation.multiplyVector4(seedNormals[ilatitude]);
      positions.push(position[0], position[1], position[2]);
      normals.push(normal[0], normal[1], normal[2]);
    } 
  }

  const indices = [];
  for(let ilongitude = 0; ilongitude < nlongitudes; ilongitude++)
  {
    const iNextLongitude = (ilongitude + 1) % nlongitudes;
    for(let ilatitude = 0; ilatitude < nlatitudes; ilatitude++)
    {
      const iNextLatitude = (ilatitude + 1) % nlatitudes;
      // Bottom-left triangle
      indices.push(
        ilongitude * nlatitudes + ilatitude,
        ilongitude * nlatitudes + iNextLatitude,
        iNextLongitude * nlatitudes + ilatitude,
      )

      // Top-right triangle
      indices.push(
        ilongitude * nlatitudes + iNextLatitude,
        iNextLongitude * nlatitudes + iNextLatitude,
        iNextLongitude * nlatitudes + ilatitude,
      )
    }
  }

  return {positions, normals, indices};
}

  

async function initialize() {
  trackball = new Trackball();
  const {positions, normals, indices} = generateTorus(100, 100, 6, 3);
  var color = []
  for (var i = 0; i < 50 * 3; i++) {
    color[i] = 0.5;
  }
  const attributes = new VertexAttributes();
  attributes.addAttribute('normal', normals / 3, 3, normals);
  attributes.addAttribute('position', positions / 3, 3, positions);
  attributes.addAttribute('color', color / 3, 3, positions);

  attributes.addIndices(indices);
  
  const vertexSource = `
    uniform mat4 worldFromModel;
    uniform mat4 clipFromEye;
    uniform mat4 eyeFromWorld;
    
    in vec3 position;
    in vec3 normal;
    out vec3 fnormal;
    out vec3 positionEye;
    
    void main() {
      positionEye = (eyeFromWorld * worldFromModel * vec4(position, 1.0)).xyz;
      gl_Position = clipFromEye * vec4(positionEye, 1.0);
      fnormal = (eyeFromWorld * worldFromModel * vec4(normal, 0)).xyz;
    }
  `;
  const fragmentSource = 
  `
    const float ambientWeight = 0.1;
    const float shininess = 20.0;
    const vec3 lightPosition = vec3(1.0);
    const vec3 lightColor = vec3(1.0);

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
      //vec3 eyeVector = -normalize(fpositionEye); I didn't follow the lecture entirely so I don't know if this was a typo.
      vec3 eyeVector = -normalize(positionEye);
      // vec3 reflectedLightVector = 2.0 * dot(normal, lightVector) * normal - lightVector;
      // float specularity = max(0.0, dot(reflectedLightVector, eyeVector));
      vec3 halfVector = normalize(lightVector + eyeVector);
      float specularity = max(0.0, dot(halfVector, normal));
      vec3 specular = vec3(1.0) * pow(specularity, shininess);

      //vec3 rgb = (ambient + diffuse) * albedo + specular;
      vec3 rgb = (ambient + diffuse) + specular;

      fragmentColor = vec4(rgb, 1.0);
    }
  `;

  
  //pair the two shaders togethers
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
}

function onMouseDrag(event) {
  if (isLeftMouseDown) {
    const mousePixels = new Vector2(event.clientX, canvas.height - event.clientY);
    trackball.drag(mousePixels, 1);
    render();
  }
}

function onMouseUp(event) {
  if (isLeftMouseDown) {
    isLeftMouseDown = false;
    const mousePixels = new Vector2(event.clientX, canvas.height - event.clientY);
    trackball.end(mousePixels);
  }
}

initialize();