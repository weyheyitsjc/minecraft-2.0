class HouseTopBrick extends Drawable{
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
        for (var i = 0; i<HouseTopBrick.vertexPositions.length; i++) {
            normalSum.push(vec3(0, 0, 0));
            counts.push(0);
        }
        
        //for each triangle
        for (var i = 0; i<HouseTopBrick.indices.length; i+=3) {
            var a = HouseTopBrick.indices[i];
            var b = HouseTopBrick.indices[i+1];
            var c = HouseTopBrick.indices[i+2];
            
            var edge1 = subtract(HouseTopBrick.vertexPositions[c],HouseTopBrick.vertexPositions[b]);
            var edge2 = subtract(HouseTopBrick.vertexPositions[a],HouseTopBrick.vertexPositions[b]);
            var N = cross(edge1,edge2);
            
            normalSum[a] = add(normalSum[a],normalize(N));
            counts[a]++;
            normalSum[b] = add(normalSum[b],normalize(N));
            counts[b]++;
            normalSum[c] = add(normalSum[c],normalize(N));
            counts[c]++;
        
        }
            
        for (var i = 0; i < HouseTopBrick.vertexPositions.length; i++) {
            HouseTopBrick.vertexNormals[i] = mult(1.0/counts[i],normalSum[i]);
        }
    }

    static initialize() {
        HouseTopBrick.computeNormals();
    	HouseTopBrick.shaderProgram = initShaders( gl, "/glsl/lightvshader.glsl", "/glsl/lightfshader.glsl");
    	gl.useProgram(HouseTopBrick.shaderProgram );
		
        // Load the data into the GPU
        HouseTopBrick.positionBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, HouseTopBrick.positionBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(HouseTopBrick.vertexPositions), gl.STATIC_DRAW );

        HouseTopBrick.normalBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, HouseTopBrick.normalBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(HouseTopBrick.vertexNormals), gl.STATIC_DRAW );
        
        HouseTopBrick.textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, HouseTopBrick.textureCoordBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(HouseTopBrick.vertexTextureCoords), gl.STATIC_DRAW );
        
        HouseTopBrick.uTextureUnit = gl.getUniformLocation(HouseTopBrick.shaderProgram, "uTextureUnit");

        HouseTopBrick.indexBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, HouseTopBrick.indexBuffer);
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(HouseTopBrick.indices), gl.STATIC_DRAW );
            
        // Associate our shader variables with our data buffer
        HouseTopBrick.aPositionShader = gl.getAttribLocation( HouseTopBrick.shaderProgram, "aPosition" );
        HouseTopBrick.aTextureCoordShader = gl.getAttribLocation( HouseTopBrick.shaderProgram, "aTextureCoord" );
        HouseTopBrick.aNormalShader = gl.getAttribLocation( HouseTopBrick.shaderProgram, "aNormal" );
        
        HouseTopBrick.uModelMatrixShader = gl.getUniformLocation( HouseTopBrick.shaderProgram, "modelMatrix" );
        HouseTopBrick.uCameraMatrixShader = gl.getUniformLocation( HouseTopBrick.shaderProgram, "cameraMatrix" );
        HouseTopBrick.uProjectionMatrixShader = gl.getUniformLocation( HouseTopBrick.shaderProgram, "projectionMatrix" );

        HouseTopBrick.uMatAmbientShader = gl.getUniformLocation( HouseTopBrick.shaderProgram, "matAmbient" );
		HouseTopBrick.uMatDiffuseShader = gl.getUniformLocation( HouseTopBrick.shaderProgram, "matDiffuse" );
		HouseTopBrick.uMatSpecularShader = gl.getUniformLocation( HouseTopBrick.shaderProgram, "matSpecular" );
		HouseTopBrick.uMatAlphaShader = gl.getUniformLocation( HouseTopBrick.shaderProgram, "matAlpha" );

        //directional light
		HouseTopBrick.uLightDirectionShader = gl.getUniformLocation( HouseTopBrick.shaderProgram, "lightDirection" );
		HouseTopBrick.uLightAmbientShader = gl.getUniformLocation( HouseTopBrick.shaderProgram, "lightAmbient" );
		HouseTopBrick.uLightDiffuseShader = gl.getUniformLocation( HouseTopBrick.shaderProgram, "lightDiffuse" );
		HouseTopBrick.uLightSpecularShader = gl.getUniformLocation( HouseTopBrick.shaderProgram, "lightSpecular" );

        //spotlight
		HouseTopBrick.uSpotLightDirectionShader = gl.getUniformLocation( HouseTopBrick.shaderProgram, "spotlightDirection" );
		HouseTopBrick.uSpotLightAmbientShader = gl.getUniformLocation( HouseTopBrick.shaderProgram, "spotlightAmbient" );
		HouseTopBrick.uSpotLightDiffuseShader = gl.getUniformLocation( HouseTopBrick.shaderProgram, "spotlightDiffuse" );
		HouseTopBrick.uSpotLightSpecularShader = gl.getUniformLocation( HouseTopBrick.shaderProgram, "spotlightSpecular" );
        HouseTopBrick.uSpotLightLoc = gl.getUniformLocation( HouseTopBrick.shaderProgram, "spotlightLoc");
		HouseTopBrick.uSpotLightAlpha = gl.getUniformLocation( HouseTopBrick.shaderProgram, "spotlightAlpha");
		HouseTopBrick.uSpotLightCutoff = gl.getUniformLocation( HouseTopBrick.shaderProgram, "spotlightCutoff");
        HouseTopBrick.uSpotLightStatus = gl.getUniformLocation( HouseTopBrick.shaderProgram, "spotlightStatus");

    }
    
    static initializeTexture(){
        var image = new Image();

        image.onload = function(){
            HouseTopBrick.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, HouseTopBrick.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, image.width, image.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image);
            
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            
            HouseTopBrick.imageLoaded++;
        }
        
        image.src = "./textures/house/roof-brick.jpg";
    }
    
    constructor(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh){
        super(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh);
        if(HouseTopBrick.shaderProgram == -1){
            HouseTopBrick.initialize()
            HouseTopBrick.initializeTexture();
        }
        
    }
    
    draw() {
        if((HouseTopBrick.texture == -1) || (HouseTopBrick.imageLoaded != 1)) {  //only draw when texture is loaded.
        	return;
        }
        
        gl.useProgram(HouseTopBrick.shaderProgram);
        
        gl.bindBuffer( gl.ARRAY_BUFFER, HouseTopBrick.positionBuffer);
       	gl.vertexAttribPointer(HouseTopBrick.aPositionShader, 3, gl.FLOAT, false, 0, 0 );
        
        gl.bindBuffer( gl.ARRAY_BUFFER, HouseTopBrick.normalBuffer);
       	gl.vertexAttribPointer(HouseTopBrick.aNormalShader, 3, gl.FLOAT, false, 0, 0 );
       	
       	gl.bindBuffer( gl.ARRAY_BUFFER, HouseTopBrick.textureCoordBuffer);
       	gl.vertexAttribPointer(HouseTopBrick.aTextureCoordShader, 2, gl.FLOAT, false, 0, 0 );
       	
       	gl.activeTexture(gl.TEXTURE0);
       	gl.bindTexture(gl.TEXTURE_2D, HouseTopBrick.texture);
       	gl.uniform1i(HouseTopBrick.uTextureUnit,0);

	
       	gl.uniformMatrix4fv(HouseTopBrick.uModelMatrixShader, false, flatten(this.modelMatrix));
        gl.uniformMatrix4fv(HouseTopBrick.uCameraMatrixShader, false, flatten(camera1.cameraMatrix));
        gl.uniformMatrix4fv(HouseTopBrick.uProjectionMatrixShader, false, flatten(camera1.projectionMatrix));

        gl.uniform4fv(HouseTopBrick.uMatAmbientShader, this.matAmbient);
		gl.uniform4fv(HouseTopBrick.uMatDiffuseShader, this.matDiffuse);
		gl.uniform4fv(HouseTopBrick.uMatSpecularShader, this.matSpecular);
		gl.uniform1f(HouseTopBrick.uMatAlphaShader, this.matAlpha);

        //directional light
		gl.uniform3fv(HouseTopBrick.uLightDirectionShader, light1.direction);
		gl.uniform4fv(HouseTopBrick.uLightAmbientShader, light1.ambient);
		gl.uniform4fv(HouseTopBrick.uLightDiffuseShader, light1.diffuse);
		gl.uniform4fv(HouseTopBrick.uLightSpecularShader, light1.specular);

        //spotlight
		gl.uniform3fv(HouseTopBrick.uSpotLightDirectionShader, light2.direction);
		gl.uniform4fv(HouseTopBrick.uSpotLightAmbientShader, light2.ambient);
		gl.uniform4fv(HouseTopBrick.uSpotLightDiffuseShader, light2.diffuse);
		gl.uniform4fv(HouseTopBrick.uSpotLightSpecularShader, light2.specular);
        gl.uniform3fv(HouseTopBrick.uSpotLightLoc, light2.location);
		gl.uniform1f(HouseTopBrick.uSpotLightAlpha, light2.alpha); 
		gl.uniform1f(HouseTopBrick.uSpotLightCutoff, light2.cutoff); 
        gl.uniform1f(HouseTopBrick.uSpotLightStatus, light2.status); 
                    
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, HouseTopBrick.indexBuffer);
	
        gl.enableVertexAttribArray(HouseTopBrick.aPositionShader);    
        gl.enableVertexAttribArray(HouseTopBrick.aTextureCoordShader);
        gl.enableVertexAttribArray(HouseTopBrick.aNormalShader);    
    	gl.drawElements(gl.TRIANGLES, HouseTopBrick.indices.length, gl.UNSIGNED_INT, 0);
    	gl.disableVertexAttribArray(HouseTopBrick.aPositionShader);    
    	gl.disableVertexAttribArray(HouseTopBrick.aTextureCoordShader);    
        gl.disableVertexAttribArray(HouseTopBrick.aNormalShader);    
    }
}

