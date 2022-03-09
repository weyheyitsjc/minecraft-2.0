class HouseTop extends Drawable{
    static vertexPositions = [
        vec3( -1, 0, 1 ),//0
        vec3( 1, 0, 1 ),//1
        vec3( 1, 0, -1 ),//2
        vec3( -1, 0, -1 ),//3
        vec3( -1, 0, 1 ),//0
        vec3( 1, 0, 1 ),//1
        vec3( 0, 1.5, 0 ),//4 
        vec3( 1, 0, 1 ),//1
        vec3( 1, 0, -1 ),//2
        vec3( 0, 1.5, 0 ),//4 
        vec3( 1, 0, -1 ),//2
        vec3( -1, 0, -1 ),//3
        vec3( 0, 1.5, 0 ),//4 
        vec3( -1, 0, -1 ),//3
        vec3( -1, 0, 1 ),//0
        vec3( 0, 1.5, 0 ),//4 

    ];
  
    static vertexTextureCoords = [
        vec2(0,0),
        vec2(1,0),
        vec2(1,1),
        vec2(0,1),
        vec2(1,0),
        vec2(0,1),
        vec2(0,0),
        vec2(1,0),
        vec2(0,1),
        vec2(0,0),
        vec2(1,0),
        vec2(0,1),
        vec2(0,0),
        vec2(1,0),
        vec2(0,1),
        vec2(0,0)
    ];
    
    static indices = [
        0,1,2,
        0,2,3,
        4,5,6,
        7,8,9,
        10,11,12,
        13,14,15
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
        for (var i = 0; i<HouseTop.vertexPositions.length; i++) {
            normalSum.push(vec3(0, 0, 0));
            counts.push(0);
        }
        
        //for each triangle
        for (var i = 0; i<HouseTop.indices.length; i+=3) {
            var a = HouseTop.indices[i];
            var b = HouseTop.indices[i+1];
            var c = HouseTop.indices[i+2];
            
            var edge1 = subtract(HouseTop.vertexPositions[c],HouseTop.vertexPositions[b]);
            var edge2 = subtract(HouseTop.vertexPositions[a],HouseTop.vertexPositions[b]);
            var N = cross(edge1,edge2);
            
            normalSum[a] = add(normalSum[a],normalize(N));
            counts[a]++;
            normalSum[b] = add(normalSum[b],normalize(N));
            counts[b]++;
            normalSum[c] = add(normalSum[c],normalize(N));
            counts[c]++;
        
        }
            
        for (var i = 0; i < HouseTop.vertexPositions.length; i++) {
            HouseTop.vertexNormals[i] = mult(1.0/counts[i],normalSum[i]);
        }
    }

    static initialize() {
        HouseTop.computeNormals();
    	HouseTop.shaderProgram = initShaders( gl, "/glsl/lightvshader.glsl", "/glsl/lightfshader.glsl");
    	gl.useProgram(HouseTop.shaderProgram );
		
        // Load the data into the GPU
        HouseTop.positionBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, HouseTop.positionBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(HouseTop.vertexPositions), gl.STATIC_DRAW );

        HouseTop.normalBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, HouseTop.normalBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(HouseTop.vertexNormals), gl.STATIC_DRAW );
        
        HouseTop.textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, HouseTop.textureCoordBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(HouseTop.vertexTextureCoords), gl.STATIC_DRAW );
        
        HouseTop.uTextureUnit = gl.getUniformLocation(HouseTop.shaderProgram, "uTextureUnit");

        HouseTop.indexBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, HouseTop.indexBuffer);
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(HouseTop.indices), gl.STATIC_DRAW );
            
        // Associate our shader variables with our data buffer
        HouseTop.aPositionShader = gl.getAttribLocation( HouseTop.shaderProgram, "aPosition" );
        HouseTop.aTextureCoordShader = gl.getAttribLocation( HouseTop.shaderProgram, "aTextureCoord" );
        HouseTop.aNormalShader = gl.getAttribLocation( HouseTop.shaderProgram, "aNormal" );
        
        HouseTop.uModelMatrixShader = gl.getUniformLocation( HouseTop.shaderProgram, "modelMatrix" );
        HouseTop.uCameraMatrixShader = gl.getUniformLocation( HouseTop.shaderProgram, "cameraMatrix" );
        HouseTop.uProjectionMatrixShader = gl.getUniformLocation( HouseTop.shaderProgram, "projectionMatrix" );

        HouseTop.uMatAmbientShader = gl.getUniformLocation( HouseTop.shaderProgram, "matAmbient" );
		HouseTop.uMatDiffuseShader = gl.getUniformLocation( HouseTop.shaderProgram, "matDiffuse" );
		HouseTop.uMatSpecularShader = gl.getUniformLocation( HouseTop.shaderProgram, "matSpecular" );
		HouseTop.uMatAlphaShader = gl.getUniformLocation( HouseTop.shaderProgram, "matAlpha" );

        //directional light
		HouseTop.uLightDirectionShader = gl.getUniformLocation( HouseTop.shaderProgram, "lightDirection" );
		HouseTop.uLightAmbientShader = gl.getUniformLocation( HouseTop.shaderProgram, "lightAmbient" );
		HouseTop.uLightDiffuseShader = gl.getUniformLocation( HouseTop.shaderProgram, "lightDiffuse" );
		HouseTop.uLightSpecularShader = gl.getUniformLocation( HouseTop.shaderProgram, "lightSpecular" );

        //spotlight
		HouseTop.uSpotLightDirectionShader = gl.getUniformLocation( HouseTop.shaderProgram, "spotlightDirection" );
		HouseTop.uSpotLightAmbientShader = gl.getUniformLocation( HouseTop.shaderProgram, "spotlightAmbient" );
		HouseTop.uSpotLightDiffuseShader = gl.getUniformLocation( HouseTop.shaderProgram, "spotlightDiffuse" );
		HouseTop.uSpotLightSpecularShader = gl.getUniformLocation( HouseTop.shaderProgram, "spotlightSpecular" );
        HouseTop.uSpotLightLoc = gl.getUniformLocation( HouseTop.shaderProgram, "spotlightLoc");
		HouseTop.uSpotLightAlpha = gl.getUniformLocation( HouseTop.shaderProgram, "spotlightAlpha");
		HouseTop.uSpotLightCutoff = gl.getUniformLocation( HouseTop.shaderProgram, "spotlightCutoff");
        HouseTop.uSpotLightStatus = gl.getUniformLocation( HouseTop.shaderProgram, "spotlightStatus");

    }
    
    static initializeTexture(){
        var image = new Image();

        image.onload = function(){
            HouseTop.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, HouseTop.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, image.width, image.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image);
            
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            
            HouseTop.imageLoaded++;
        }
        
        image.src = "./textures/house/roof.jpg";
    }
    
    constructor(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh){
        super(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh);
        if(HouseTop.shaderProgram == -1){
            HouseTop.initialize()
            HouseTop.initializeTexture();
        }
        
    }
    
    draw() {
        if((HouseTop.texture == -1) || (HouseTop.imageLoaded != 1))  //only draw when texture is loaded.
        	return;
        
        gl.useProgram(HouseTop.shaderProgram);
        
        gl.bindBuffer( gl.ARRAY_BUFFER, HouseTop.positionBuffer);
       	gl.vertexAttribPointer(HouseTop.aPositionShader, 3, gl.FLOAT, false, 0, 0 );
        
        gl.bindBuffer( gl.ARRAY_BUFFER, HouseTop.normalBuffer);
       	gl.vertexAttribPointer(HouseTop.aNormalShader, 3, gl.FLOAT, false, 0, 0 );
       	
       	gl.bindBuffer( gl.ARRAY_BUFFER, HouseTop.textureCoordBuffer);
       	gl.vertexAttribPointer(HouseTop.aTextureCoordShader, 2, gl.FLOAT, false, 0, 0 );
       	
       	gl.activeTexture(gl.TEXTURE0);
       	gl.bindTexture(gl.TEXTURE_2D, HouseTop.texture);
       	gl.uniform1i(HouseTop.uTextureUnit,0);

	
       	gl.uniformMatrix4fv(HouseTop.uModelMatrixShader, false, flatten(this.modelMatrix));
        gl.uniformMatrix4fv(HouseTop.uCameraMatrixShader, false, flatten(camera1.cameraMatrix));
        gl.uniformMatrix4fv(HouseTop.uProjectionMatrixShader, false, flatten(camera1.projectionMatrix));

        gl.uniform4fv(HouseTop.uMatAmbientShader, this.matAmbient);
		gl.uniform4fv(HouseTop.uMatDiffuseShader, this.matDiffuse);
		gl.uniform4fv(HouseTop.uMatSpecularShader, this.matSpecular);
		gl.uniform1f(HouseTop.uMatAlphaShader, this.matAlpha);

        //directional light
		gl.uniform3fv(HouseTop.uLightDirectionShader, light1.direction);
		gl.uniform4fv(HouseTop.uLightAmbientShader, light1.ambient);
		gl.uniform4fv(HouseTop.uLightDiffuseShader, light1.diffuse);
		gl.uniform4fv(HouseTop.uLightSpecularShader, light1.specular);

        //spotlight
		gl.uniform3fv(HouseTop.uSpotLightDirectionShader, light2.direction);
		gl.uniform4fv(HouseTop.uSpotLightAmbientShader, light2.ambient);
		gl.uniform4fv(HouseTop.uSpotLightDiffuseShader, light2.diffuse);
		gl.uniform4fv(HouseTop.uSpotLightSpecularShader, light2.specular);
        gl.uniform3fv(HouseTop.uSpotLightLoc, light2.location);
		gl.uniform1f(HouseTop.uSpotLightAlpha, light2.alpha); 
		gl.uniform1f(HouseTop.uSpotLightCutoff, light2.cutoff); 
        gl.uniform1f(HouseTop.uSpotLightStatus, light2.status); 
                    
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, HouseTop.indexBuffer);
	
        gl.enableVertexAttribArray(HouseTop.aPositionShader);    
        gl.enableVertexAttribArray(HouseTop.aTextureCoordShader);
        gl.enableVertexAttribArray(HouseTop.aNormalShader);    
    	gl.drawElements(gl.TRIANGLES, HouseTop.indices.length, gl.UNSIGNED_INT, 0);
    	gl.disableVertexAttribArray(HouseTop.aPositionShader);    
    	gl.disableVertexAttribArray(HouseTop.aTextureCoordShader);    
        gl.disableVertexAttribArray(HouseTop.aNormalShader);    
    }
}


