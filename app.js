var canvas;
var gl;
var angle = 0.0;

class Light{
    constructor(loc, dir, amb, sp, dif, alpha, cutoff, type){
    	this.location = loc;
    	this.direction = dir;
    	this.ambient = amb; // provides overall illumination for a room
    	this.specular = sp; // light that retains its reflective qualities. allows surface to look shiny
    	this.diffuse = dif; // reflected light being scattered in all directions
    	this.alpha = alpha;
    	this.cutoff = cutoff*Math.PI/180.0;
    	this.type = type;
    	this.status = 1;
    }
    turnOff(){this.status = 0;}
       
    turnOn(){this.status = 1;}
}

class Camera{
    constructor(vrp,u,v,n){
    	this.vrp = vrp;
    	this.u = normalize(u);
    	this.v = normalize(v);
    	this.n = normalize(n);
    	
    	this.projectionMatrix = perspective(90.0,1.0,0.1,100);
    	
    	this.updateCameraMatrix();
    }
    
    updateCameraMatrix(){
    	let t = translate(-this.vrp[0],-this.vrp[1],-this.vrp[2]);
    	let r = mat4(this.u[0], this.u[1], this.u[2], 0,
    		this.v[0], this.v[1], this.v[2], 0,
    		this.n[0], this.n[1], this.n[2], 0,
    		0.0, 0.0, 0.0, 1.0);
    	this.cameraMatrix = mult(r,t);
    }
    
    getModelMatrix(){
    	return this.modelMatrix;
    }
    
    setModelMatrix(mm){
    	this.modelMatrix = mm;
    }    
	setRotationX(angle) {
		let r = rotateX(-angle);
		let current = mat4(this.u[0], this.u[1], this.u[2], 0,
    		this.v[0], this.v[1], this.v[2], 0,
    		this.n[0], this.n[1], this.n[2], 0,
    		0.0, 0.0, 0.0, 1.0);
		let result = mult(r,current);
		this.u = normalize(vec3(result[0][0],result[0][1],result[0][2]));
		this.v = normalize(vec3(result[1][0],result[1][1],result[1][2]));
		this.n = normalize(vec3(result[2][0],result[2][1],result[2][2]));
		this.updateCameraMatrix();
	}

	setRotationY(angle) {
		let r = rotateY(angle);
		let current = mat4(this.u[0], this.u[1], this.u[2], 0,
    		this.v[0], this.v[1], this.v[2], 0,
    		this.n[0], this.n[1], this.n[2], 0,
    		0.0, 0.0, 0.0, 1.0);
		let result = mult(r,current);
		this.u = normalize(vec3(result[0][0],result[0][1],result[0][2]));
		this.v = normalize(vec3(result[1][0],result[1][1],result[1][2]));
		this.n = normalize(vec3(result[2][0],result[2][1],result[2][2]));
		this.updateCameraMatrix();
	}

	setRotationZ(angle) {
		let r = rotateZ(angle);
		let current = mat4(this.u[0], this.u[1], this.u[2], 0,
    		this.v[0], this.v[1], this.v[2], 0,
    		this.n[0], this.n[1], this.n[2], 0,
    		0.0, 0.0, 0.0, 1.0);
		let result = mult(r,current);
		this.u = normalize(vec3(result[0][0],result[0][1],result[0][2]));
		this.v = normalize(vec3(result[1][0],result[1][1],result[1][2]));
		this.n = normalize(vec3(result[2][0],result[2][1],result[2][2]));
		this.updateCameraMatrix();
	}
}

var camera1 = new Camera(vec3(0,2,10), vec3(1,0,0), vec3(0,1,0), vec3(0,0,1));

var light1 = new Light(vec3(0,0,0), vec3(0,-1,-1), vec4(0.1,0.1,0.1,1.0), vec4(0.4,0.4,0.4,1), vec4(0.3,0.3,0.3,1), 0, 0, 1); // directional light
var light2 = new Light(vec3(0,0,0), mult(-1,camera1.n), vec4(0.6, 0.6, 0.6, 1), vec4(0.9, 0.9, 0.9, 1), vec4(0.8, 0.8, 0.8, 1), 4, 45, 0); // spot light

