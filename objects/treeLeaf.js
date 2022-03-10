class TreeLeaf extends Drawable{
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
        for (var i = 0; i<TreeLeaf.vertexPositions.length; i++) {
            normalSum.push(vec3(0, 0, 0));
            counts.push(0);
        }
        
        //for each triangle
        for (var i = 0; i<TreeLeaf.indices.length; i+=3) {
            var a = TreeLeaf.indices[i];
            var b = TreeLeaf.indices[i+1];
            var c = TreeLeaf.indices[i+2];
            
            var edge1 = subtract(TreeLeaf.vertexPositions[c],TreeLeaf.vertexPositions[b]);
            var edge2 = subtract(TreeLeaf.vertexPositions[a],TreeLeaf.vertexPositions[b]);
            var N = cross(edge1,edge2);
            
            normalSum[a] = add(normalSum[a],normalize(N));
            counts[a]++;
            normalSum[b] = add(normalSum[b],normalize(N));
            counts[b]++;
            normalSum[c] = add(normalSum[c],normalize(N));
            counts[c]++;
        
        }
        for (var i = 0; i < TreeLeaf.vertexPositions.length; i++) {
            TreeLeaf.vertexNormals[i] = mult(1.0/counts[i],normalSum[i]);
        }
    }

    static initialize() {
        TreeLeaf.computeNormals();
    	TreeLeaf.shaderProgram = initShaders( gl, "/glsl/lightcubevshader.glsl", "/glsl/lightcubefshader.glsl");
    	gl.useProgram(TreeLeaf.shaderProgram );
		
        // Load the data into the GPU
        TreeLeaf.positionBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, TreeLeaf.positionBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(TreeLeaf.vertexPositions), gl.STATIC_DRAW );
        
        TreeLeaf.textureUnit = gl.getUniformLocation(TreeLeaf.shaderProgram, "textureUnit");

        TreeLeaf.normalBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, TreeLeaf.normalBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(TreeLeaf.vertexNormals), gl.STATIC_DRAW );

        TreeLeaf.indexBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, TreeLeaf.indexBuffer);
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(TreeLeaf.indices), gl.STATIC_DRAW );
            
        // Associate our shader variables with our data buffer
        TreeLeaf.aPositionShader = gl.getAttribLocation( TreeLeaf.shaderProgram, "aPosition" );
        TreeLeaf.aNormalShader = gl.getAttribLocation( TreeLeaf.shaderProgram, "aNormal" );
        
        TreeLeaf.uModelMatrixShader = gl.getUniformLocation( TreeLeaf.shaderProgram, "modelMatrix" );
        TreeLeaf.uCameraMatrixShader = gl.getUniformLocation( TreeLeaf.shaderProgram, "cameraMatrix" );
        TreeLeaf.uProjectionMatrixShader = gl.getUniformLocation( TreeLeaf.shaderProgram, "projectionMatrix" );

        TreeLeaf.uMatAmbientShader = gl.getUniformLocation( TreeLeaf.shaderProgram, "matAmbient" );
		TreeLeaf.uMatDiffuseShader = gl.getUniformLocation( TreeLeaf.shaderProgram, "matDiffuse" );
		TreeLeaf.uMatSpecularShader = gl.getUniformLocation( TreeLeaf.shaderProgram, "matSpecular" );
		TreeLeaf.uMatAlphaShader = gl.getUniformLocation( TreeLeaf.shaderProgram, "matAlpha" );

        //directional light
		TreeLeaf.uLightDirectionShader = gl.getUniformLocation( TreeLeaf.shaderProgram, "lightDirection" );
		TreeLeaf.uLightAmbientShader = gl.getUniformLocation( TreeLeaf.shaderProgram, "lightAmbient" );
		TreeLeaf.uLightDiffuseShader = gl.getUniformLocation( TreeLeaf.shaderProgram, "lightDiffuse" );
		TreeLeaf.uLightSpecularShader = gl.getUniformLocation( TreeLeaf.shaderProgram, "lightSpecular" );

        //spotlight
		TreeLeaf.uSpotLightDirectionShader = gl.getUniformLocation( TreeLeaf.shaderProgram, "spotlightDirection" );
		TreeLeaf.uSpotLightAmbientShader = gl.getUniformLocation( TreeLeaf.shaderProgram, "spotlightAmbient" );
		TreeLeaf.uSpotLightDiffuseShader = gl.getUniformLocation( TreeLeaf.shaderProgram, "spotlightDiffuse" );
		TreeLeaf.uSpotLightSpecularShader = gl.getUniformLocation( TreeLeaf.shaderProgram, "spotlightSpecular" );
        TreeLeaf.uSpotLightLoc = gl.getUniformLocation( TreeLeaf.shaderProgram, "spotlightLoc");
		TreeLeaf.uSpotLightAlpha = gl.getUniformLocation( TreeLeaf.shaderProgram, "spotlightAlpha");
		TreeLeaf.uSpotLightCutoff = gl.getUniformLocation( TreeLeaf.shaderProgram, "spotlightCutoff");
        TreeLeaf.uSpotLightStatus = gl.getUniformLocation( TreeLeaf.shaderProgram, "spotlightStatus");

    }
    
    static initializeTexture(){
        var imagePX = new Image();
        var imageNX = new Image();
        var imagePY = new Image();
        var imageNY = new Image();
        var imagePZ = new Image();
        var imageNZ = new Image();
        
        TreeLeaf.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, TreeLeaf.texture);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);


        imagePX.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, TreeLeaf.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imagePX);
            
            TreeLeaf.imageLoaded++;
        };
        
        imagePX.src = "./textures/tree/oak-leaf.jpg";


        imageNX.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, TreeLeaf.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imageNX);
            
            TreeLeaf.imageLoaded++;
        };

        imageNX.src = "./textures/tree/oak-leaf.jpg";

        imagePY.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, TreeLeaf.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imagePY);
            
            TreeLeaf.imageLoaded++;
        };

        imagePY.src = "./textures/tree/oak-leaf.jpg";


        imageNY.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, TreeLeaf.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imageNY);
            
            TreeLeaf.imageLoaded++;
        };

        imageNY.src = "./textures/tree/oak-leaf.jpg";


        imagePZ.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, TreeLeaf.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imagePZ);
        
            TreeLeaf.imageLoaded++;
        };
        
        imagePZ.src = "./textures/tree/oak-leaf.jpg";

        imageNZ.onload = function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, TreeLeaf.texture);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imageNZ);
            
            TreeLeaf.imageLoaded++;
        };

        imageNZ.src = "./textures/tree/oak-leaf.jpg";

    }
    
    constructor(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh){
        super(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh);
        if(TreeLeaf.shaderProgram == -1){
            TreeLeaf.initialize()
            TreeLeaf.initializeTexture();
        }
        
    }
    
    draw() {
        if((TreeLeaf.texture == -1) || (TreeLeaf.imageLoaded != 6)) {  //only draw when texture is loaded.
        	return;
        }
        
        gl.useProgram(TreeLeaf.shaderProgram);
        
        gl.bindBuffer( gl.ARRAY_BUFFER, TreeLeaf.positionBuffer);
       	gl.vertexAttribPointer(TreeLeaf.aPositionShader, 3, gl.FLOAT, false, 0, 0 );

       	gl.activeTexture(gl.TEXTURE0);
       	gl.bindTexture(gl.TEXTURE_CUBE_MAP, TreeLeaf.texture);
       	gl.uniform1i(TreeLeaf.textureUnit,0);
        
        gl.bindBuffer( gl.ARRAY_BUFFER, TreeLeaf.normalBuffer);
       	gl.vertexAttribPointer(TreeLeaf.aNormalShader, 3, gl.FLOAT, false, 0, 0 );
	
       	gl.uniformMatrix4fv(TreeLeaf.uModelMatrixShader, false, flatten(this.modelMatrix));
        gl.uniformMatrix4fv(TreeLeaf.uCameraMatrixShader, false, flatten(camera1.cameraMatrix));
        gl.uniformMatrix4fv(TreeLeaf.uProjectionMatrixShader, false, flatten(camera1.projectionMatrix));

        gl.uniform4fv(TreeLeaf.uMatAmbientShader, this.matAmbient);
		gl.uniform4fv(TreeLeaf.uMatDiffuseShader, this.matDiffuse);
		gl.uniform4fv(TreeLeaf.uMatSpecularShader, this.matSpecular);
		gl.uniform1f(TreeLeaf.uMatAlphaShader, this.matAlpha);

        //directional light
		gl.uniform3fv(TreeLeaf.uLightDirectionShader, light1.direction);
		gl.uniform4fv(TreeLeaf.uLightAmbientShader, light1.ambient);
		gl.uniform4fv(TreeLeaf.uLightDiffuseShader, light1.diffuse);
		gl.uniform4fv(TreeLeaf.uLightSpecularShader, light1.specular);

        //spotlight
		gl.uniform3fv(TreeLeaf.uSpotLightDirectionShader, light2.direction);
		gl.uniform4fv(TreeLeaf.uSpotLightAmbientShader, light2.ambient);
		gl.uniform4fv(TreeLeaf.uSpotLightDiffuseShader, light2.diffuse);
		gl.uniform4fv(TreeLeaf.uSpotLightSpecularShader, light2.specular);
        gl.uniform3fv(TreeLeaf.uSpotLightLoc, light2.location);
		gl.uniform1f(TreeLeaf.uSpotLightAlpha, light2.alpha); 
		gl.uniform1f(TreeLeaf.uSpotLightCutoff, light2.cutoff); 
        gl.uniform1f(TreeLeaf.uSpotLightStatus, light2.status); 
                    
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, TreeLeaf.indexBuffer);
	
        gl.enableVertexAttribArray(TreeLeaf.aPositionShader);  
        gl.enableVertexAttribArray(TreeLeaf.aNormalShader);    
    	gl.drawElements(gl.TRIANGLES, TreeLeaf.indices.length, gl.UNSIGNED_INT, 0);
    	gl.disableVertexAttribArray(TreeLeaf.aPositionShader);    
        gl.disableVertexAttribArray(TreeLeaf.aNormalShader);    

    }
}