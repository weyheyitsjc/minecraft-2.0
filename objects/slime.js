class Slime extends Drawable{
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
        for (var i = 0; i<Slime.vertexPositions.length; i++) {
            normalSum.push(vec3(0, 0, 0));
            counts.push(0);
        }
        
        //for each triangle
        for (var i = 0; i<Slime.indices.length; i+=3) {
            var a = Slime.indices[i];
            var b = Slime.indices[i+1];
            var c = Slime.indices[i+2];
            
            var edge1 = subtract(Slime.vertexPositions[c],Slime.vertexPositions[b]);
            var edge2 = subtract(Slime.vertexPositions[a],Slime.vertexPositions[b]);
            var N = cross(edge1,edge2);
            
            normalSum[a] = add(normalSum[a],normalize(N));
            counts[a]++;
            normalSum[b] = add(normalSum[b],normalize(N));
            counts[b]++;
            normalSum[c] = add(normalSum[c],normalize(N));
            counts[c]++;
        
        }
        for (var i = 0; i < Slime.vertexPositions.length; i++) {
            Slime.vertexNormals[i] = mult(1.0/counts[i],normalSum[i]);
        }
    }

    static initialize() {
        Slime.computeNormals();
    	Slime.shaderProgram = initShaders( gl, "/glsl/lightcubevshader.glsl", "/glsl/lightcubefshader.glsl");
    	gl.useProgram(Slime.shaderProgram );
		
        // Load the data into the GPU
        Slime.positionBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, Slime.positionBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(Slime.vertexPositions), gl.STATIC_DRAW );
        
        Slime.textureUnit = gl.getUniformLocation(Slime.shaderProgram, "textureUnit");

        Slime.indexBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Slime.indexBuffer);
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(Slime.indices), gl.STATIC_DRAW );
            
        // Associate our shader variables with our data buffer
        Slime.aPositionShader = gl.getAttribLocation( Slime.shaderProgram, "aPosition" );
        Slime.aNormalShader = gl.getAttribLocation( Slime.shaderProgram, "aNormal" );
        
        Slime.uModelMatrixShader = gl.getUniformLocation( Slime.shaderProgram, "modelMatrix" );
        Slime.uCameraMatrixShader = gl.getUniformLocation( Slime.shaderProgram, "cameraMatrix" );
        Slime.uProjectionMatrixShader = gl.getUniformLocation( Slime.shaderProgram, "projectionMatrix" );

        Slime.uMatAmbientShader = gl.getUniformLocation( Slime.shaderProgram, "matAmbient" );
		Slime.uMatDiffuseShader = gl.getUniformLocation( Slime.shaderProgram, "matDiffuse" );
		Slime.uMatSpecularShader = gl.getUniformLocation( Slime.shaderProgram, "matSpecular" );
		Slime.uMatAlphaShader = gl.getUniformLocation( Slime.shaderProgram, "matAlpha" );

        //spotlight
		Slime.uSpotLightDirectionShader = gl.getUniformLocation( Slime.shaderProgram, "spotlightDirection" );
		Slime.uSpotLightAmbientShader = gl.getUniformLocation( Slime.shaderProgram, "spotlightAmbient" );
		Slime.uSpotLightDiffuseShader = gl.getUniformLocation( Slime.shaderProgram, "spotlightDiffuse" );
		Slime.uSpotLightSpecularShader = gl.getUniformLocation( Slime.shaderProgram, "spotlightSpecular" );
        Slime.uSpotLightLoc = gl.getUniformLocation( Slime.shaderProgram, "spotlightLoc");
		Slime.uSpotLightAlpha = gl.getUniformLocation( Slime.shaderProgram, "spotlightAlpha");
		Slime.uSpotLightCutoff = gl.getUniformLocation( Slime.shaderProgram, "spotlightCutoff");

    }
    
    static initializeTexture(){
        var imagePX = new Image();
        var imageNX = new Image();
        var imagePY = new Image();
        var imageNY = new Image();
        var imagePZ = new Image();
        var imageNZ = new Image();
        
        Slime.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, Slime.texture);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);


        imagePX.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, Slime.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imagePX);
            
            Slime.imageLoaded++;
        };
        
        imagePX.src = "./textures/slime/slime_body.jpg";


        imageNX.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, Slime.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imageNX);
            
            Slime.imageLoaded++;
        };

        imageNX.src = "./textures/slime/slime_body.jpg";

        imagePY.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, Slime.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imagePY);
            
            Slime.imageLoaded++;
        };

        imagePY.src = "./textures/slime/slime_body.jpg";


        imageNY.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, Slime.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imageNY);
            
            Slime.imageLoaded++;
        };

        imageNY.src = "./textures/slime/slime_body.jpg";


        imagePZ.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, Slime.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imagePZ);
        
            Slime.imageLoaded++;
        };
        
        imagePZ.src = "./textures/slime/slime_face.jpg";

        imageNZ.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, Slime.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imageNZ);
            
            Slime.imageLoaded++;
        };

        imageNZ.src = "./textures/slime/slime_body.jpg";

    }
    
    constructor(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh){
        super(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh);
        if(Slime.shaderProgram == -1){
            Slime.initialize()
            Slime.initializeTexture();
        }
        
    }
    
    draw() {
        if((Slime.texture == -1) || (Slime.imageLoaded != 6))  //only draw when texture is loaded.
        	return;
        
        gl.useProgram(Slime.shaderProgram);
        
        gl.bindBuffer( gl.ARRAY_BUFFER, Slime.positionBuffer);
       	gl.vertexAttribPointer(Slime.aPositionShader, 3, gl.FLOAT, false, 0, 0 );
       	
       	gl.activeTexture(gl.TEXTURE0);
       	gl.bindTexture(gl.TEXTURE_CUBE_MAP, Slime.texture);
       	gl.uniform1i(Slime.textureUnit,0);
	
       	gl.uniformMatrix4fv(Slime.uModelMatrixShader, false, flatten(this.modelMatrix));
        gl.uniformMatrix4fv(Slime.uCameraMatrixShader, false, flatten(camera1.cameraMatrix));
        gl.uniformMatrix4fv(Slime.uProjectionMatrixShader, false, flatten(camera1.projectionMatrix));

        gl.uniform4fv(Slime.uMatAmbientShader, this.matAmbient);
		gl.uniform4fv(Slime.uMatDiffuseShader, this.matDiffuse);
		gl.uniform4fv(Slime.uMatSpecularShader, this.matSpecular);
		gl.uniform1f(Slime.uMatAlphaShader, this.matAlpha);


        //spotlight
		gl.uniform3fv(Slime.uSpotLightDirectionShader, light1.direction);
		gl.uniform4fv(Slime.uSpotLightAmbientShader, light1.ambient);
		gl.uniform4fv(Slime.uSpotLightDiffuseShader, light1.diffuse);
		gl.uniform4fv(Slime.uSpotLightSpecularShader, light1.specular);
        gl.uniform3fv(Slime.uSpotLightLoc, light1.location);
		gl.uniform1f(Slime.uSpotLightAlpha, light1.alpha); 
		gl.uniform1f(Slime.uSpotLightCutoff, light1.cutoff); 
                    
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Slime.indexBuffer);
	
        gl.enableVertexAttribArray(Slime.aPositionShader);  
        gl.enableVertexAttribArray(Slime.aNormalShader);    
    	gl.drawElements(gl.TRIANGLES, Slime.indices.length, gl.UNSIGNED_INT, 0);
    	gl.disableVertexAttribArray(Slime.aPositionShader);    
        gl.disableVertexAttribArray(Slime.aNormalShader);    

    }
}