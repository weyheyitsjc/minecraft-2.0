class TreeBottomTriangle extends Drawable{
    static vertexPositions = [
        vec3( -1, 0, 1 ),//0
        vec3( 1, 0, 1 ),//1
        vec3( 1, 0, -1 ),//2
        vec3( -1, 0, -1 ),//3
        vec3( -1, 0, 1 ),//0
        vec3( 1, 0, 1 ),//1
        vec3( 0, 2, 0 ),//4 
        vec3( 1, 0, 1 ),//1
        vec3( 1, 0, -1 ),//2
        vec3( 0, 2, 0 ),//4 
        vec3( 1, 0, -1 ),//2
        vec3( -1, 0, -1 ),//3
        vec3( 0, 2, 0 ),//4 
        vec3( -1, 0, -1 ),//3
        vec3( -1, 0, 1 ),//0
        vec3( 0, 2, 0 ),//4 

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
        for (var i = 0; i<TreeBottomTriangle.vertexPositions.length; i++) {
            normalSum.push(vec3(0, 0, 0));
            counts.push(0);
        }
        
        //for each triangle
        for (var i = 0; i<TreeBottomTriangle.indices.length; i+=3) {
            var a = TreeBottomTriangle.indices[i];
            var b = TreeBottomTriangle.indices[i+1];
            var c = TreeBottomTriangle.indices[i+2];
            
            var edge1 = subtract(TreeBottomTriangle.vertexPositions[c],TreeBottomTriangle.vertexPositions[b]);
            var edge2 = subtract(TreeBottomTriangle.vertexPositions[a],TreeBottomTriangle.vertexPositions[b]);
            var N = cross(edge1,edge2);
            
            normalSum[a] = add(normalSum[a],normalize(N));
            counts[a]++;
            normalSum[b] = add(normalSum[b],normalize(N));
            counts[b]++;
            normalSum[c] = add(normalSum[c],normalize(N));
            counts[c]++;
        
        }
            
        for (var i = 0; i < TreeBottomTriangle.vertexPositions.length; i++) {
            TreeBottomTriangle.vertexNormals[i] = mult(1.0/counts[i],normalSum[i]);
        }
    }

    static initialize() {
        TreeBottomTriangle.computeNormals();
    	TreeBottomTriangle.shaderProgram = initShaders( gl, "/glsl/lightvshader.glsl", "/glsl/lightfshader.glsl");
    	gl.useProgram(TreeBottomTriangle.shaderProgram );
		
        // Load the data into the GPU
        TreeBottomTriangle.positionBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, TreeBottomTriangle.positionBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(TreeBottomTriangle.vertexPositions), gl.STATIC_DRAW );

        TreeBottomTriangle.normalBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, TreeBottomTriangle.normalBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(TreeBottomTriangle.vertexNormals), gl.STATIC_DRAW );
        
        TreeBottomTriangle.textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, TreeBottomTriangle.textureCoordBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(TreeBottomTriangle.vertexTextureCoords), gl.STATIC_DRAW );
        
        TreeBottomTriangle.uTextureUnit = gl.getUniformLocation(TreeBottomTriangle.shaderProgram, "uTextureUnit");

        TreeBottomTriangle.indexBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, TreeBottomTriangle.indexBuffer);
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(TreeBottomTriangle.indices), gl.STATIC_DRAW );
            
        // Associate our shader variables with our data buffer
        TreeBottomTriangle.aPositionShader = gl.getAttribLocation( TreeBottomTriangle.shaderProgram, "aPosition" );
        TreeBottomTriangle.aTextureCoordShader = gl.getAttribLocation( TreeBottomTriangle.shaderProgram, "aTextureCoord" );
        TreeBottomTriangle.aNormalShader = gl.getAttribLocation( TreeBottomTriangle.shaderProgram, "aNormal" );
        
        TreeBottomTriangle.uModelMatrixShader = gl.getUniformLocation( TreeBottomTriangle.shaderProgram, "modelMatrix" );
        TreeBottomTriangle.uCameraMatrixShader = gl.getUniformLocation( TreeBottomTriangle.shaderProgram, "cameraMatrix" );
        TreeBottomTriangle.uProjectionMatrixShader = gl.getUniformLocation( TreeBottomTriangle.shaderProgram, "projectionMatrix" );

        TreeBottomTriangle.uMatAmbientShader = gl.getUniformLocation( TreeBottomTriangle.shaderProgram, "matAmbient" );
		TreeBottomTriangle.uMatDiffuseShader = gl.getUniformLocation( TreeBottomTriangle.shaderProgram, "matDiffuse" );
		TreeBottomTriangle.uMatSpecularShader = gl.getUniformLocation( TreeBottomTriangle.shaderProgram, "matSpecular" );
		TreeBottomTriangle.uMatAlphaShader = gl.getUniformLocation( TreeBottomTriangle.shaderProgram, "matAlpha" );

        //directional light
		TreeBottomTriangle.uLightDirectionShader = gl.getUniformLocation( TreeBottomTriangle.shaderProgram, "lightDirection" );
		TreeBottomTriangle.uLightAmbientShader = gl.getUniformLocation( TreeBottomTriangle.shaderProgram, "lightAmbient" );
		TreeBottomTriangle.uLightDiffuseShader = gl.getUniformLocation( TreeBottomTriangle.shaderProgram, "lightDiffuse" );
		TreeBottomTriangle.uLightSpecularShader = gl.getUniformLocation( TreeBottomTriangle.shaderProgram, "lightSpecular" );

        //spotlight
		TreeBottomTriangle.uSpotLightDirectionShader = gl.getUniformLocation( TreeBottomTriangle.shaderProgram, "spotlightDirection" );
		TreeBottomTriangle.uSpotLightAmbientShader = gl.getUniformLocation( TreeBottomTriangle.shaderProgram, "spotlightAmbient" );
		TreeBottomTriangle.uSpotLightDiffuseShader = gl.getUniformLocation( TreeBottomTriangle.shaderProgram, "spotlightDiffuse" );
		TreeBottomTriangle.uSpotLightSpecularShader = gl.getUniformLocation( TreeBottomTriangle.shaderProgram, "spotlightSpecular" );
        TreeBottomTriangle.uSpotLightLoc = gl.getUniformLocation( TreeBottomTriangle.shaderProgram, "spotlightLoc");
		TreeBottomTriangle.uSpotLightAlpha = gl.getUniformLocation( TreeBottomTriangle.shaderProgram, "spotlightAlpha");
		TreeBottomTriangle.uSpotLightCutoff = gl.getUniformLocation( TreeBottomTriangle.shaderProgram, "spotlightCutoff");
        TreeBottomTriangle.uSpotLightStatus = gl.getUniformLocation( TreeBottomTriangle.shaderProgram, "spotlightStatus");

    }
    
    static initializeTexture(){
        var image = new Image();

        image.onload = function(){
            TreeBottomTriangle.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, TreeBottomTriangle.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, image.width, image.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image);
            
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            
            TreeBottomTriangle.imageLoaded++;
        }
        
        image.src = "./textures/tree/tree-bottom.jpg";
    }
    
    constructor(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh){
        super(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh);
        if(TreeBottomTriangle.shaderProgram == -1){
            TreeBottomTriangle.initialize()
            TreeBottomTriangle.initializeTexture();
        }
        
    }
    
    draw() {
        if((TreeBottomTriangle.texture == -1) || (TreeBottomTriangle.imageLoaded != 1))  //only draw when texture is loaded.
        	return;
        
        gl.useProgram(TreeBottomTriangle.shaderProgram);
        
        gl.bindBuffer( gl.ARRAY_BUFFER, TreeBottomTriangle.positionBuffer);
       	gl.vertexAttribPointer(TreeBottomTriangle.aPositionShader, 3, gl.FLOAT, false, 0, 0 );
        
        gl.bindBuffer( gl.ARRAY_BUFFER, TreeBottomTriangle.normalBuffer);
       	gl.vertexAttribPointer(TreeBottomTriangle.aNormalShader, 3, gl.FLOAT, false, 0, 0 );
       	
       	gl.bindBuffer( gl.ARRAY_BUFFER, TreeBottomTriangle.textureCoordBuffer);
       	gl.vertexAttribPointer(TreeBottomTriangle.aTextureCoordShader, 2, gl.FLOAT, false, 0, 0 );
       	
       	gl.activeTexture(gl.TEXTURE0);
       	gl.bindTexture(gl.TEXTURE_2D, TreeBottomTriangle.texture);
       	gl.uniform1i(TreeBottomTriangle.uTextureUnit,0);

	
       	gl.uniformMatrix4fv(TreeBottomTriangle.uModelMatrixShader, false, flatten(this.modelMatrix));
        gl.uniformMatrix4fv(TreeBottomTriangle.uCameraMatrixShader, false, flatten(camera1.cameraMatrix));
        gl.uniformMatrix4fv(TreeBottomTriangle.uProjectionMatrixShader, false, flatten(camera1.projectionMatrix));

        gl.uniform4fv(TreeBottomTriangle.uMatAmbientShader, this.matAmbient);
		gl.uniform4fv(TreeBottomTriangle.uMatDiffuseShader, this.matDiffuse);
		gl.uniform4fv(TreeBottomTriangle.uMatSpecularShader, this.matSpecular);
		gl.uniform1f(TreeBottomTriangle.uMatAlphaShader, this.matAlpha);

        //directional light
		gl.uniform3fv(TreeBottomTriangle.uLightDirectionShader, light1.direction);
		gl.uniform4fv(TreeBottomTriangle.uLightAmbientShader, light1.ambient);
		gl.uniform4fv(TreeBottomTriangle.uLightDiffuseShader, light1.diffuse);
		gl.uniform4fv(TreeBottomTriangle.uLightSpecularShader, light1.specular);

        //spotlight
		gl.uniform3fv(TreeBottomTriangle.uSpotLightDirectionShader, light2.direction);
		gl.uniform4fv(TreeBottomTriangle.uSpotLightAmbientShader, light2.ambient);
		gl.uniform4fv(TreeBottomTriangle.uSpotLightDiffuseShader, light2.diffuse);
		gl.uniform4fv(TreeBottomTriangle.uSpotLightSpecularShader, light2.specular);
        gl.uniform3fv(TreeBottomTriangle.uSpotLightLoc, light2.location);
		gl.uniform1f(TreeBottomTriangle.uSpotLightAlpha, light2.alpha); 
		gl.uniform1f(TreeBottomTriangle.uSpotLightCutoff, light2.cutoff); 
        gl.uniform1f(TreeBottomTriangle.uSpotLightStatus, light2.status); 
                    
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, TreeBottomTriangle.indexBuffer);
	
        gl.enableVertexAttribArray(TreeBottomTriangle.aPositionShader);    
        gl.enableVertexAttribArray(TreeBottomTriangle.aTextureCoordShader);
        gl.enableVertexAttribArray(TreeBottomTriangle.aNormalShader);    
    	gl.drawElements(gl.TRIANGLES, TreeBottomTriangle.indices.length, gl.UNSIGNED_INT, 0);
    	gl.disableVertexAttribArray(TreeBottomTriangle.aPositionShader);    
    	gl.disableVertexAttribArray(TreeBottomTriangle.aTextureCoordShader);    
        gl.disableVertexAttribArray(TreeBottomTriangle.aNormalShader);    
    }
}