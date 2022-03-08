class Cube extends Drawable{
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
    
    static uSpotLightDirectionShader = -1;
    static uSpotLightAmbientShader = -1;
    static uSpotLightDiffuseShader = -1;
    static uSpotLightSpecularShader = -1;
    static uSpotLightLoc = -1;
	static uSpotLightAlpha = -1;
	static uSpotLightCutoff = -1;

    static texture = -1;
    static textureUnit = -1;

    static imageLoaded = 0;

    static computeNormals(){
        var normalSum = [];
        var counts = [];
        
        //initialize sum of normals for each vertex and how often its used.
        for (var i = 0; i<Cube.vertexPositions.length; i++) {
            normalSum.push(vec3(0, 0, 0));
            counts.push(0);
        }
        
        //for each triangle
        for (var i = 0; i<Cube.indices.length; i+=3) {
            var a = Cube.indices[i];
            var b = Cube.indices[i+1];
            var c = Cube.indices[i+2];
            
            var edge1 = subtract(Cube.vertexPositions[c],Cube.vertexPositions[b]);
            var edge2 = subtract(Cube.vertexPositions[a],Cube.vertexPositions[b]);
            var N = cross(edge1,edge2);
            
            normalSum[a] = add(normalSum[a],normalize(N));
            counts[a]++;
            normalSum[b] = add(normalSum[b],normalize(N));
            counts[b]++;
            normalSum[c] = add(normalSum[c],normalize(N));
            counts[c]++;
        
        }
        console.log(Cube.vertexNormals)
        for (var i = 0; i < Cube.vertexPositions.length; i++) {
            Cube.vertexNormals[i] = mult(1.0/counts[i],normalSum[i]);
        }
    }

    static initialize() {
        Cube.computeNormals();
    	Cube.shaderProgram = initShaders( gl, "/lightcubevshader.glsl", "/lightcubefshader.glsl");
    	gl.useProgram(Cube.shaderProgram );
		
        // Load the data into the GPU
        Cube.positionBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, Cube.positionBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(Cube.vertexPositions), gl.STATIC_DRAW );
        
        Cube.textureUnit = gl.getUniformLocation(Cube.shaderProgram, "textureUnit");

        Cube.indexBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Cube.indexBuffer);
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(Cube.indices), gl.STATIC_DRAW );
            
        // Associate our shader variables with our data buffer
        Cube.aPositionShader = gl.getAttribLocation( Cube.shaderProgram, "aPosition" );
        Cube.aNormalShader = gl.getAttribLocation( Cube.shaderProgram, "aNormal" );
        
        Cube.uModelMatrixShader = gl.getUniformLocation( Cube.shaderProgram, "modelMatrix" );
        Cube.uCameraMatrixShader = gl.getUniformLocation( Cube.shaderProgram, "cameraMatrix" );
        Cube.uProjectionMatrixShader = gl.getUniformLocation( Cube.shaderProgram, "projectionMatrix" );

        Cube.uMatAmbientShader = gl.getUniformLocation( Cube.shaderProgram, "matAmbient" );
		Cube.uMatDiffuseShader = gl.getUniformLocation( Cube.shaderProgram, "matDiffuse" );
		Cube.uMatSpecularShader = gl.getUniformLocation( Cube.shaderProgram, "matSpecular" );
		Cube.uMatAlphaShader = gl.getUniformLocation( Cube.shaderProgram, "matAlpha" );

        //spotlight
		Cube.uSpotLightDirectionShader = gl.getUniformLocation( Cube.shaderProgram, "spotlightDirection" );
		Cube.uSpotLightAmbientShader = gl.getUniformLocation( Cube.shaderProgram, "spotlightAmbient" );
		Cube.uSpotLightDiffuseShader = gl.getUniformLocation( Cube.shaderProgram, "spotlightDiffuse" );
		Cube.uSpotLightSpecularShader = gl.getUniformLocation( Cube.shaderProgram, "spotlightSpecular" );
        Cube.uSpotLightLoc = gl.getUniformLocation( Cube.shaderProgram, "spotlightLoc");
		Cube.uSpotLightAlpha = gl.getUniformLocation( Cube.shaderProgram, "spotlightAlpha");
		Cube.uSpotLightCutoff = gl.getUniformLocation( Cube.shaderProgram, "spotlightCutoff");

    }
    
    static initializeTexture(){
        var imagePX = new Image();
        var imageNX = new Image();
        var imagePY = new Image();
        var imageNY = new Image();
        var imagePZ = new Image();
        var imageNZ = new Image();
        
        Cube.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, Cube.texture);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);


        imagePX.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, Cube.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imagePX);
            
            Cube.imageLoaded++;
        };
        
        imagePX.src = "./textures/crate_texture.jpg";


        imageNX.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, Cube.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imageNX);
            
            Cube.imageLoaded++;
        };

        imageNX.src = "./textures/crate_texture.jpg";

        imagePY.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, Cube.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imagePY);
            
            Cube.imageLoaded++;
        };

        imagePY.src = "./textures/crate_texture.jpg";


        imageNY.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, Cube.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imageNY);
            
            Cube.imageLoaded++;
        };

        imageNY.src = "./textures/crate_texture.jpg";


        imagePZ.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, Cube.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imagePZ);
        
            Cube.imageLoaded++;
        };
        
        imagePZ.src = "./textures/crate_texture.jpg";

        imageNZ.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, Cube.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imageNZ);
            
            Cube.imageLoaded++;
        };

        imageNZ.src = "./textures/crate_texture.jpg";

    }
    
    constructor(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh){
        super(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh);
        if(Cube.shaderProgram == -1){
            Cube.initialize()
            Cube.initializeTexture();
        }
        
    }
    
    draw() {
        if(Cube.texture == -1 && Cube.imageLoaded != 6)  //only draw when texture is loaded.
        	return;
        
        gl.useProgram(Cube.shaderProgram);
        
        gl.bindBuffer( gl.ARRAY_BUFFER, Cube.positionBuffer);
       	gl.vertexAttribPointer(Cube.aPositionShader, 3, gl.FLOAT, false, 0, 0 );
       	
       	gl.activeTexture(gl.TEXTURE0);
       	gl.bindTexture(gl.TEXTURE_CUBE_MAP, Cube.texture);
       	gl.uniform1i(Cube.textureUnit,0);
	
       	gl.uniformMatrix4fv(Cube.uModelMatrixShader, false, flatten(this.modelMatrix));
        gl.uniformMatrix4fv(Cube.uCameraMatrixShader, false, flatten(camera1.cameraMatrix));
        gl.uniformMatrix4fv(Cube.uProjectionMatrixShader, false, flatten(camera1.projectionMatrix));

        gl.uniform4fv(Cube.uMatAmbientShader, this.matAmbient);
		gl.uniform4fv(Cube.uMatDiffuseShader, this.matDiffuse);
		gl.uniform4fv(Cube.uMatSpecularShader, this.matSpecular);
		gl.uniform1f(Cube.uMatAlphaShader, this.matAlpha);


        //spotlight
		gl.uniform3fv(Cube.uSpotLightDirectionShader, light1.direction);
		gl.uniform4fv(Cube.uSpotLightAmbientShader, light1.ambient);
		gl.uniform4fv(Cube.uSpotLightDiffuseShader, light1.diffuse);
		gl.uniform4fv(Cube.uSpotLightSpecularShader, light1.specular);
        gl.uniform3fv(Cube.uSpotLightLoc, light1.location);
		gl.uniform1f(Cube.uSpotLightAlpha, light1.alpha); 
		gl.uniform1f(Cube.uSpotLightCutoff, light1.cutoff); 
                    
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Cube.indexBuffer);
	
        gl.enableVertexAttribArray(Cube.aPositionShader);  
        gl.enableVertexAttribArray(Cube.aNormalShader);    
    	gl.drawElements(gl.TRIANGLES, Cube.indices.length, gl.UNSIGNED_INT, 0);
    	gl.disableVertexAttribArray(Cube.aPositionShader);    
        gl.disableVertexAttribArray(Cube.aNormalShader);    

    }
}