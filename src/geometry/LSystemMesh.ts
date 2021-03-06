import {vec3, vec4, mat4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';
import {Cube} from '../geometry/Square'
import {Turtle} from '../geometry/Turtle'
import {Lsystem, LinkedList, Node, linkedListToString} from '../geometry/LSystem'

class LSystemMesh extends Drawable {
  indices: Uint32Array;
  positions: Float32Array;
  normals: Float32Array;
  center: vec4;

  tempIndices: Array<number>;
  tempPositions: Array<number>;
  tempNormals: Array<number>;

  countIdx : number = 0;
  iterations: number;
  angle : number;
  axiom: string;

  constructor(center: vec3, iter: number, angle: number, axiom: string) {
    super(); // Call the constructor of the super class. This is required.
    this.center = vec4.fromValues(center[0], center[1], center[2], 1);
    this.tempIndices = [];
    this.tempPositions = [];
    this.tempNormals = [];
    this.iterations = iter;
    this.angle = angle;
    this.axiom = axiom;

  }


 drawingRules(input: string, turt: Turtle) {
   switch(input) {
     case 'F': {

       // This is the only time we'll DRAW.
       // Draw geometry with transformations based on the
       // state of the turtle!
       let primitive : Cube = new Cube(vec3.fromValues(0.0,0.0,0.0));
       primitive.setVals();
       
       // Draw current
       // Apply transformation matrix to EACH position AND normal
       let newIndices : Array<number> = primitive.tempIndices;
       let newPositions : Array<number> = primitive.tempPositions;
       let newNormals : Array<number> = primitive.tempNormals;

       // Adjust positions according to transformations
       let start = 0;
       for(let i : number = 0; i < 24; ++i) {
         // Get original positions of primitive mesh and store in vec4
         let val1 : number = newPositions[start];
         let val2 : number = newPositions[start + 1];
         let val3 : number = newPositions[start + 2];
         let val4 : number = newPositions[start + 3];
         let currPos : vec4 = vec4.fromValues(val1, val2, val3, val4);


         // Apply turtle transformation to the original position
         let transMat : mat4 = mat4.create();
         transMat = turt.state();
 
         newPositions[start] = (transMat[0] * val1) + 
                               (transMat[4] * val2) + 
                               (transMat[8] * val3) + 
                               (transMat[12] * val4);
         newPositions[start + 1] = (transMat[1] * val1) + 
                                   (transMat[5] * val2) + 
                                   (transMat[9] * val3) + 
                                   (transMat[13] * val4);
         newPositions[start + 2] = (transMat[2] * val1) + 
                                   (transMat[6] * val2) + 
                                   (transMat[10] * val3) + 
                                   (transMat[14] * val4);
         newPositions[start + 3] = (transMat[3] * val1) + 
                                   (transMat[7] * val2) + 
                                   (transMat[11] * val3) + 
                                   (transMat[15] * val4);
         newPositions[start] = newPositions[start] / newPositions[start+3];
         newPositions[start +1] = newPositions[start+1] / newPositions[start+3];
         newPositions[start+2] = newPositions[start+2] / newPositions[start+3];
         newPositions[start+3] = newPositions[start+3] / newPositions[start+3]; 
         
         // Start next position value as 4 array positions ahead
         start = start + 4;
       }

       // Adjust normals
       let start2 = 0;
       for(let i : number = 0; i < 24; ++i) {
        let val1 : number = newNormals[start2];
        let val2 : number = newNormals[start2 + 1];
        let val3 : number = newNormals[start2 + 2];
        let val4 : number = newNormals[start2 + 3];

        newNormals[start2] = val1;
        newNormals[start2 + 1] = val2;
        newNormals[start2 + 2] = val3;
        newNormals[start2 + 3] = val4;

        start2 = start2 + 4;
       }


       for(let i : number = 0; i < 36; ++i) {
         newIndices[i] = newIndices[i] + (24 * this.count);
       }
       this.count++;

       this.tempIndices = this.tempIndices.concat(newIndices);
       this.tempPositions = this.tempPositions.concat(newPositions);
       this.tempNormals = this.tempNormals.concat(newNormals);



       // then translate turtle
       turt.translateForwardTurtle();
       break;

     }
     case '-': {
       turt.rotateTurtle(this.angle, 2);
       break;
     }
     case '+': {
      turt.rotateTurtle(this.angle * -1, 2);
      break;
    }
    case '<': {
      let prob : number = Math.random();
      if(prob < .9) {
       turt.rotateTurtle(this.angle, 0);
      }
      else {
        turt.rotateTurtle(this.angle, 1); 
      }
      break;
    }
    case '>': {
      let prob : number = Math.random();
      if(prob < .9) {
       turt.rotateTurtle(this.angle * -1, 0);
      }
      else {
        turt.rotateTurtle(this.angle, 1); 
      }
      break;
    }
   }
 }


  traverseTurtle() {
    let tree : Lsystem = new Lsystem(this.axiom, this.iterations);
    let path : LinkedList  = tree.doIterations();

    console.log(linkedListToString(path));

    let turtleStack: Array<Turtle> = [];

    let curr : Node = path.head;
    let currTurt : Turtle = new Turtle(0);
    while(curr !== null) {
      
      if(curr.sym == '[') {
        // Save the current turtle state in a stack and continue
        let newTurt : Turtle = new Turtle(0);
        currTurt.copyTurtle(newTurt);
        turtleStack.push(currTurt);
        currTurt = newTurt;
      }
      else if(curr.sym == ']') {
        // Return to last saved turtle state
        let oldTurt : Turtle = turtleStack.pop();
        oldTurt.copyTurtle(currTurt);
      }
      else {
        // Follow drawing rules according to turtle state
        this.drawingRules(curr.sym, currTurt);
      }
      currTurt.depth = currTurt.depth + 1;
      curr = curr.next;
    }
  }

  create() {

    this.traverseTurtle();

    

    this.indices = new Uint32Array(this.tempIndices);
    this.positions = new Float32Array(this.tempPositions);
    this.normals = new Float32Array(this.tempNormals);
    

    this.generateIdx();
    this.generatePos();
    this.generateNor();

    this.count = this.indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
    gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
    gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

    console.log(`Created L-system`);
  }
};

export default LSystemMesh;
