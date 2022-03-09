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

var camera1 = new Camera(vec3(0,5,5), vec3(1,0,0), vec3(0,1,0), vec3(0,0,1));
camera1.setRotationX(-45);

var light1 = new Light(vec3(0,0,0), vec3(0,-1,-1), vec4(0.2,0.2,0.2,1.0), vec4(0.5,0.5,0.5,1), vec4(0.4,0.4,0.4,1), 0, 0, 1); // directional light
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
var cube;
var skyCube;
var slime;
var houseBottom;

window.onload = function init(){
    canvas = document.getElementById( "gl-canvas" );
    gl = canvas.getContext('webgl2');
    if ( !gl ) { alert( "WebGL 2.0 isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.9, 0.9, 0.9, 1.0 );
    gl.enable(gl.DEPTH_TEST);

    var amb = vec4(0.7,0.7,0.7,1.0);
    var dif = vec4(0.9,0.9,0.9,1.0);
    var spec = vec4(1.0,1.0,1.0,1.0);
    var shine = 100.0
	skyCube = new SkyCube(0, 0, 0, 2, 0, 0, 0, amb, dif, spec, shine);
    groundPlane = new GroundPlane(0, 0, 0, 100, 0, 0, 0, amb, dif, spec, shine);
	cube = new Cube(0, 1, 0, 2, 0, 0, 0, amb, dif, spec, shine);
	slime = new Slime(-2, 1, 0, 2, 0, 0, 0, amb, dif, spec, shine);
	houseBottom = new HouseBottom(0, 1, 0, 8, 0, 0, 0, amb, dif, spec, shine)
	
	window.addEventListener("keydown", keyBoardFunction);
	
    render();
};

function render(){
    setTimeout(function(){
		requestAnimationFrame(render);
    	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		let beforePos = camera1.vrp;
		let beforeU = camera1.u;
		let beforeV = camera1.v;
		let beforeN = camera1.n;
		camera1.vrp = vec3(0,0,0);  
		camera1.updateCameraMatrix();
		// Some issue with the background that require x/y rotation slightly to correct the render
		camera1.setRotationX(0.001);

		gl.disable(gl.DEPTH_TEST);
		skyCube.draw();
		gl.enable(gl.DEPTH_TEST);

		camera1.vrp = beforePos;
		camera1.u = beforeU;
		camera1.v = beforeV;
		camera1.n = beforeN;
		camera1.updateCameraMatrix();
        groundPlane.draw();
		cube.draw();
		slime.draw();
		houseBottom.draw();

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


