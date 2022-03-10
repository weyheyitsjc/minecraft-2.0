class HouseBottom extends Drawable{
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
        for (var i = 0; i<HouseBottom.vertexPositions.length; i++) {
            normalSum.push(vec3(0, 0, 0));
            counts.push(0);
        }
        
        //for each triangle
        for (var i = 0; i<HouseBottom.indices.length; i+=3) {
            var a = HouseBottom.indices[i];
            var b = HouseBottom.indices[i+1];
            var c = HouseBottom.indices[i+2];
            
            var edge1 = subtract(HouseBottom.vertexPositions[c],HouseBottom.vertexPositions[b]);
            var edge2 = subtract(HouseBottom.vertexPositions[a],HouseBottom.vertexPositions[b]);
            var N = cross(edge1,edge2);
            
            normalSum[a] = add(normalSum[a],normalize(N));
            counts[a]++;
            normalSum[b] = add(normalSum[b],normalize(N));
            counts[b]++;
            normalSum[c] = add(normalSum[c],normalize(N));
            counts[c]++;
        
        }
        for (var i = 0; i < HouseBottom.vertexPositions.length; i++) {
            HouseBottom.vertexNormals[i] = mult(1.0/counts[i],normalSum[i]);
        }
    }

    static initialize() {
        HouseBottom.computeNormals();
    	HouseBottom.shaderProgram = initShaders( gl, "/glsl/lightcubevshader.glsl", "/glsl/lightcubefshader.glsl");
    	gl.useProgram(HouseBottom.shaderProgram );
		
        // Load the data into the GPU
        HouseBottom.positionBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, HouseBottom.positionBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(HouseBottom.vertexPositions), gl.STATIC_DRAW );
        
        HouseBottom.textureUnit = gl.getUniformLocation(HouseBottom.shaderProgram, "textureUnit");

        HouseBottom.normalBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, HouseBottom.normalBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(HouseBottom.vertexNormals), gl.STATIC_DRAW );

        HouseBottom.indexBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, HouseBottom.indexBuffer);
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(HouseBottom.indices), gl.STATIC_DRAW );
            
        // Associate our shader variables with our data buffer
        HouseBottom.aPositionShader = gl.getAttribLocation( HouseBottom.shaderProgram, "aPosition" );
        HouseBottom.aNormalShader = gl.getAttribLocation( HouseBottom.shaderProgram, "aNormal" );
        
        HouseBottom.uModelMatrixShader = gl.getUniformLocation( HouseBottom.shaderProgram, "modelMatrix" );
        HouseBottom.uCameraMatrixShader = gl.getUniformLocation( HouseBottom.shaderProgram, "cameraMatrix" );
        HouseBottom.uProjectionMatrixShader = gl.getUniformLocation( HouseBottom.shaderProgram, "projectionMatrix" );

        HouseBottom.uMatAmbientShader = gl.getUniformLocation( HouseBottom.shaderProgram, "matAmbient" );
		HouseBottom.uMatDiffuseShader = gl.getUniformLocation( HouseBottom.shaderProgram, "matDiffuse" );
		HouseBottom.uMatSpecularShader = gl.getUniformLocation( HouseBottom.shaderProgram, "matSpecular" );
		HouseBottom.uMatAlphaShader = gl.getUniformLocation( HouseBottom.shaderProgram, "matAlpha" );

        //directional light
		HouseBottom.uLightDirectionShader = gl.getUniformLocation( HouseBottom.shaderProgram, "lightDirection" );
		HouseBottom.uLightAmbientShader = gl.getUniformLocation( HouseBottom.shaderProgram, "lightAmbient" );
		HouseBottom.uLightDiffuseShader = gl.getUniformLocation( HouseBottom.shaderProgram, "lightDiffuse" );
		HouseBottom.uLightSpecularShader = gl.getUniformLocation( HouseBottom.shaderProgram, "lightSpecular" );

        //spotlight
		HouseBottom.uSpotLightDirectionShader = gl.getUniformLocation( HouseBottom.shaderProgram, "spotlightDirection" );
		HouseBottom.uSpotLightAmbientShader = gl.getUniformLocation( HouseBottom.shaderProgram, "spotlightAmbient" );
		HouseBottom.uSpotLightDiffuseShader = gl.getUniformLocation( HouseBottom.shaderProgram, "spotlightDiffuse" );
		HouseBottom.uSpotLightSpecularShader = gl.getUniformLocation( HouseBottom.shaderProgram, "spotlightSpecular" );
        HouseBottom.uSpotLightLoc = gl.getUniformLocation( HouseBottom.shaderProgram, "spotlightLoc");
		HouseBottom.uSpotLightAlpha = gl.getUniformLocation( HouseBottom.shaderProgram, "spotlightAlpha");
		HouseBottom.uSpotLightCutoff = gl.getUniformLocation( HouseBottom.shaderProgram, "spotlightCutoff");
        HouseBottom.uSpotLightStatus = gl.getUniformLocation( HouseBottom.shaderProgram, "spotlightStatus");

    }
    
    static initializeTexture(){
        var imagePX = new Image();
        var imageNX = new Image();
        var imagePY = new Image();
        var imageNY = new Image();
        var imagePZ = new Image();
        var imageNZ = new Image();
        
        HouseBottom.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, HouseBottom.texture);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);


        imagePX.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, HouseBottom.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imagePX);
            
            HouseBottom.imageLoaded++;
        };
        
        imagePX.src = "./textures/house/house.jpg";


        imageNX.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, HouseBottom.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imageNX);
            
            HouseBottom.imageLoaded++;
        };

        imageNX.src = "./textures/house/house.jpg";

        imagePY.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, HouseBottom.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imagePY);
            
            HouseBottom.imageLoaded++;
        };

        imagePY.src = "./textures/house/house.jpg";


        imageNY.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, HouseBottom.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imageNY);
            
            HouseBottom.imageLoaded++;
        };

        imageNY.src = "./textures/house/house.jpg";


        imagePZ.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, HouseBottom.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imagePZ);
        
            HouseBottom.imageLoaded++;
        };
        
        imagePZ.src = "./textures/house/house-front.jpg";

        imageNZ.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, HouseBottom.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imageNZ);
            
            HouseBottom.imageLoaded++;
        };

        imageNZ.src = "./textures/house/house.jpg";

    }
    
    constructor(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh){
        super(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh);
        if(HouseBottom.shaderProgram == -1){
            HouseBottom.initialize()
            HouseBottom.initializeTexture();
        }
        
    }
    
    draw() {
        if((HouseBottom.texture == -1) || (HouseBottom.imageLoaded != 6)) {  //only draw when texture is loaded.
        	return;
        }
        
        gl.useProgram(HouseBottom.shaderProgram);
        
        gl.bindBuffer( gl.ARRAY_BUFFER, HouseBottom.positionBuffer);
       	gl.vertexAttribPointer(HouseBottom.aPositionShader, 3, gl.FLOAT, false, 0, 0 );

       	gl.activeTexture(gl.TEXTURE0);
       	gl.bindTexture(gl.TEXTURE_CUBE_MAP, HouseBottom.texture);
       	gl.uniform1i(HouseBottom.textureUnit,0);

        gl.bindBuffer( gl.ARRAY_BUFFER, HouseBottom.normalBuffer);
       	gl.vertexAttribPointer(HouseBottom.aNormalShader, 3, gl.FLOAT, false, 0, 0 );
	
       	gl.uniformMatrix4fv(HouseBottom.uModelMatrixShader, false, flatten(this.modelMatrix));
        gl.uniformMatrix4fv(HouseBottom.uCameraMatrixShader, false, flatten(camera1.cameraMatrix));
        gl.uniformMatrix4fv(HouseBottom.uProjectionMatrixShader, false, flatten(camera1.projectionMatrix));

        gl.uniform4fv(HouseBottom.uMatAmbientShader, this.matAmbient);
		gl.uniform4fv(HouseBottom.uMatDiffuseShader, this.matDiffuse);
		gl.uniform4fv(HouseBottom.uMatSpecularShader, this.matSpecular);
		gl.uniform1f(HouseBottom.uMatAlphaShader, this.matAlpha);

        //directional light
		gl.uniform3fv(HouseBottom.uLightDirectionShader, light1.direction);
		gl.uniform4fv(HouseBottom.uLightAmbientShader, light1.ambient);
		gl.uniform4fv(HouseBottom.uLightDiffuseShader, light1.diffuse);
		gl.uniform4fv(HouseBottom.uLightSpecularShader, light1.specular);

        //spotlight
		gl.uniform3fv(HouseBottom.uSpotLightDirectionShader, light2.direction);
		gl.uniform4fv(HouseBottom.uSpotLightAmbientShader, light2.ambient);
		gl.uniform4fv(HouseBottom.uSpotLightDiffuseShader, light2.diffuse);
		gl.uniform4fv(HouseBottom.uSpotLightSpecularShader, light2.specular);
        gl.uniform3fv(HouseBottom.uSpotLightLoc, light2.location);
		gl.uniform1f(HouseBottom.uSpotLightAlpha, light2.alpha); 
		gl.uniform1f(HouseBottom.uSpotLightCutoff, light2.cutoff); 
        gl.uniform1f(HouseBottom.uSpotLightStatus, light2.status); 
                    
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, HouseBottom.indexBuffer);
	
        gl.enableVertexAttribArray(HouseBottom.aPositionShader);  
        gl.enableVertexAttribArray(HouseBottom.aNormalShader);    
    	gl.drawElements(gl.TRIANGLES, HouseBottom.indices.length, gl.UNSIGNED_INT, 0);
    	gl.disableVertexAttribArray(HouseBottom.aPositionShader);    
        gl.disableVertexAttribArray(HouseBottom.aNormalShader);    

    }
}