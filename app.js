var canvas;
var gl;
var angle = 0.0;
var rotatingCamAngle = 0.0;

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
    	
    	this.projectionMatrix = perspective(90.0, 1.0, 0.1, 130);
    	
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

var mainCam = new Camera(vec3(0,2,10), vec3(1,0,0), vec3(0,1,0), vec3(0,0,1));
var rotatingCam = new Camera(vec3(0,35,20), vec3(1,0,0), vec3(0,1,0), vec3(0,0,1));

rotatingCam.setRotationX(-60);

var camera1 = mainCam;

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

var objectList = [];
var cloudList = [];
var bigSlime = [];
var smallSlime = [];
var diamonds = [];
var amb = vec4(0.7,0.7,0.7,1.0);
var dif = vec4(0.9,0.9,0.9,1.0);
var spec = vec4(1.0,1.0,1.0,1.0);
var shine = 100.0;
var mainCamOn = true;

window.onload = function init(){
    canvas = document.getElementById( "gl-canvas" );
    gl = canvas.getContext('webgl2');
    if ( !gl ) { alert( "WebGL 2.0 isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.9, 0.9, 0.9, 1.0 );
    gl.enable(gl.DEPTH_TEST);

	objectList.push(new SkyCube(0, 0, 0, 2, 0, 0, 0, amb, dif, spec, shine));
    objectList.push(new GroundPlane(0, 0, 0, 100, 0, 0, 0, amb, dif, spec, shine));

	makeSlime(-10, -10);
	makeSlime(10, 10, 180);
	makeSlime(12, -9);
	makeSlime(17, -5);
	makeSlime(-23, 5, 90);

	for (let i = -3; i <=3; i++) {
		objectList.push(new Path(-3.5, 0.005, i, 1, 0, 0, 0, amb, dif, spec, shine)); // left path
		objectList.push(new Path(-4, 0.005, i, 1, 0, 0, 0, amb, dif, spec, shine)); // left path

		objectList.push(new Path(i, 0.005, -3.5, 1, 0, 0, 0, amb, dif, spec, shine)); // top path
		objectList.push(new Path(i, 0.005, -4, 1, 0, 0, 0, amb, dif, spec, shine)); // top path
	}
	
	for (let i = -3; i <=3; i++) {
		objectList.push(new Path(3.5, 0.005, i, 1, 0, 0, 0, amb, dif, spec, shine)); // right path
		objectList.push(new Path(4, 0.005, i, 1, 0, 0, 0, amb, dif, spec, shine)); // right path

		objectList.push(new Path(i, 0.005, 3.5, 1, 0, 0, 0, amb, dif, spec, shine)); // bottom path
		objectList.push(new Path(i, 0.005, 4, 1, 0, 0, 0, amb, dif, spec, shine)); // bottom path
	}

	objectList.push(new HouseBottom(0, 4, -20, 8, 0, 0, 0, amb, dif, spec, shine)); // main house
	objectList.push(new HouseTopBrick(0, 8, -20, 4.5, 0, 0, 0, amb, dif, spec, shine)); // main house
	objectList.push(new Chimney(3, 11, -20, 1.5, 0, 0, 0, amb, dif, spec, shine)); // main house

	for (let i = -5; i >= -17; i--) {
		objectList.push(new Path(-0.5, 0.005, i, 1, 0, 0, 0, amb, dif, spec, shine)); // path to main house
		objectList.push(new Path(0.5, 0.005, i, 1, 0, 0, 0, amb, dif, spec, shine)); 
	}
	
	objectList.push(new HouseBottom(-25, 4, -15, 8, 0, 0, 0, amb, dif, spec, shine)); // 1st house
	objectList.push(new HouseTopWood(-25, 8, -15, 4.5, 0, 0, 0, amb, dif, spec, shine)); // 1st house
	objectList.push(new Chimney(-22, 11, -15, 1.5, 0, 0, 0, amb, dif, spec, shine)); // 1st house

	diamonds.push(new Diamond(0, 1, 0, 2, 0, 0, 0, amb, dif, spec, shine));

	for (let i = -5; i >= -25; i--) {
		objectList.push(new Path(i, 0.005, -0.5, 1, 0, 0, 0, amb, dif, spec, shine)); // path to 1st house
		objectList.push(new Path(i, 0.005, 0.5, 1, 0, 0, 0, amb, dif, spec, shine)); 
	}

	for (let i = -1; i >= -11; i--) {
		objectList.push(new Path(-25.5, 0.005, i, 1, 0, 0, 0, amb, dif, spec, shine)); // path to 1st house
		objectList.push(new Path(-24.5, 0.005, i, 1, 0, 0, 0, amb, dif, spec, shine)); 
	}

	objectList.push(new HouseBottom(25, 4, -13, 8, 0, 0, 0, amb, dif, spec, shine)); // 2nd house
	objectList.push(new HouseTopBrick(25, 8, -13, 4.5, 0, 0, 0, amb, dif, spec, shine)); // 2nd house
	objectList.push(new Chimney(28, 11, -13, 1.5, 0, 0, 0, amb, dif, spec, shine)); // 2nd house
	
	for (let i = 5; i <= 25; i++) {
		objectList.push(new Path(i, 0.005, -0.5, 1, 0, 0, 0, amb, dif, spec, shine)); // path to 1st house
		objectList.push(new Path(i, 0.005, 0.5, 1, 0, 0, 0, amb, dif, spec, shine)); 
	}

	for (let i = -1; i >= -9; i--) {
		objectList.push(new Path(25.5, 0.005, i, 1, 0, 0, 0, amb, dif, spec, shine)); // path to 1st house
		objectList.push(new Path(24.5, 0.005, i, 1, 0, 0, 0, amb, dif, spec, shine)); 
	}

	objectList.push(new HouseBottom(0, 4, 23, 8, 0, 180, 0, amb, dif, spec, shine)); // 3rd house
	objectList.push(new HouseTopWood(0, 8, 23, 4.5, 0, 180, 0, amb, dif, spec, shine)); // 3rd house
	objectList.push(new Chimney(3, 11, 23, 1.5, 0, 0, 0, amb, dif, spec, shine)); // 3rd house

	for (let i = 5; i <= 20; i++) {
		objectList.push(new Path(-0.5, 0.005, i, 1, 0, 0, 0, amb, dif, spec, shine)); // path to main house
		objectList.push(new Path(0.5, 0.005, i, 1, 0, 0, 0, amb, dif, spec, shine)); 
	}

	objectList.push(new HouseBottom(17, 4, 14, 8, 0, 180, 0, amb, dif, spec, shine)); // 4th house
	objectList.push(new HouseTopBrick(17, 8, 14, 4.5, 0, 180, 0, amb, dif, spec, shine)); // 4th house
	objectList.push(new Chimney(20, 11, 14, 1.5, 0, 0, 0, amb, dif, spec, shine)); // 4th house

	for (let i = 1; i <= 10; i++) {
		objectList.push(new Path(17.5, 0.005, i, 1, 0, 0, 0, amb, dif, spec, shine)); // path to 5th house
		objectList.push(new Path(16.5, 0.005, i, 1, 0, 0, 0, amb, dif, spec, shine)); 
	}

	objectList.push(new HouseBottom(-17, 4, 13, 8, 0, 180, 0, amb, dif, spec, shine)); // 5th house
	objectList.push(new HouseTopWood(-17, 8, 13, 4.5, 0, 180, 0, amb, dif, spec, shine)); // 5th house
	objectList.push(new Chimney(-14, 11, 13, 1.5, 0, 0, 0, amb, dif, spec, shine)); // 5th house

	for (let i = 1; i <= 9; i++) {
		objectList.push(new Path(-17.5, 0.005, i, 1, 0, 0, 0, amb, dif, spec, shine)); // path to 5th house
		objectList.push(new Path(-16.5, 0.005, i, 1, 0, 0, 0, amb, dif, spec, shine)); 
	}

	for (let i = 0; i < 75; i++) { // top trees
		var x = Math.floor(Math.random() * (Math.floor(48) - Math.ceil(-48) + 1) + Math.ceil(-48));
		var z = Math.floor(Math.random() * (Math.floor(-30) - Math.ceil(-48) + 1) + Math.ceil(-48));
		objectList.push(new TreeBottomTriangle(x, 0.0, z, 1, 0, 0, 0, amb, dif, spec, shine));
		objectList.push(new TreeTopTriangle(x, 1.5, z, 1, 0, 0, 0, amb, dif, spec, shine));
		objectList.push(new TreeTopTriangle(x, 3.5, z, 0.8, 0, 0, 0, amb, dif, spec, shine));
		objectList.push(new TreeTopTriangle(x, 5.5, z, 0.5, 0, 0, 0, amb, dif, spec, shine));
	}

	for (let i = 0; i < 75; i++) { // left trees
		var x = Math.floor(Math.random() * (Math.floor(-35) - Math.ceil(-48) + 1) + Math.ceil(-48));
		var z = Math.floor(Math.random() * (Math.floor(31) - Math.ceil(-28) + 1) + Math.ceil(-28));

		objectList.push(new TreeBottomTriangle(x, 0.0, z, 1, 0, 0, 0, amb, dif, spec, shine));
		objectList.push(new TreeTopTriangle(x, 1.5, z, 1, 0, 0, 0, amb, dif, spec, shine));
		objectList.push(new TreeTopTriangle(x, 3.5, z, 0.8, 0, 0, 0, amb, dif, spec, shine));
		objectList.push(new TreeTopTriangle(x, 5.5, z, 0.5, 0, 0, 0, amb, dif, spec, shine));
	}

	for (let i = 0; i < 75; i++) { // bottom trees
		var x = Math.floor(Math.random() * (Math.floor(48) - Math.ceil(-48) + 1) + Math.ceil(-48));
		var z = Math.floor(Math.random() * (Math.floor(48) - Math.ceil(33) + 1) + Math.ceil(33));
		objectList.push(new TreeBottomTriangle(x, 0.0, z, 1, 0, 0, 0, amb, dif, spec, shine));
		objectList.push(new TreeTopTriangle(x, 1.5, z, 1, 0, 0, 0, amb, dif, spec, shine));
		objectList.push(new TreeTopTriangle(x, 3.5, z, 0.8, 0, 0, 0, amb, dif, spec, shine));
		objectList.push(new TreeTopTriangle(x, 5.5, z, 0.5, 0, 0, 0, amb, dif, spec, shine));
	}

	for (let i = 0; i < 75; i++) { // right trees
		var x = Math.floor(Math.random() * (Math.floor(48) - Math.ceil(35) + 1) + Math.ceil(35));
		var z = Math.floor(Math.random() * (Math.floor(31) - Math.ceil(-28) + 1) + Math.ceil(-28));
		objectList.push(new TreeBottomTriangle(x, 0.0, z, 1, 0, 0, 0, amb, dif, spec, shine));
		objectList.push(new TreeTopTriangle(x, 1.5, z, 1, 0, 0, 0, amb, dif, spec, shine));
		objectList.push(new TreeTopTriangle(x, 3.5, z, 0.8, 0, 0, 0, amb, dif, spec, shine));
		objectList.push(new TreeTopTriangle(x, 5.5, z, 0.5, 0, 0, 0, amb, dif, spec, shine));
	}

	makeTree(13, -13);
	makeTree(5, 13);
	makeTree(-7, 10);
	makeTree(-15, -20);
	makeTree(-28, 0);

	for (let i = 0; i < 100; i++) {
		var x = Math.floor(Math.random() * (Math.floor(48) - Math.ceil(-48) + 1) + Math.ceil(-48));
		var z = Math.floor(Math.random() * (Math.floor(30) - Math.ceil(-30) + 1) + Math.ceil(-30));
		var temp = [];
		var xz = vec2(x, z);

		if (!temp.includes(xz)) {
			temp.push(xz);
			cloudList.push(new Cloud(x, 25, z, 4, 0, 0, 0, amb, dif, spec, shine));
		} else {
			i-=1;
		}
	}

	objectList.push(new EnvMapCube(0, 7, 0, 4, 0, 0, 0, amb, dif, spec, shine));
	
	window.addEventListener("keydown", keyBoardFunction);

	window.addEventListener("click", clickDiamond);
	
    render();
};

var bgSlimeJumpCount = 0;
var smSlimeJumpCount = 10;

function render(){
    setTimeout(function() {
		requestAnimationFrame(render);
    	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		for (var i = 0; i<objectList.length; i++) {
            objectList[i].draw();
        }

		// Slime split and merge animation while jumping
		if (bgSlimeJumpCount != 10) {
			for (let i = 0; i < bigSlime.length; i++) {
				bigSlime[i].draw();
				bigSlime[i].ty += 0.2;
				bigSlime[i].updateModelMatrix();
			}
			bgSlimeJumpCount++;

			if (bgSlimeJumpCount == 9) {
				for (let i = 0; i < smallSlime.length; i++) {
					smallSlime[i].ty = 2.3;
					smallSlime[i].updateModelMatrix();
				}
				smSlimeJumpCount = 10;
			}
		} else if(smSlimeJumpCount != 0) {
			for (let i = 0; i < smallSlime.length; i++) {
				smallSlime[i].draw();
				smallSlime[i].ty -= 0.2;
				smallSlime[i].updateModelMatrix();
			}
			smSlimeJumpCount--;

			if (smSlimeJumpCount == 1) {
				for (let i = 0; i < bigSlime.length; i++) {
					bigSlime[i].ty = 1;
					bigSlime[i].updateModelMatrix();
				}	
				bgSlimeJumpCount = 0;
			}
		}

		// Cloud moving and randomly generating animation
		for (var i = 0; i<cloudList.length; i++) {
			var x = cloudList[i].tx - 1;
			if (x < -48) {
				cloudList[i].tx = 48;
				cloudList[i].tz = Math.floor(Math.random() * (Math.floor(48) - Math.ceil(-30) + 1) + Math.ceil(-48));
			} else {
				cloudList[i].tx = x;
			}
			cloudList[i].updateModelMatrix();
			cloudList[i].draw();   
        }

		for (var i = 0; i<diamonds.length; i++) {
			diamonds[i].draw();   
        }

		rotatingCamAngle = (rotatingCamAngle + 1) % 360;
		this.rotateCamera(rotatingCamAngle, 20, 35);

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
		case "s":
			// if main camera is on swap to rotating camera
			if (mainCamOn) {
				camera1 = rotatingCam;
			} else {
				camera1 = mainCam;
			}
			mainCamOn = !mainCamOn
			break;
	}

	// Main camera movement control
	if (mainCamOn) {
		switch (event.key) {
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

function makeSlime(x, z, rotateY = 0) {
	bigSlime.push(new Slime(x, 1, z, 2, 0, rotateY, 0, amb, dif, spec, shine));
	smallSlime.push(new Slime(x-0.75, 2.5, z, 1, 0, rotateY, 0, amb, dif, spec, shine));
	smallSlime.push(new Slime(x+0.75, 2.5, z, 1, 0, rotateY, 0, amb, dif, spec, shine));
}

function rotateCamera(angle, r , h){
    let radian = angle * Math.PI / 180;
    x = r*Math.sin(radian);
    y = h;
    z = r*Math.cos(radian);
    rotatingCam.vrp = vec3(x,y,z);
    rotatingCam.n = normalize(subtract(rotatingCam.vrp, vec3(0,0,0)));
    let tempV = vec3(0,1,0);
    rotatingCam.u = normalize(cross(tempV,rotatingCam.n));
    rotatingCam.v = normalize(cross(rotatingCam.n,rotatingCam.u));
    rotatingCam.updateCameraMatrix();
}

function clickDiamond(event) {
	let clippingXPos = 2 * (event.clientX / document.getElementById('gl-canvas').width) - 1;
	let clippingYPos = 1 - 2 * (event.clientY / document.getElementById('gl-canvas').height);
	let pFront = vec4(clippingXPos, clippingYPos, -1, 1);

	let inverseProjection = inverse(camera1.projectionMatrix);
	let pCam = mult(inverseProjection, pFront);

	pCam[0] /= pCam[3];
	pCam[1] /= pCam[3];
	pCam[2] /= pCam[3];
	pCam[3] /= pCam[3];

	let inverseCamera = inverse(camera1.cameraMatrix);
	let pWorld = mult(inverseCamera, pCam);
	pWorld[0] /= pWorld[3];
	pWorld[1] /= pWorld[3];
	pWorld[2] /= pWorld[3];
	pWorld[3] /= pWorld[3];

	for (let i = 0; i < diamonds.length; i++) {
		let lastDiamond = diamonds[diamonds.length - 1];
		if ((Math.abs(diamonds[i].tx - pWorld[0]) < (diamonds[i].scale * 0.5)) && (Math.abs(diamonds[i].ty - pWorld[1]) < (diamonds[i].scale * 0.5))) { 
			if (diamonds.length < 2) {
				diamonds.push(new Diamond(lastDiamond.tx, lastDiamond.ty+2, lastDiamond.tz, lastDiamond.scale, 0, 0, 0, amb, dif, spec, shine));
			} else {
				let newDiamond = diamonds[0];
				diamonds = [newDiamond];
			}
			break;
		} else if ((Math.abs(diamonds[i].tx - pWorld[0]) < (diamonds[i].scale * 0.5)) && (Math.abs(diamonds[i].tz - pWorld[2]) < (diamonds[i].scale * 0.5))) { 
			if (diamonds.length < 2) {
				diamonds.push(new Diamond(lastDiamond.tx, lastDiamond.ty+2, lastDiamond.tz, lastDiamond.scale, 0, 0, 0, amb, dif, spec, shine));
			} else {
				let newDiamond = diamonds[0];
				diamonds = [newDiamond];
			}
			break;
		} else if ((Math.abs(diamonds[i].ty - pWorld[1]) < (diamonds[i].scale * 0.5)) && (Math.abs(diamonds[i].tz - pWorld[2]) < (diamonds[i].scale * 0.5))) {
			if (diamonds.length < 2) {
				diamonds.push(new Diamond(lastDiamond.tx, lastDiamond.ty+2, lastDiamond.tz, lastDiamond.scale, 0, 0, 0, amb, dif, spec, shine));
			} else {
				let newDiamond = diamonds[0];
				diamonds = [newDiamond];
			}
			break;
		}
	}
}