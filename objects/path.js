class Path extends Drawable {
    static vertexPositions = [
        vec3(-0.5, 0.0, 0.5), // front Left
		vec3( 0.5, 0.0, 0.5), // front right
		vec3( 0.5, 0.0,-0.5), // back right
        vec3(-0.5, 0.0,-0.5) // back Left
    ];
  
    static vertexTextureCoords = [
        vec2(1,0),
        vec2(1,1),
        vec2(0,1),
        vec2(0,0)
    ];
    
    static indices = [
        0, 1, 2,
        0, 2, 3
    ];

    static vertexNormals = [];

    static positionBuffer = -1;
    static textureCoordBuffer = -1;
    static indexBuffer = -1;
    static normalBuffer = -1;

    static shaderProgram = -1;
    static aPositionShader = -1;
    static aTextureCoordShader = -1;
    static aNormalShader = -1;
    
    static uModelMatrixShader = -1;
    static uCameraMatrixShader = -1;
    static uProjectionMatrixShader = -1;

    static uMatAmbientShader = -1;
    static uMatDiffuseShader = -1;
    static uMatSpecularShader = -1;
    static uMatAlphaShader = -1;

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
    static uTextureUnit = -1;

    static imageLoaded = 0;

    static computeNormals(){
        var normalSum = [];
        var counts = [];
        
        //initialize sum of normals for each vertex and how often its used.
        for (var i = 0; i<Path.vertexPositions.length; i++) {
            normalSum.push(vec3(0, 0, 0));
            counts.push(0);
        }
        
        //for each triangle
        for (var i = 0; i<Path.indices.length; i+=3) {
            var a = Path.indices[i];
            var b = Path.indices[i+1];
            var c = Path.indices[i+2];
            
            var edge1 = subtract(Path.vertexPositions[c],Path.vertexPositions[b]);
            var edge2 = subtract(Path.vertexPositions[a],Path.vertexPositions[b]);
            var N = cross(edge1,edge2);
            
            normalSum[a] = add(normalSum[a],normalize(N));
            counts[a]++;
            normalSum[b] = add(normalSum[b],normalize(N));
            counts[b]++;
            normalSum[c] = add(normalSum[c],normalize(N));
            counts[c]++;
        
        }
            
        for (var i = 0; i < Path.vertexPositions.length; i++) {
            Path.vertexNormals[i] = mult(1.0/counts[i],normalSum[i]);
        }
    }

    static initialize() {
        Path.computeNormals();
    	Path.shaderProgram = initShaders( gl, "/glsl/lightvshader.glsl", "/glsl/lightfshader.glsl");
    	gl.useProgram(Path.shaderProgram );
		
        // Load the data into the GPU
        Path.positionBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, Path.positionBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(Path.vertexPositions), gl.STATIC_DRAW );

        Path.normalBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, Path.normalBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(Path.vertexNormals), gl.STATIC_DRAW );
        
        Path.textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, Path.textureCoordBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(Path.vertexTextureCoords), gl.STATIC_DRAW );
        
        Path.uTextureUnit = gl.getUniformLocation(Path.shaderProgram, "uTextureUnit");

        Path.indexBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Path.indexBuffer);
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(Path.indices), gl.STATIC_DRAW );
            
        // Associate our shader variables with our data buffer
        Path.aPositionShader = gl.getAttribLocation( Path.shaderProgram, "aPosition" );
        Path.aTextureCoordShader = gl.getAttribLocation( Path.shaderProgram, "aTextureCoord" );
        Path.aNormalShader = gl.getAttribLocation( Path.shaderProgram, "aNormal" );
        
        Path.uModelMatrixShader = gl.getUniformLocation( Path.shaderProgram, "modelMatrix" );
        Path.uCameraMatrixShader = gl.getUniformLocation( Path.shaderProgram, "cameraMatrix" );
        Path.uProjectionMatrixShader = gl.getUniformLocation( Path.shaderProgram, "projectionMatrix" );

        Path.uMatAmbientShader = gl.getUniformLocation( Path.shaderProgram, "matAmbient" );
		Path.uMatDiffuseShader = gl.getUniformLocation( Path.shaderProgram, "matDiffuse" );
		Path.uMatSpecularShader = gl.getUniformLocation( Path.shaderProgram, "matSpecular" );
		Path.uMatAlphaShader = gl.getUniformLocation( Path.shaderProgram, "matAlpha" );

        //directional light
		Path.uLightDirectionShader = gl.getUniformLocation( Path.shaderProgram, "lightDirection" );
		Path.uLightAmbientShader = gl.getUniformLocation( Path.shaderProgram, "lightAmbient" );
		Path.uLightDiffuseShader = gl.getUniformLocation( Path.shaderProgram, "lightDiffuse" );
		Path.uLightSpecularShader = gl.getUniformLocation( Path.shaderProgram, "lightSpecular" );

        //spotlight
		Path.uSpotLightDirectionShader = gl.getUniformLocation( Path.shaderProgram, "spotlightDirection" );
		Path.uSpotLightAmbientShader = gl.getUniformLocation( Path.shaderProgram, "spotlightAmbient" );
		Path.uSpotLightDiffuseShader = gl.getUniformLocation( Path.shaderProgram, "spotlightDiffuse" );
		Path.uSpotLightSpecularShader = gl.getUniformLocation( Path.shaderProgram, "spotlightSpecular" );
        Path.uSpotLightLoc = gl.getUniformLocation( Path.shaderProgram, "spotlightLoc");
		Path.uSpotLightAlpha = gl.getUniformLocation( Path.shaderProgram, "spotlightAlpha");
		Path.uSpotLightCutoff = gl.getUniformLocation( Path.shaderProgram, "spotlightCutoff");
        Path.uSpotLightStatus = gl.getUniformLocation( Path.shaderProgram, "spotlightStatus");

    }
    
    static initializeTexture(){
        var image = new Image();

        image.onload = function(){
            Path.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, Path.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, image.width, image.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image);
            
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            
            Path.imageLoaded++;
        }
        
        image.src = "./textures/stone.png";
    }
    
    constructor(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh){
        super(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh);
        if(Path.shaderProgram == -1){
            Path.initialize()
            Path.initializeTexture();
        }
        
    }
    
    draw() {
        if((Path.texture == -1) || (Path.imageLoaded != 1)) { //only draw when texture is loaded.
        	return;
        }
        
        gl.useProgram(Path.shaderProgram);
        
        gl.bindBuffer( gl.ARRAY_BUFFER, Path.positionBuffer);
       	gl.vertexAttribPointer(Path.aPositionShader, 3, gl.FLOAT, false, 0, 0 );
        
        gl.bindBuffer( gl.ARRAY_BUFFER, Path.normalBuffer);
       	gl.vertexAttribPointer(Path.aNormalShader, 3, gl.FLOAT, false, 0, 0 );
       	
       	gl.bindBuffer( gl.ARRAY_BUFFER, Path.textureCoordBuffer);
       	gl.vertexAttribPointer(Path.aTextureCoordShader, 2, gl.FLOAT, false, 0, 0 );
       	
       	gl.activeTexture(gl.TEXTURE0);
       	gl.bindTexture(gl.TEXTURE_2D, Path.texture);
       	gl.uniform1i(Path.uTextureUnit,0);

	
       	gl.uniformMatrix4fv(Path.uModelMatrixShader, false, flatten(this.modelMatrix));
        gl.uniformMatrix4fv(Path.uCameraMatrixShader, false, flatten(camera1.cameraMatrix));
        gl.uniformMatrix4fv(Path.uProjectionMatrixShader, false, flatten(camera1.projectionMatrix));

        gl.uniform4fv(Path.uMatAmbientShader, this.matAmbient);
		gl.uniform4fv(Path.uMatDiffuseShader, this.matDiffuse);
		gl.uniform4fv(Path.uMatSpecularShader, this.matSpecular);
		gl.uniform1f(Path.uMatAlphaShader, this.matAlpha);

        //directional light
		gl.uniform3fv(Path.uLightDirectionShader, light1.direction);
		gl.uniform4fv(Path.uLightAmbientShader, light1.ambient);
		gl.uniform4fv(Path.uLightDiffuseShader, light1.diffuse);
		gl.uniform4fv(Path.uLightSpecularShader, light1.specular);

        //spotlight
		gl.uniform3fv(Path.uSpotLightDirectionShader, light2.direction);
		gl.uniform4fv(Path.uSpotLightAmbientShader, light2.ambient);
		gl.uniform4fv(Path.uSpotLightDiffuseShader, light2.diffuse);
		gl.uniform4fv(Path.uSpotLightSpecularShader, light2.specular);
        gl.uniform3fv(Path.uSpotLightLoc, light2.location);
		gl.uniform1f(Path.uSpotLightAlpha, light2.alpha); 
		gl.uniform1f(Path.uSpotLightCutoff, light2.cutoff); 
        gl.uniform1f(Path.uSpotLightStatus, light2.status); 
                    
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Path.indexBuffer);
	
        gl.enableVertexAttribArray(Path.aPositionShader);    
        gl.enableVertexAttribArray(Path.aTextureCoordShader);
        gl.enableVertexAttribArray(Path.aNormalShader);    
    	gl.drawElements(gl.TRIANGLES, Path.indices.length, gl.UNSIGNED_INT, 0);
    	gl.disableVertexAttribArray(Path.aPositionShader);    
    	gl.disableVertexAttribArray(Path.aTextureCoordShader);    
        gl.disableVertexAttribArray(Path.aNormalShader);    
    }
}


