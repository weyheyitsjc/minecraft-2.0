class Cloud extends Drawable {
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
        for (var i = 0; i<Cloud.vertexPositions.length; i++) {
            normalSum.push(vec3(0, 0, 0));
            counts.push(0);
        }
        
        //for each triangle
        for (var i = 0; i<Cloud.indices.length; i+=3) {
            var a = Cloud.indices[i];
            var b = Cloud.indices[i+1];
            var c = Cloud.indices[i+2];
            
            var edge1 = subtract(Cloud.vertexPositions[c],Cloud.vertexPositions[b]);
            var edge2 = subtract(Cloud.vertexPositions[a],Cloud.vertexPositions[b]);
            var N = cross(edge1,edge2);
            
            normalSum[a] = add(normalSum[a],normalize(N));
            counts[a]++;
            normalSum[b] = add(normalSum[b],normalize(N));
            counts[b]++;
            normalSum[c] = add(normalSum[c],normalize(N));
            counts[c]++;
        
        }
            
        for (var i = 0; i < Cloud.vertexPositions.length; i++) {
            Cloud.vertexNormals[i] = mult(1.0/counts[i],normalSum[i]);
        }
    }

    static initialize() {
        Cloud.computeNormals();
    	Cloud.shaderProgram = initShaders( gl, "/glsl/lightvshader.glsl", "/glsl/lightfshader.glsl");
    	gl.useProgram(Cloud.shaderProgram );
		
        // Load the data into the GPU
        Cloud.positionBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, Cloud.positionBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(Cloud.vertexPositions), gl.STATIC_DRAW );

        Cloud.normalBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, Cloud.normalBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(Cloud.vertexNormals), gl.STATIC_DRAW );
        
        Cloud.textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, Cloud.textureCoordBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(Cloud.vertexTextureCoords), gl.STATIC_DRAW );
        
        Cloud.uTextureUnit = gl.getUniformLocation(Cloud.shaderProgram, "uTextureUnit");

        Cloud.indexBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Cloud.indexBuffer);
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(Cloud.indices), gl.STATIC_DRAW );
            
        // Associate our shader variables with our data buffer
        Cloud.aPositionShader = gl.getAttribLocation( Cloud.shaderProgram, "aPosition" );
        Cloud.aTextureCoordShader = gl.getAttribLocation( Cloud.shaderProgram, "aTextureCoord" );
        Cloud.aNormalShader = gl.getAttribLocation( Cloud.shaderProgram, "aNormal" );
        
        Cloud.uModelMatrixShader = gl.getUniformLocation( Cloud.shaderProgram, "modelMatrix" );
        Cloud.uCameraMatrixShader = gl.getUniformLocation( Cloud.shaderProgram, "cameraMatrix" );
        Cloud.uProjectionMatrixShader = gl.getUniformLocation( Cloud.shaderProgram, "projectionMatrix" );

        Cloud.uMatAmbientShader = gl.getUniformLocation( Cloud.shaderProgram, "matAmbient" );
		Cloud.uMatDiffuseShader = gl.getUniformLocation( Cloud.shaderProgram, "matDiffuse" );
		Cloud.uMatSpecularShader = gl.getUniformLocation( Cloud.shaderProgram, "matSpecular" );
		Cloud.uMatAlphaShader = gl.getUniformLocation( Cloud.shaderProgram, "matAlpha" );

        //directional light
		Cloud.uLightDirectionShader = gl.getUniformLocation( Cloud.shaderProgram, "lightDirection" );
		Cloud.uLightAmbientShader = gl.getUniformLocation( Cloud.shaderProgram, "lightAmbient" );
		Cloud.uLightDiffuseShader = gl.getUniformLocation( Cloud.shaderProgram, "lightDiffuse" );
		Cloud.uLightSpecularShader = gl.getUniformLocation( Cloud.shaderProgram, "lightSpecular" );

        //spotlight
		Cloud.uSpotLightDirectionShader = gl.getUniformLocation( Cloud.shaderProgram, "spotlightDirection" );
		Cloud.uSpotLightAmbientShader = gl.getUniformLocation( Cloud.shaderProgram, "spotlightAmbient" );
		Cloud.uSpotLightDiffuseShader = gl.getUniformLocation( Cloud.shaderProgram, "spotlightDiffuse" );
		Cloud.uSpotLightSpecularShader = gl.getUniformLocation( Cloud.shaderProgram, "spotlightSpecular" );
        Cloud.uSpotLightLoc = gl.getUniformLocation( Cloud.shaderProgram, "spotlightLoc");
		Cloud.uSpotLightAlpha = gl.getUniformLocation( Cloud.shaderProgram, "spotlightAlpha");
		Cloud.uSpotLightCutoff = gl.getUniformLocation( Cloud.shaderProgram, "spotlightCutoff");
        Cloud.uSpotLightStatus = gl.getUniformLocation( Cloud.shaderProgram, "spotlightStatus");

    }
    
    static initializeTexture(){
        var image = new Image();

        image.onload = function(){
            Cloud.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, Cloud.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, image.width, image.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image);
            
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            
            Cloud.imageLoaded++;
        }
        
        image.src = "./textures/cloud.png";
    }
    
    constructor(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh){
        super(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh);
        if(Cloud.shaderProgram == -1){
            Cloud.initialize()
            Cloud.initializeTexture();
        }
        
    }
    
    draw() {
        if((Cloud.texture == -1) || (Cloud.imageLoaded != 1)) { //only draw when texture is loaded.
        	return;
        }
        
        gl.useProgram(Cloud.shaderProgram);
        
        gl.bindBuffer( gl.ARRAY_BUFFER, Cloud.positionBuffer);
       	gl.vertexAttribPointer(Cloud.aPositionShader, 3, gl.FLOAT, false, 0, 0 );
        
        gl.bindBuffer( gl.ARRAY_BUFFER, Cloud.normalBuffer);
       	gl.vertexAttribPointer(Cloud.aNormalShader, 3, gl.FLOAT, false, 0, 0 );
       	
       	gl.bindBuffer( gl.ARRAY_BUFFER, Cloud.textureCoordBuffer);
       	gl.vertexAttribPointer(Cloud.aTextureCoordShader, 2, gl.FLOAT, false, 0, 0 );
       	
       	gl.activeTexture(gl.TEXTURE0);
       	gl.bindTexture(gl.TEXTURE_2D, Cloud.texture);
       	gl.uniform1i(Cloud.uTextureUnit,0);

	
       	gl.uniformMatrix4fv(Cloud.uModelMatrixShader, false, flatten(this.modelMatrix));
        gl.uniformMatrix4fv(Cloud.uCameraMatrixShader, false, flatten(camera1.cameraMatrix));
        gl.uniformMatrix4fv(Cloud.uProjectionMatrixShader, false, flatten(camera1.projectionMatrix));

        gl.uniform4fv(Cloud.uMatAmbientShader, this.matAmbient);
		gl.uniform4fv(Cloud.uMatDiffuseShader, this.matDiffuse);
		gl.uniform4fv(Cloud.uMatSpecularShader, this.matSpecular);
		gl.uniform1f(Cloud.uMatAlphaShader, this.matAlpha);

        //directional light
		gl.uniform3fv(Cloud.uLightDirectionShader, light1.direction);
		gl.uniform4fv(Cloud.uLightAmbientShader, light1.ambient);
		gl.uniform4fv(Cloud.uLightDiffuseShader, light1.diffuse);
		gl.uniform4fv(Cloud.uLightSpecularShader, light1.specular);

        //spotlight
		gl.uniform3fv(Cloud.uSpotLightDirectionShader, light2.direction);
		gl.uniform4fv(Cloud.uSpotLightAmbientShader, light2.ambient);
		gl.uniform4fv(Cloud.uSpotLightDiffuseShader, light2.diffuse);
		gl.uniform4fv(Cloud.uSpotLightSpecularShader, light2.specular);
        gl.uniform3fv(Cloud.uSpotLightLoc, light2.location);
		gl.uniform1f(Cloud.uSpotLightAlpha, light2.alpha); 
		gl.uniform1f(Cloud.uSpotLightCutoff, light2.cutoff); 
        gl.uniform1f(Cloud.uSpotLightStatus, light2.status); 
                    
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Cloud.indexBuffer);
	
        gl.enableVertexAttribArray(Cloud.aPositionShader);    
        gl.enableVertexAttribArray(Cloud.aTextureCoordShader);
        gl.enableVertexAttribArray(Cloud.aNormalShader);    
    	gl.drawElements(gl.TRIANGLES, Cloud.indices.length, gl.UNSIGNED_INT, 0);
    	gl.disableVertexAttribArray(Cloud.aPositionShader);    
    	gl.disableVertexAttribArray(Cloud.aTextureCoordShader);    
        gl.disableVertexAttribArray(Cloud.aNormalShader);    
    }
}