class Drawable{
    constructor(tx,ty,tz,scale,rotX, rotY, rotZ, amb, dif, sp, sh){
    	this.tx = tx;
    	this.ty = ty;
    	this.tz = tz;
    	this.scale = scale;
    	this.modelRotationX = rotX;
    	this.modelRotationY = rotY;
    	this.modelRotationZ = rotZ;
    	this.updateModelMatrix();
    	
    	this.matAmbient = amb;
    	this.matDiffuse = dif;
    	this.matSpecular = sp;
    	this.matAlpha = sh;
    	
    }
    	
    updateModelMatrix(){
        let t = translate(this.tx, this.ty, this.tz);		     
	   		     
    	let s = scale(this.scale,this.scale,this.scale);
    	
    	let rx = rotateX(this.modelRotationX);
    	let ry = rotateY(this.modelRotationY);
    	let rz = rotateZ(this.modelRotationZ);
	
	this.modelMatrix = mult(t,mult(s,mult(rz,mult(ry,rx))));
    }
}

var groundPlane;
var skyCube;
var slime;
var slime1,slime2;
var objectList = [];
var amb = vec4(0.7,0.7,0.7,1.0);
var dif = vec4(0.9,0.9,0.9,1.0);
var spec = vec4(1.0,1.0,1.0,1.0);
var shine = 100.0;