class HouseTopWood extends Drawable{
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
        for (var i = 0; i<HouseTopWood.vertexPositions.length; i++) {
            normalSum.push(vec3(0, 0, 0));
            counts.push(0);
        }
        
        //for each triangle
        for (var i = 0; i<HouseTopWood.indices.length; i+=3) {
            var a = HouseTopWood.indices[i];
            var b = HouseTopWood.indices[i+1];
            var c = HouseTopWood.indices[i+2];
            
            var edge1 = subtract(HouseTopWood.vertexPositions[c],HouseTopWood.vertexPositions[b]);
            var edge2 = subtract(HouseTopWood.vertexPositions[a],HouseTopWood.vertexPositions[b]);
            var N = cross(edge1,edge2);
            
            normalSum[a] = add(normalSum[a],normalize(N));
            counts[a]++;
            normalSum[b] = add(normalSum[b],normalize(N));
            counts[b]++;
            normalSum[c] = add(normalSum[c],normalize(N));
            counts[c]++;
        
        }
            
        for (var i = 0; i < HouseTopWood.vertexPositions.length; i++) {
            HouseTopWood.vertexNormals[i] = mult(1.0/counts[i],normalSum[i]);
        }
    }

    static initialize() {
        HouseTopWood.computeNormals();
    	HouseTopWood.shaderProgram = initShaders( gl, "/glsl/lightvshader.glsl", "/glsl/lightfshader.glsl");
    	gl.useProgram(HouseTopWood.shaderProgram );
		
        // Load the data into the GPU
        HouseTopWood.positionBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, HouseTopWood.positionBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(HouseTopWood.vertexPositions), gl.STATIC_DRAW );

        HouseTopWood.normalBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, HouseTopWood.normalBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(HouseTopWood.vertexNormals), gl.STATIC_DRAW );
        
        HouseTopWood.textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, HouseTopWood.textureCoordBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(HouseTopWood.vertexTextureCoords), gl.STATIC_DRAW );
        
        HouseTopWood.uTextureUnit = gl.getUniformLocation(HouseTopWood.shaderProgram, "uTextureUnit");

        HouseTopWood.indexBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, HouseTopWood.indexBuffer);
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(HouseTopWood.indices), gl.STATIC_DRAW );
            
        // Associate our shader variables with our data buffer
        HouseTopWood.aPositionShader = gl.getAttribLocation( HouseTopWood.shaderProgram, "aPosition" );
        HouseTopWood.aTextureCoordShader = gl.getAttribLocation( HouseTopWood.shaderProgram, "aTextureCoord" );
        HouseTopWood.aNormalShader = gl.getAttribLocation( HouseTopWood.shaderProgram, "aNormal" );
        
        HouseTopWood.uModelMatrixShader = gl.getUniformLocation( HouseTopWood.shaderProgram, "modelMatrix" );
        HouseTopWood.uCameraMatrixShader = gl.getUniformLocation( HouseTopWood.shaderProgram, "cameraMatrix" );
        HouseTopWood.uProjectionMatrixShader = gl.getUniformLocation( HouseTopWood.shaderProgram, "projectionMatrix" );

        HouseTopWood.uMatAmbientShader = gl.getUniformLocation( HouseTopWood.shaderProgram, "matAmbient" );
		HouseTopWood.uMatDiffuseShader = gl.getUniformLocation( HouseTopWood.shaderProgram, "matDiffuse" );
		HouseTopWood.uMatSpecularShader = gl.getUniformLocation( HouseTopWood.shaderProgram, "matSpecular" );
		HouseTopWood.uMatAlphaShader = gl.getUniformLocation( HouseTopWood.shaderProgram, "matAlpha" );

        //directional light
		HouseTopWood.uLightDirectionShader = gl.getUniformLocation( HouseTopWood.shaderProgram, "lightDirection" );
		HouseTopWood.uLightAmbientShader = gl.getUniformLocation( HouseTopWood.shaderProgram, "lightAmbient" );
		HouseTopWood.uLightDiffuseShader = gl.getUniformLocation( HouseTopWood.shaderProgram, "lightDiffuse" );
		HouseTopWood.uLightSpecularShader = gl.getUniformLocation( HouseTopWood.shaderProgram, "lightSpecular" );

        //spotlight
		HouseTopWood.uSpotLightDirectionShader = gl.getUniformLocation( HouseTopWood.shaderProgram, "spotlightDirection" );
		HouseTopWood.uSpotLightAmbientShader = gl.getUniformLocation( HouseTopWood.shaderProgram, "spotlightAmbient" );
		HouseTopWood.uSpotLightDiffuseShader = gl.getUniformLocation( HouseTopWood.shaderProgram, "spotlightDiffuse" );
		HouseTopWood.uSpotLightSpecularShader = gl.getUniformLocation( HouseTopWood.shaderProgram, "spotlightSpecular" );
        HouseTopWood.uSpotLightLoc = gl.getUniformLocation( HouseTopWood.shaderProgram, "spotlightLoc");
		HouseTopWood.uSpotLightAlpha = gl.getUniformLocation( HouseTopWood.shaderProgram, "spotlightAlpha");
		HouseTopWood.uSpotLightCutoff = gl.getUniformLocation( HouseTopWood.shaderProgram, "spotlightCutoff");
        HouseTopWood.uSpotLightStatus = gl.getUniformLocation( HouseTopWood.shaderProgram, "spotlightStatus");

    }
    
    static initializeTexture(){
        var image = new Image();

        image.onload = function(){
            HouseTopWood.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, HouseTopWood.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, image.width, image.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image);
            
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            
            HouseTopWood.imageLoaded++;
        }
        
        image.src = "./textures/house/roof-oak.jpg";
    }
    
    constructor(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh){
        super(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh);
        if(HouseTopWood.shaderProgram == -1){
            HouseTopWood.initialize()
            HouseTopWood.initializeTexture();
        }
        
    }
    
    draw() {
        if((HouseTopWood.texture == -1) || (HouseTopWood.imageLoaded != 1))  //only draw when texture is loaded.
        	return;
        
        gl.useProgram(HouseTopWood.shaderProgram);
        
        gl.bindBuffer( gl.ARRAY_BUFFER, HouseTopWood.positionBuffer);
       	gl.vertexAttribPointer(HouseTopWood.aPositionShader, 3, gl.FLOAT, false, 0, 0 );
        
        gl.bindBuffer( gl.ARRAY_BUFFER, HouseTopWood.normalBuffer);
       	gl.vertexAttribPointer(HouseTopWood.aNormalShader, 3, gl.FLOAT, false, 0, 0 );
       	
       	gl.bindBuffer( gl.ARRAY_BUFFER, HouseTopWood.textureCoordBuffer);
       	gl.vertexAttribPointer(HouseTopWood.aTextureCoordShader, 2, gl.FLOAT, false, 0, 0 );
       	
       	gl.activeTexture(gl.TEXTURE0);
       	gl.bindTexture(gl.TEXTURE_2D, HouseTopWood.texture);
       	gl.uniform1i(HouseTopWood.uTextureUnit,0);

	
       	gl.uniformMatrix4fv(HouseTopWood.uModelMatrixShader, false, flatten(this.modelMatrix));
        gl.uniformMatrix4fv(HouseTopWood.uCameraMatrixShader, false, flatten(camera1.cameraMatrix));
        gl.uniformMatrix4fv(HouseTopWood.uProjectionMatrixShader, false, flatten(camera1.projectionMatrix));

        gl.uniform4fv(HouseTopWood.uMatAmbientShader, this.matAmbient);
		gl.uniform4fv(HouseTopWood.uMatDiffuseShader, this.matDiffuse);
		gl.uniform4fv(HouseTopWood.uMatSpecularShader, this.matSpecular);
		gl.uniform1f(HouseTopWood.uMatAlphaShader, this.matAlpha);

        //directional light
		gl.uniform3fv(HouseTopWood.uLightDirectionShader, light1.direction);
		gl.uniform4fv(HouseTopWood.uLightAmbientShader, light1.ambient);
		gl.uniform4fv(HouseTopWood.uLightDiffuseShader, light1.diffuse);
		gl.uniform4fv(HouseTopWood.uLightSpecularShader, light1.specular);

        //spotlight
		gl.uniform3fv(HouseTopWood.uSpotLightDirectionShader, light2.direction);
		gl.uniform4fv(HouseTopWood.uSpotLightAmbientShader, light2.ambient);
		gl.uniform4fv(HouseTopWood.uSpotLightDiffuseShader, light2.diffuse);
		gl.uniform4fv(HouseTopWood.uSpotLightSpecularShader, light2.specular);
        gl.uniform3fv(HouseTopWood.uSpotLightLoc, light2.location);
		gl.uniform1f(HouseTopWood.uSpotLightAlpha, light2.alpha); 
		gl.uniform1f(HouseTopWood.uSpotLightCutoff, light2.cutoff); 
        gl.uniform1f(HouseTopWood.uSpotLightStatus, light2.status); 
                    
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, HouseTopWood.indexBuffer);
	
        gl.enableVertexAttribArray(HouseTopWood.aPositionShader);    
        gl.enableVertexAttribArray(HouseTopWood.aTextureCoordShader);
        gl.enableVertexAttribArray(HouseTopWood.aNormalShader);    
    	gl.drawElements(gl.TRIANGLES, HouseTopWood.indices.length, gl.UNSIGNED_INT, 0);
    	gl.disableVertexAttribArray(HouseTopWood.aPositionShader);    
    	gl.disableVertexAttribArray(HouseTopWood.aTextureCoordShader);    
        gl.disableVertexAttribArray(HouseTopWood.aNormalShader);    
    }
}
