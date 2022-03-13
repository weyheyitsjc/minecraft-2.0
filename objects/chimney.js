class Chimney extends Drawable{
    static vertexPositions = [
    	vec3(-0.5,-1,0.5),
    	vec3(-0.5,1,0.5),
    	vec3(0.5,1,0.5),
    	vec3(0.5,-1,0.5),
    	vec3(-0.5,-1,-0.5),
    	vec3(-0.5,1,-0.5),
    	vec3(0.5,1,-0.5),
    	vec3(0.5,-1,-0.5)
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
        for (var i = 0; i<Chimney.vertexPositions.length; i++) {
            normalSum.push(vec3(0, 0, 0));
            counts.push(0);
        }
        
        //for each triangle
        for (var i = 0; i<Chimney.indices.length; i+=3) {
            var a = Chimney.indices[i];
            var b = Chimney.indices[i+1];
            var c = Chimney.indices[i+2];
            
            var edge1 = subtract(Chimney.vertexPositions[c],Chimney.vertexPositions[b]);
            var edge2 = subtract(Chimney.vertexPositions[a],Chimney.vertexPositions[b]);
            var N = cross(edge1,edge2);
            
            normalSum[a] = add(normalSum[a],normalize(N));
            counts[a]++;
            normalSum[b] = add(normalSum[b],normalize(N));
            counts[b]++;
            normalSum[c] = add(normalSum[c],normalize(N));
            counts[c]++;
        
        }
        for (var i = 0; i < Chimney.vertexPositions.length; i++) {
            Chimney.vertexNormals[i] = mult(1.0/counts[i],normalSum[i]);
        }
    }

    static initialize() {
        Chimney.computeNormals();
    	Chimney.shaderProgram = initShaders( gl, "/glsl/lightcubevshader.glsl", "/glsl/lightcubefshader.glsl");
    	gl.useProgram(Chimney.shaderProgram );
		
        // Load the data into the GPU
        Chimney.positionBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, Chimney.positionBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(Chimney.vertexPositions), gl.STATIC_DRAW );
        
        Chimney.textureUnit = gl.getUniformLocation(Chimney.shaderProgram, "textureUnit");

        Chimney.normalBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, Chimney.normalBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(Chimney.vertexNormals), gl.STATIC_DRAW );

        Chimney.indexBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Chimney.indexBuffer);
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(Chimney.indices), gl.STATIC_DRAW );
            
        // Associate our shader variables with our data buffer
        Chimney.aPositionShader = gl.getAttribLocation( Chimney.shaderProgram, "aPosition" );
        Chimney.aNormalShader = gl.getAttribLocation( Chimney.shaderProgram, "aNormal" );
        
        Chimney.uModelMatrixShader = gl.getUniformLocation( Chimney.shaderProgram, "modelMatrix" );
        Chimney.uCameraMatrixShader = gl.getUniformLocation( Chimney.shaderProgram, "cameraMatrix" );
        Chimney.uProjectionMatrixShader = gl.getUniformLocation( Chimney.shaderProgram, "projectionMatrix" );

        Chimney.uMatAmbientShader = gl.getUniformLocation( Chimney.shaderProgram, "matAmbient" );
		Chimney.uMatDiffuseShader = gl.getUniformLocation( Chimney.shaderProgram, "matDiffuse" );
		Chimney.uMatSpecularShader = gl.getUniformLocation( Chimney.shaderProgram, "matSpecular" );
		Chimney.uMatAlphaShader = gl.getUniformLocation( Chimney.shaderProgram, "matAlpha" );

        //directional light
		Chimney.uLightDirectionShader = gl.getUniformLocation( Chimney.shaderProgram, "lightDirection" );
		Chimney.uLightAmbientShader = gl.getUniformLocation( Chimney.shaderProgram, "lightAmbient" );
		Chimney.uLightDiffuseShader = gl.getUniformLocation( Chimney.shaderProgram, "lightDiffuse" );
		Chimney.uLightSpecularShader = gl.getUniformLocation( Chimney.shaderProgram, "lightSpecular" );

        //spotlight
		Chimney.uSpotLightDirectionShader = gl.getUniformLocation( Chimney.shaderProgram, "spotlightDirection" );
		Chimney.uSpotLightAmbientShader = gl.getUniformLocation( Chimney.shaderProgram, "spotlightAmbient" );
		Chimney.uSpotLightDiffuseShader = gl.getUniformLocation( Chimney.shaderProgram, "spotlightDiffuse" );
		Chimney.uSpotLightSpecularShader = gl.getUniformLocation( Chimney.shaderProgram, "spotlightSpecular" );
        Chimney.uSpotLightLoc = gl.getUniformLocation( Chimney.shaderProgram, "spotlightLoc");
		Chimney.uSpotLightAlpha = gl.getUniformLocation( Chimney.shaderProgram, "spotlightAlpha");
		Chimney.uSpotLightCutoff = gl.getUniformLocation( Chimney.shaderProgram, "spotlightCutoff");
        Chimney.uSpotLightStatus = gl.getUniformLocation( Chimney.shaderProgram, "spotlightStatus");

    }
    
    static initializeTexture(){
        var imagePX = new Image();
        var imageNX = new Image();
        var imagePY = new Image();
        var imageNY = new Image();
        var imagePZ = new Image();
        var imageNZ = new Image();
        
        Chimney.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, Chimney.texture);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);


        imagePX.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, Chimney.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imagePX);
            
            Chimney.imageLoaded++;
        };
        
        imagePX.src = "./textures/house/brick.png";


        imageNX.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, Chimney.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imageNX);
            
            Chimney.imageLoaded++;
        };

        imageNX.src = "./textures/house/brick.png";

        imagePY.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, Chimney.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imagePY);
            
            Chimney.imageLoaded++;
        };

        imagePY.src = "./textures/house/brick.png";


        imageNY.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, Chimney.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imageNY);
            
            Chimney.imageLoaded++;
        };

        imageNY.src = "./textures/house/brick.png";


        imagePZ.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, Chimney.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imagePZ);
        
            Chimney.imageLoaded++;
        };
        
        imagePZ.src = "./textures/house/brick.png";

        imageNZ.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, Chimney.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imageNZ);
            
            Chimney.imageLoaded++;
        };

        imageNZ.src = "./textures/house/brick.png";

    }
    
    constructor(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh){
        super(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh);
        if(Chimney.shaderProgram == -1){
            Chimney.initialize()
            Chimney.initializeTexture();
        }
        
    }
    
    draw() {
        if((Chimney.texture == -1) || (Chimney.imageLoaded != 6)) {  //only draw when texture is loaded.
        	return;
        }
        
        gl.useProgram(Chimney.shaderProgram);
        
        gl.bindBuffer( gl.ARRAY_BUFFER, Chimney.positionBuffer);
       	gl.vertexAttribPointer(Chimney.aPositionShader, 3, gl.FLOAT, false, 0, 0 );

       	gl.activeTexture(gl.TEXTURE0);
       	gl.bindTexture(gl.TEXTURE_CUBE_MAP, Chimney.texture);
       	gl.uniform1i(Chimney.textureUnit,0);

        gl.bindBuffer( gl.ARRAY_BUFFER, Chimney.normalBuffer);
       	gl.vertexAttribPointer(Chimney.aNormalShader, 3, gl.FLOAT, false, 0, 0 );
	
       	gl.uniformMatrix4fv(Chimney.uModelMatrixShader, false, flatten(this.modelMatrix));
        gl.uniformMatrix4fv(Chimney.uCameraMatrixShader, false, flatten(camera1.cameraMatrix));
        gl.uniformMatrix4fv(Chimney.uProjectionMatrixShader, false, flatten(camera1.projectionMatrix));

        gl.uniform4fv(Chimney.uMatAmbientShader, this.matAmbient);
		gl.uniform4fv(Chimney.uMatDiffuseShader, this.matDiffuse);
		gl.uniform4fv(Chimney.uMatSpecularShader, this.matSpecular);
		gl.uniform1f(Chimney.uMatAlphaShader, this.matAlpha);

        //directional light
		gl.uniform3fv(Chimney.uLightDirectionShader, light1.direction);
		gl.uniform4fv(Chimney.uLightAmbientShader, light1.ambient);
		gl.uniform4fv(Chimney.uLightDiffuseShader, light1.diffuse);
		gl.uniform4fv(Chimney.uLightSpecularShader, light1.specular);

        //spotlight
		gl.uniform3fv(Chimney.uSpotLightDirectionShader, light2.direction);
		gl.uniform4fv(Chimney.uSpotLightAmbientShader, light2.ambient);
		gl.uniform4fv(Chimney.uSpotLightDiffuseShader, light2.diffuse);
		gl.uniform4fv(Chimney.uSpotLightSpecularShader, light2.specular);
        gl.uniform3fv(Chimney.uSpotLightLoc, light2.location);
		gl.uniform1f(Chimney.uSpotLightAlpha, light2.alpha); 
		gl.uniform1f(Chimney.uSpotLightCutoff, light2.cutoff); 
        gl.uniform1f(Chimney.uSpotLightStatus, light2.status); 
                    
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Chimney.indexBuffer);
	
        gl.enableVertexAttribArray(Chimney.aPositionShader);  
        gl.enableVertexAttribArray(Chimney.aNormalShader);    
    	gl.drawElements(gl.TRIANGLES, Chimney.indices.length, gl.UNSIGNED_INT, 0);
    	gl.disableVertexAttribArray(Chimney.aPositionShader);    
        gl.disableVertexAttribArray(Chimney.aNormalShader);    

    }
}