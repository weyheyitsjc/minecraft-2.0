class TreeTrunk extends Drawable{
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
        for (var i = 0; i<TreeTrunk.vertexPositions.length; i++) {
            normalSum.push(vec3(0, 0, 0));
            counts.push(0);
        }
        
        //for each triangle
        for (var i = 0; i<TreeTrunk.indices.length; i+=3) {
            var a = TreeTrunk.indices[i];
            var b = TreeTrunk.indices[i+1];
            var c = TreeTrunk.indices[i+2];
            
            var edge1 = subtract(TreeTrunk.vertexPositions[c],TreeTrunk.vertexPositions[b]);
            var edge2 = subtract(TreeTrunk.vertexPositions[a],TreeTrunk.vertexPositions[b]);
            var N = cross(edge1,edge2);
            
            normalSum[a] = add(normalSum[a],normalize(N));
            counts[a]++;
            normalSum[b] = add(normalSum[b],normalize(N));
            counts[b]++;
            normalSum[c] = add(normalSum[c],normalize(N));
            counts[c]++;
        
        }
        for (var i = 0; i < TreeTrunk.vertexPositions.length; i++) {
            TreeTrunk.vertexNormals[i] = mult(1.0/counts[i],normalSum[i]);
        }
    }

    static initialize() {
        TreeTrunk.computeNormals();
    	TreeTrunk.shaderProgram = initShaders( gl, "/glsl/lightcubevshader.glsl", "/glsl/lightcubefshader.glsl");
    	gl.useProgram(TreeTrunk.shaderProgram );
		
        // Load the data into the GPU
        TreeTrunk.positionBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, TreeTrunk.positionBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(TreeTrunk.vertexPositions), gl.STATIC_DRAW );
        
        TreeTrunk.textureUnit = gl.getUniformLocation(TreeTrunk.shaderProgram, "textureUnit");

        TreeTrunk.indexBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, TreeTrunk.indexBuffer);
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(TreeTrunk.indices), gl.STATIC_DRAW );
            
        // Associate our shader variables with our data buffer
        TreeTrunk.aPositionShader = gl.getAttribLocation( TreeTrunk.shaderProgram, "aPosition" );
        TreeTrunk.aNormalShader = gl.getAttribLocation( TreeTrunk.shaderProgram, "aNormal" );
        
        TreeTrunk.uModelMatrixShader = gl.getUniformLocation( TreeTrunk.shaderProgram, "modelMatrix" );
        TreeTrunk.uCameraMatrixShader = gl.getUniformLocation( TreeTrunk.shaderProgram, "cameraMatrix" );
        TreeTrunk.uProjectionMatrixShader = gl.getUniformLocation( TreeTrunk.shaderProgram, "projectionMatrix" );

        TreeTrunk.uMatAmbientShader = gl.getUniformLocation( TreeTrunk.shaderProgram, "matAmbient" );
		TreeTrunk.uMatDiffuseShader = gl.getUniformLocation( TreeTrunk.shaderProgram, "matDiffuse" );
		TreeTrunk.uMatSpecularShader = gl.getUniformLocation( TreeTrunk.shaderProgram, "matSpecular" );
		TreeTrunk.uMatAlphaShader = gl.getUniformLocation( TreeTrunk.shaderProgram, "matAlpha" );

        //directional light
		TreeTrunk.uLightDirectionShader = gl.getUniformLocation( TreeTrunk.shaderProgram, "lightDirection" );
		TreeTrunk.uLightAmbientShader = gl.getUniformLocation( TreeTrunk.shaderProgram, "lightAmbient" );
		TreeTrunk.uLightDiffuseShader = gl.getUniformLocation( TreeTrunk.shaderProgram, "lightDiffuse" );
		TreeTrunk.uLightSpecularShader = gl.getUniformLocation( TreeTrunk.shaderProgram, "lightSpecular" );

        //spotlight
		TreeTrunk.uSpotLightDirectionShader = gl.getUniformLocation( TreeTrunk.shaderProgram, "spotlightDirection" );
		TreeTrunk.uSpotLightAmbientShader = gl.getUniformLocation( TreeTrunk.shaderProgram, "spotlightAmbient" );
		TreeTrunk.uSpotLightDiffuseShader = gl.getUniformLocation( TreeTrunk.shaderProgram, "spotlightDiffuse" );
		TreeTrunk.uSpotLightSpecularShader = gl.getUniformLocation( TreeTrunk.shaderProgram, "spotlightSpecular" );
        TreeTrunk.uSpotLightLoc = gl.getUniformLocation( TreeTrunk.shaderProgram, "spotlightLoc");
		TreeTrunk.uSpotLightAlpha = gl.getUniformLocation( TreeTrunk.shaderProgram, "spotlightAlpha");
		TreeTrunk.uSpotLightCutoff = gl.getUniformLocation( TreeTrunk.shaderProgram, "spotlightCutoff");
        TreeTrunk.uSpotLightStatus = gl.getUniformLocation( TreeTrunk.shaderProgram, "spotlightStatus");

    }
    
    static initializeTexture(){
        var imagePX = new Image();
        var imageNX = new Image();
        var imagePY = new Image();
        var imageNY = new Image();
        var imagePZ = new Image();
        var imageNZ = new Image();
        
        TreeTrunk.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, TreeTrunk.texture);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);


        imagePX.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, TreeTrunk.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imagePX);
            
            TreeTrunk.imageLoaded++;
        };
        
        imagePX.src = "./textures/tree/tree-bottom.jpg";


        imageNX.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, TreeTrunk.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imageNX);
            
            TreeTrunk.imageLoaded++;
        };

        imageNX.src = "./textures/tree/tree-bottom.jpg";

        imagePY.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, TreeTrunk.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imagePY);
            
            TreeTrunk.imageLoaded++;
        };

        imagePY.src = "./textures/tree/tree-bottom.jpg";


        imageNY.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, TreeTrunk.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imageNY);
            
            TreeTrunk.imageLoaded++;
        };

        imageNY.src = "./textures/tree/tree-bottom.jpg";


        imagePZ.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, TreeTrunk.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imagePZ);
        
            TreeTrunk.imageLoaded++;
        };
        
        imagePZ.src = "./textures/tree/tree-bottom.jpg";

        imageNZ.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, TreeTrunk.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imageNZ);
            
            TreeTrunk.imageLoaded++;
        };

        imageNZ.src = "./textures/tree/tree-bottom.jpg";

    }
    
    constructor(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh){
        super(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh);
        if(TreeTrunk.shaderProgram == -1){
            TreeTrunk.initialize()
            TreeTrunk.initializeTexture();
        }
        
    }
    
    draw() {
        if((TreeTrunk.texture == -1) || (TreeTrunk.imageLoaded != 6)) { //only draw when texture is loaded.
        	return;
        }
        
        gl.useProgram(TreeTrunk.shaderProgram);
        
        gl.bindBuffer( gl.ARRAY_BUFFER, TreeTrunk.positionBuffer);
       	gl.vertexAttribPointer(TreeTrunk.aPositionShader, 3, gl.FLOAT, false, 0, 0 );
       	
       	gl.activeTexture(gl.TEXTURE0);
       	gl.bindTexture(gl.TEXTURE_CUBE_MAP, TreeTrunk.texture);
       	gl.uniform1i(TreeTrunk.textureUnit,0);
	
       	gl.uniformMatrix4fv(TreeTrunk.uModelMatrixShader, false, flatten(this.modelMatrix));
        gl.uniformMatrix4fv(TreeTrunk.uCameraMatrixShader, false, flatten(camera1.cameraMatrix));
        gl.uniformMatrix4fv(TreeTrunk.uProjectionMatrixShader, false, flatten(camera1.projectionMatrix));

        gl.uniform4fv(TreeTrunk.uMatAmbientShader, this.matAmbient);
		gl.uniform4fv(TreeTrunk.uMatDiffuseShader, this.matDiffuse);
		gl.uniform4fv(TreeTrunk.uMatSpecularShader, this.matSpecular);
		gl.uniform1f(TreeTrunk.uMatAlphaShader, this.matAlpha);

        //directional light
		gl.uniform3fv(TreeTrunk.uLightDirectionShader, light1.direction);
		gl.uniform4fv(TreeTrunk.uLightAmbientShader, light1.ambient);
		gl.uniform4fv(TreeTrunk.uLightDiffuseShader, light1.diffuse);
		gl.uniform4fv(TreeTrunk.uLightSpecularShader, light1.specular);

        //spotlight
		gl.uniform3fv(TreeTrunk.uSpotLightDirectionShader, light2.direction);
		gl.uniform4fv(TreeTrunk.uSpotLightAmbientShader, light2.ambient);
		gl.uniform4fv(TreeTrunk.uSpotLightDiffuseShader, light2.diffuse);
		gl.uniform4fv(TreeTrunk.uSpotLightSpecularShader, light2.specular);
        gl.uniform3fv(TreeTrunk.uSpotLightLoc, light2.location);
		gl.uniform1f(TreeTrunk.uSpotLightAlpha, light2.alpha); 
		gl.uniform1f(TreeTrunk.uSpotLightCutoff, light2.cutoff); 
        gl.uniform1f(TreeTrunk.uSpotLightStatus, light2.status); 
                    
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, TreeTrunk.indexBuffer);
	
        gl.enableVertexAttribArray(TreeTrunk.aPositionShader);  
        gl.enableVertexAttribArray(TreeTrunk.aNormalShader);    
    	gl.drawElements(gl.TRIANGLES, TreeTrunk.indices.length, gl.UNSIGNED_INT, 0);
    	gl.disableVertexAttribArray(TreeTrunk.aPositionShader);    
        gl.disableVertexAttribArray(TreeTrunk.aNormalShader);    

    }
}