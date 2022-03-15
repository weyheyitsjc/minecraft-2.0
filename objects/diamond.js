class Diamond extends Drawable{
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

    static vertexNormals = [];

    static positionBuffer = -1;
    static indexBuffer = -1;
    static normalBuffer = -1;

    static shaderProgram = -1;
    static aPositionShader = -1;
    static aNormalShader = -1;

    static uModelMatrixShader = -1;
    static uCameraMatrixShader = -1;
    static uProjectionMatrixShader = -1;
    
    static uLightDirectionShader = -1;
    static uLightAmbientShader = -1;
    static uLightDiffuseShader = -1;
    static uLightSpecularShader = -1;

    static uSpotLightDirectionShader = -1;
    static uSpotLightAmbientShader = -1;
    static uSpotLightDiffuseShader = -1;
    static uSpotLightSpecularShader = -1;
    static uSpotLightLoc = -1;
	static uSpotLightAlpha = -1;
	static uSpotLightCutoff = -1;
    static uSpotLightStatus = -1;

    static texture = -1;
    static textureUnit = -1;

    static imageLoaded = 0;

    static computeNormals(){
        var normalSum = [];
        var counts = [];
        
        //initialize sum of normals for each vertex and how often its used.
        for (var i = 0; i<Diamond.vertexPositions.length; i++) {
            normalSum.push(vec3(0, 0, 0));
            counts.push(0);
        }
        
        //for each triangle
        for (var i = 0; i<Diamond.indices.length; i+=3) {
            var a = Diamond.indices[i];
            var b = Diamond.indices[i+1];
            var c = Diamond.indices[i+2];
            
            var edge1 = subtract(Diamond.vertexPositions[c],Diamond.vertexPositions[b]);
            var edge2 = subtract(Diamond.vertexPositions[a],Diamond.vertexPositions[b]);
            var N = cross(edge1,edge2);
            
            normalSum[a] = add(normalSum[a],normalize(N));
            counts[a]++;
            normalSum[b] = add(normalSum[b],normalize(N));
            counts[b]++;
            normalSum[c] = add(normalSum[c],normalize(N));
            counts[c]++;
        
        }
        for (var i = 0; i < Diamond.vertexPositions.length; i++) {
            Diamond.vertexNormals[i] = mult(1.0/counts[i],normalSum[i]);
        }
    }

    static initialize() {
        Diamond.computeNormals();
    	Diamond.shaderProgram = initShaders( gl, "/glsl/lightcubevshader.glsl", "/glsl/lightcubefshader.glsl");
    	gl.useProgram(Diamond.shaderProgram );
		
        // Load the data into the GPU
        Diamond.positionBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, Diamond.positionBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(Diamond.vertexPositions), gl.STATIC_DRAW );
        
        Diamond.textureUnit = gl.getUniformLocation(Diamond.shaderProgram, "textureUnit");

        Diamond.normalBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, Diamond.normalBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(Diamond.vertexNormals), gl.STATIC_DRAW );

        Diamond.indexBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Diamond.indexBuffer);
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(Diamond.indices), gl.STATIC_DRAW );
            
        // Associate our shader variables with our data buffer
        Diamond.aPositionShader = gl.getAttribLocation( Diamond.shaderProgram, "aPosition" );
        Diamond.aNormalShader = gl.getAttribLocation( Diamond.shaderProgram, "aNormal" );
        
        Diamond.uModelMatrixShader = gl.getUniformLocation( Diamond.shaderProgram, "modelMatrix" );
        Diamond.uCameraMatrixShader = gl.getUniformLocation( Diamond.shaderProgram, "cameraMatrix" );
        Diamond.uProjectionMatrixShader = gl.getUniformLocation( Diamond.shaderProgram, "projectionMatrix" );

        Diamond.uMatAmbientShader = gl.getUniformLocation( Diamond.shaderProgram, "matAmbient" );
		Diamond.uMatDiffuseShader = gl.getUniformLocation( Diamond.shaderProgram, "matDiffuse" );
		Diamond.uMatSpecularShader = gl.getUniformLocation( Diamond.shaderProgram, "matSpecular" );
		Diamond.uMatAlphaShader = gl.getUniformLocation( Diamond.shaderProgram, "matAlpha" );

        //directional light
		Diamond.uLightDirectionShader = gl.getUniformLocation( Diamond.shaderProgram, "lightDirection" );
		Diamond.uLightAmbientShader = gl.getUniformLocation( Diamond.shaderProgram, "lightAmbient" );
		Diamond.uLightDiffuseShader = gl.getUniformLocation( Diamond.shaderProgram, "lightDiffuse" );
		Diamond.uLightSpecularShader = gl.getUniformLocation( Diamond.shaderProgram, "lightSpecular" );

        //spotlight
		Diamond.uSpotLightDirectionShader = gl.getUniformLocation( Diamond.shaderProgram, "spotlightDirection" );
		Diamond.uSpotLightAmbientShader = gl.getUniformLocation( Diamond.shaderProgram, "spotlightAmbient" );
		Diamond.uSpotLightDiffuseShader = gl.getUniformLocation( Diamond.shaderProgram, "spotlightDiffuse" );
		Diamond.uSpotLightSpecularShader = gl.getUniformLocation( Diamond.shaderProgram, "spotlightSpecular" );
        Diamond.uSpotLightLoc = gl.getUniformLocation( Diamond.shaderProgram, "spotlightLoc");
		Diamond.uSpotLightAlpha = gl.getUniformLocation( Diamond.shaderProgram, "spotlightAlpha");
		Diamond.uSpotLightCutoff = gl.getUniformLocation( Diamond.shaderProgram, "spotlightCutoff");
        Diamond.uSpotLightStatus = gl.getUniformLocation( Diamond.shaderProgram, "spotlightStatus");

    }
    
    static initializeTexture(){
        var imagePX = new Image();
        var imageNX = new Image();
        var imagePY = new Image();
        var imageNY = new Image();
        var imagePZ = new Image();
        var imageNZ = new Image();
        
        Diamond.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, Diamond.texture);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);


        imagePX.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, Diamond.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imagePX);
            
            Diamond.imageLoaded++;
        };
        
        imagePX.src = "./textures/diamond.jpg";


        imageNX.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, Diamond.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imageNX);
            
            Diamond.imageLoaded++;
        };

        imageNX.src = "./textures/diamond.jpg";

        imagePY.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, Diamond.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imagePY);
            
            Diamond.imageLoaded++;
        };

        imagePY.src = "./textures/diamond.jpg";


        imageNY.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, Diamond.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imageNY);
            
            Diamond.imageLoaded++;
        };

        imageNY.src = "./textures/diamond.jpg";


        imagePZ.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, Diamond.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imagePZ);
        
            Diamond.imageLoaded++;
        };
        
        imagePZ.src = "./textures/diamond.jpg";

        imageNZ.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, Diamond.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imageNZ);
            
            Diamond.imageLoaded++;
        };

        imageNZ.src = "./textures/diamond.jpg";

    }
    
    constructor(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh){
        super(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh);
        if(Diamond.shaderProgram == -1){
            Diamond.initialize()
            Diamond.initializeTexture();
        }
        
    }
    
    draw() {
        if((Diamond.texture == -1) || (Diamond.imageLoaded != 6)) { //only draw when texture is loaded.
        	return;
        }
        
        gl.useProgram(Diamond.shaderProgram);
        
        gl.bindBuffer( gl.ARRAY_BUFFER, Diamond.positionBuffer);
       	gl.vertexAttribPointer(Diamond.aPositionShader, 3, gl.FLOAT, false, 0, 0 );
       	
       	gl.activeTexture(gl.TEXTURE0);
       	gl.bindTexture(gl.TEXTURE_CUBE_MAP, Diamond.texture);
       	gl.uniform1i(Diamond.textureUnit,0);
        
        gl.bindBuffer( gl.ARRAY_BUFFER, Diamond.normalBuffer);
       	gl.vertexAttribPointer(Diamond.aNormalShader, 3, gl.FLOAT, false, 0, 0 );
	
       	gl.uniformMatrix4fv(Diamond.uModelMatrixShader, false, flatten(this.modelMatrix));
        gl.uniformMatrix4fv(Diamond.uCameraMatrixShader, false, flatten(camera1.cameraMatrix));
        gl.uniformMatrix4fv(Diamond.uProjectionMatrixShader, false, flatten(camera1.projectionMatrix));

        gl.uniform4fv(Diamond.uMatAmbientShader, this.matAmbient);
		gl.uniform4fv(Diamond.uMatDiffuseShader, this.matDiffuse);
		gl.uniform4fv(Diamond.uMatSpecularShader, this.matSpecular);
		gl.uniform1f(Diamond.uMatAlphaShader, this.matAlpha);

        //directional light
		gl.uniform3fv(Diamond.uLightDirectionShader, light1.direction);
		gl.uniform4fv(Diamond.uLightAmbientShader, light1.ambient);
		gl.uniform4fv(Diamond.uLightDiffuseShader, light1.diffuse);
		gl.uniform4fv(Diamond.uLightSpecularShader, light1.specular);

        //spotlight
		gl.uniform3fv(Diamond.uSpotLightDirectionShader, light2.direction);
		gl.uniform4fv(Diamond.uSpotLightAmbientShader, light2.ambient);
		gl.uniform4fv(Diamond.uSpotLightDiffuseShader, light2.diffuse);
		gl.uniform4fv(Diamond.uSpotLightSpecularShader, light2.specular);
        gl.uniform3fv(Diamond.uSpotLightLoc, light2.location);
		gl.uniform1f(Diamond.uSpotLightAlpha, light2.alpha); 
		gl.uniform1f(Diamond.uSpotLightCutoff, light2.cutoff); 
        gl.uniform1f(Diamond.uSpotLightStatus, light2.status); 
                    
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Diamond.indexBuffer);
	
        gl.enableVertexAttribArray(Diamond.aPositionShader);  
        gl.enableVertexAttribArray(Diamond.aNormalShader);    
    	gl.drawElements(gl.TRIANGLES, Diamond.indices.length, gl.UNSIGNED_INT, 0);
    	gl.disableVertexAttribArray(Diamond.aPositionShader);    
        gl.disableVertexAttribArray(Diamond.aNormalShader);    

    }
}