window.onload = function init(){
    canvas = document.getElementById( "gl-canvas" );
    gl = canvas.getContext('webgl2');
    if ( !gl ) { alert( "WebGL 2.0 isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.9, 0.9, 0.9, 1.0 );
    gl.enable(gl.DEPTH_TEST);

	skyCube = new SkyCube(0, 0, 0, 2, 0, 0, 0, amb, dif, spec, shine);
    groundPlane = new GroundPlane(0, 0, 0, 100, 0, 0, 0, amb, dif, spec, shine);
	
	//objectList.push(new Cube(-2, 1, 0, 2, 0, 0, 0, amb, dif, spec, shine);
	slime = new Slime(0, 1, 0, 2, 0, 0, 0, amb, dif, spec, shine);
	slime1 = new Slime(-0.75, 2.5, 0, 1, 0, 0, 0, amb, dif, spec, shine);
	slime2 = new Slime(0.75, 2.5, 0, 1, 0, 0, 0, amb, dif, spec, shine);

	objectList.push(new HouseBottom(0, 4, -8, 8, 0, 0, 0, amb, dif, spec, shine)); // main house
	objectList.push(new HouseTopBrick(0, 8, -8, 4.5, 0, 0, 0, amb, dif, spec, shine)); // main house

	makeTree(3, 5);

	objectList.push(new HouseBottom(-36, 4, -32, 8, 0, 0, 0, amb, dif, spec, shine)); // 1st house
	objectList.push(new HouseTopWood(-36, 8, -32, 4.5, 0, 0, 0, amb, dif, spec, shine)); // 1st house

	objectList.push(new HouseBottom(-18, 4, -32, 8, 0, 0, 0, amb, dif, spec, shine)); // 2nd house
	objectList.push(new HouseTopBrick(-18, 8, -32, 4.5, 0, 0, 0, amb, dif, spec, shine)); // 2nd house

	objectList.push(new HouseBottom(0, 4, -32, 8, 0, 0, 0, amb, dif, spec, shine)); // 3rd house
	objectList.push(new HouseTopWood(0, 8, -32, 4.5, 0, 0, 0, amb, dif, spec, shine)); // 3rd house

	objectList.push(new HouseBottom(18, 4, -32, 8, 0, 0, 0, amb, dif, spec, shine)); // 4th house
	objectList.push(new HouseTopBrick(18, 8, -32, 4.5, 0, 0, 0, amb, dif, spec, shine)); // 4th house

	objectList.push(new HouseBottom(36, 4, -32, 8, 0, 0, 0, amb, dif, spec, shine)); // 5th house
	objectList.push(new HouseTopWood(36, 8, -32, 4.5, 0, 0, 0, amb, dif, spec, shine)); // 5th house

	for (let i = 0; i < 100; i++) {
		var x = Math.floor(Math.random() * (Math.floor(36) - Math.ceil(-36) + 1) + Math.ceil(-36));
		var z = Math.floor(Math.random() * (Math.floor(-42) - Math.ceil(-48) + 1) + Math.ceil(-48));
		objectList.push(new TreeBottomTriangle(x, 0.0, z, 1, 0, 0, 0, amb, dif, spec, shine));
		objectList.push(new TreeTopTriangle(x, 1.5, z, 1, 0, 0, 0, amb, dif, spec, shine));
		objectList.push(new TreeTopTriangle(x, 3.5, z, 0.8, 0, 0, 0, amb, dif, spec, shine));
		objectList.push(new TreeTopTriangle(x, 5.5, z, 0.5, 0, 0, 0, amb, dif, spec, shine));
	}
	
	window.addEventListener("keydown", keyBoardFunction);
	
    render();
};

var bgSlimeJumpCount = 0;
var smSlimeJumpCount = 10;

function render(){
    setTimeout(function(){
		requestAnimationFrame(render);
    	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		let beforePos = camera1.vrp;
		let beforeU = camera1.u;
		let beforeV = camera1.v;
		let beforeN = camera1.n;
		camera1.vrp = vec3(0,-0.5,0);  
		camera1.updateCameraMatrix();

		gl.disable(gl.DEPTH_TEST);
		skyCube.draw();
		gl.enable(gl.DEPTH_TEST);

		camera1.vrp = beforePos;
		camera1.u = beforeU;
		camera1.v = beforeV;
		camera1.n = beforeN;
		camera1.updateCameraMatrix();
        groundPlane.draw();
		
		// Slime split and merge animation while jumping
		if (bgSlimeJumpCount != 10) {
			slime.draw();
			slime.ty += 0.2;
			slime.updateModelMatrix();
			bgSlimeJumpCount++;

			if (bgSlimeJumpCount == 9) {
				slime1.ty = 2.3;
				slime2.ty = 2.3;
				slime1.updateModelMatrix();
				slime2.updateModelMatrix();
				smSlimeJumpCount = 10;

			}
		} else if(smSlimeJumpCount != 0) {
			slime1.draw();
			slime2.draw();
			slime1.ty -= 0.2;
			slime2.ty -= 0.2;
			slime1.updateModelMatrix();
			slime2.updateModelMatrix();
			smSlimeJumpCount--;

			if (smSlimeJumpCount == 1) {
				slime.ty = 1;
				slime.updateModelMatrix();
				bgSlimeJumpCount = 0;
			}
		}


		for (var i = 0; i<objectList.length; i++) {
            objectList[i].draw();
        }

    }, 100 );  //10fps
}

function keyBoardFunction(event) {
	let stepRatio = 0.1;
	let angleStep = 0.5;
	switch (event.key) {
		case " ":
			if (light2.status == 0){
				light2.turnOn();
			} else {
				light2.turnOff();
			}
			break;
		case "ArrowUp":
			camera1.vrp = subtract(camera1.vrp, mult(stepRatio, camera1.n));
			break;
		case "ArrowDown": 
			camera1.vrp = add(camera1.vrp, mult(stepRatio, camera1.n));
			break;
		case "ArrowLeft": 
			camera1.vrp = subtract(camera1.vrp, mult(stepRatio, camera1.u));
			break;
		case "ArrowRight":
			camera1.vrp = add(camera1.vrp, mult(stepRatio, camera1.u));
			break;
		case "Z":
			camera1.setRotationZ(-angleStep);
			break;
		case "z":
			camera1.setRotationZ(angleStep);
			break;
		case "X":
			camera1.setRotationX(angleStep);
			break;
		case "x":
			camera1.setRotationX(-angleStep);
			break;
		case "C":
			camera1.setRotationY(-angleStep)
			break;
		case "c":
			camera1.setRotationY(angleStep);
			break;
	}
	camera1.updateCameraMatrix();
	light2.loc = camera1.vrp;
	light2.direction = mult(-1,camera1.n);
}

function makeTree(x, z) {
	objectList.push(new TreeTrunk(x, 0.75, z, 1.5, 0, 0, 0, amb, dif, spec, shine));
	objectList.push(new TreeTrunk(x, 2.25, z, 1.5, 0, 0, 0, amb, dif, spec, shine));
	objectList.push(new TreeTrunk(x, 3.75, z, 1.5, 0, 0, 0, amb, dif, spec, shine));

	objectList.push(new TreeLeaf(x-2.25, 5.25, z-2.25, 1.5, 0, 0, 0, amb, dif, spec, shine));
	objectList.push(new TreeLeaf(x-0.75, 5.25, z-2.25, 1.5, 0, 0, 0, amb, dif, spec, shine));
	objectList.push(new TreeLeaf(x+0.75, 5.25, z-2.25, 1.5, 0, 0, 0, amb, dif, spec, shine));
	objectList.push(new TreeLeaf(x+2.25, 5.25, z-2.25, 1.5, 0, 0, 0, amb, dif, spec, shine));

	objectList.push(new TreeLeaf(x-2.25, 5.25, z-0.75, 1.5, 0, 0, 0, amb, dif, spec, shine));
	objectList.push(new TreeLeaf(x-0.75, 5.25, z-0.75, 1.5, 0, 0, 0, amb, dif, spec, shine));
	objectList.push(new TreeLeaf(x+0.75, 5.25, z-0.75, 1.5, 0, 0, 0, amb, dif, spec, shine));
	objectList.push(new TreeLeaf(x+2.25, 5.25, z-0.75, 1.5, 0, 0, 0, amb, dif, spec, shine));

	objectList.push(new TreeLeaf(x-2.25, 5.25, z+0.75, 1.5, 0, 0, 0, amb, dif, spec, shine));
	objectList.push(new TreeLeaf(x-0.75, 5.25, z+0.75, 1.5, 0, 0, 0, amb, dif, spec, shine));
	objectList.push(new TreeLeaf(x+0.75, 5.25, z+0.75, 1.5, 0, 0, 0, amb, dif, spec, shine));
	objectList.push(new TreeLeaf(x+2.25, 5.25, z+0.75, 1.5, 0, 0, 0, amb, dif, spec, shine));

	objectList.push(new TreeLeaf(x-2.25, 5.25, z+2.25, 1.5, 0, 0, 0, amb, dif, spec, shine));
	objectList.push(new TreeLeaf(x-0.75, 5.25, z+2.25, 1.5, 0, 0, 0, amb, dif, spec, shine));
	objectList.push(new TreeLeaf(x+0.75, 5.25, z+2.25, 1.5, 0, 0, 0, amb, dif, spec, shine));
	objectList.push(new TreeLeaf(x+2.25, 5.25, z+2.25, 1.5, 0, 0, 0, amb, dif, spec, shine));

	objectList.push(new TreeLeaf(x-0.75, 6.25, z-0.75, 2.5, 0, 0, 0, amb, dif, spec, shine));
	objectList.push(new TreeLeaf(x+0.75, 6.25, z-0.75, 2.5, 0, 0, 0, amb, dif, spec, shine));

	objectList.push(new TreeLeaf(x-0.75, 6.25, z+0.75, 2.5, 0, 0, 0, amb, dif, spec, shine));
	objectList.push(new TreeLeaf(x+0.75, 6.25, z+0.75, 2.5, 0, 0, 0, amb, dif, spec, shine));

	objectList.push(new TreeLeaf(x, 8.25, z, 2, 0, 0, 0, amb, dif, spec, shine));
}
