class SkyCube extends Drawable{
    static vertexPositions = [
    	vec3(-0.5,-0.5,0.5),
    	vec3(-0.5,0.5,0.5),
    	vec3(0.5,0.5,0.5),
    	vec3(0.5,-0.5,0.5),
    	vec3(-0.5,-0.5,-0.5),
    	vec3(-0.5,0.5,-0.5),
    	vec3(0.5,0.5,-0.5),
    	vec3(0.5,-0.5,-0.5)
    ];

    static indices = [
        0,3,2,
		0,2,1,
		2,3,7,
		2,7,6, 
		0,4,7,
		0,7,3,
		1,2,6,
		1,6,5,
		4,5,6,
		4,6,7,
		0,1,5,
		0,5,4
	];    

    static positionBuffer = -1;
    static indexBuffer = -1;

    static shaderProgram = -1;
    static aPositionShader = -1;
    
    static uModelMatrixShader = -1;
    static uCameraMatrixShader = -1;
    static uProjectionMatrixShader = -1;
    
    static texture = -1;
    static textureUnit = -1;

    static imageLoaded = 0;
    
    static initialize() {
    	SkyCube.shaderProgram = initShaders( gl, "/glsl/cubevshader.glsl", "/glsl/cubefshader.glsl");
    	gl.useProgram(SkyCube.shaderProgram );
		
        // Load the data into the GPU
        SkyCube.positionBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, SkyCube.positionBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(SkyCube.vertexPositions), gl.STATIC_DRAW );
        
        SkyCube.textureUnit = gl.getUniformLocation(SkyCube.shaderProgram, "textureUnit");

        SkyCube.indexBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, SkyCube.indexBuffer);
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(SkyCube.indices), gl.STATIC_DRAW );
            
        // Associate our shader variables with our data buffer
        SkyCube.aPositionShader = gl.getAttribLocation( SkyCube.shaderProgram, "aPosition" );
        
        SkyCube.uModelMatrixShader = gl.getUniformLocation( SkyCube.shaderProgram, "modelMatrix" );
        SkyCube.uCameraMatrixShader = gl.getUniformLocation( SkyCube.shaderProgram, "cameraMatrix" );
        SkyCube.uProjectionMatrixShader = gl.getUniformLocation( SkyCube.shaderProgram, "projectionMatrix" );

    }
    
    static initializeTexture(){
        var imagePX = new Image();
        var imageNX = new Image();
        var imagePY = new Image();
        var imageNY = new Image();
        var imagePZ = new Image();
        var imageNZ = new Image();
        
        SkyCube.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, SkyCube.texture);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);


        imagePX.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, SkyCube.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imagePX);
            
            SkyCube.imageLoaded += 1;
        };
        
        imagePX.src = "./textures/sky-right.jpg";


        imageNX.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, SkyCube.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imageNX);
            
            SkyCube.imageLoaded += 1;
        };

        imageNX.src = "./textures/sky-left.jpg";

        imagePY.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, SkyCube.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imagePY);
            
            SkyCube.imageLoaded += 1;
        };

        imagePY.src = "./textures/sky-top.jpg";


        imageNY.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, SkyCube.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imageNY);
            
            SkyCube.imageLoaded += 1;
        };

        imageNY.src = "./textures/sky-bottom.jpg";


        imagePZ.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, SkyCube.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imagePZ);
        
            SkyCube.imageLoaded += 1;
        };
        
        imagePZ.src = "./textures/sky-front.jpg";

        imageNZ.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, SkyCube.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imageNZ);
            
            SkyCube.imageLoaded += 1;
        };

        imageNZ.src = "./textures/sky-back.jpg";

    }
    
    constructor(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh){
        super(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh);
        if(SkyCube.shaderProgram == -1){
            SkyCube.initialize()
            SkyCube.initializeTexture();
        }
        
    }
    
    draw() {
        if(SkyCube.texture == -1 && SkyCube.imageLoaded != 6)  //only draw when texture is loaded.
        	return;
        
        gl.useProgram(SkyCube.shaderProgram);
        
        gl.bindBuffer( gl.ARRAY_BUFFER, SkyCube.positionBuffer);
       	gl.vertexAttribPointer(SkyCube.aPositionShader, 3, gl.FLOAT, false, 0, 0 );
       	
       	gl.activeTexture(gl.TEXTURE0);
       	gl.bindTexture(gl.TEXTURE_CUBE_MAP, SkyCube.texture);
       	gl.uniform1i(SkyCube.textureUnit,0);
	
       	gl.uniformMatrix4fv(SkyCube.uModelMatrixShader, false, flatten(this.modelMatrix));
        gl.uniformMatrix4fv(SkyCube.uCameraMatrixShader, false, flatten(camera1.cameraMatrix));
        gl.uniformMatrix4fv(SkyCube.uProjectionMatrixShader, false, flatten(camera1.projectionMatrix));
                    
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, SkyCube.indexBuffer);
	
        gl.enableVertexAttribArray(SkyCube.aPositionShader);    
    	gl.drawElements(gl.TRIANGLES, SkyCube.indices.length, gl.UNSIGNED_INT, 0);
    	gl.disableVertexAttribArray(SkyCube.aPositionShader);    
    }
}