class TreeTopTriangle extends Drawable{
    static vertexPositions = [
        vec3( -2, 0, 2 ),//0
        vec3( 2, 0, 2 ),//1
        vec3( 2, 0, -2 ),//2
        vec3( -2, 0, -2 ),//3
        vec3( -2, 0, 2 ),//0
        vec3( 2, 0, 2 ),//1
        vec3( 0, 3, 0 ),//4 
        vec3( 2, 0, 2 ),//1
        vec3( 2, 0, -2 ),//2
        vec3( 0, 3, 0 ),//4 
        vec3( 2, 0, -2 ),//2
        vec3( -2, 0, -2 ),//3
        vec3( 0, 3, 0 ),//4 
        vec3( -2, 0, -2 ),//3
        vec3( -2, 0, 2 ),//0
        vec3( 0, 3, 0 ),//4 

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
        for (var i = 0; i<TreeTopTriangle.vertexPositions.length; i++) {
            normalSum.push(vec3(0, 0, 0));
            counts.push(0);
        }
        
        //for each triangle
        for (var i = 0; i<TreeTopTriangle.indices.length; i+=3) {
            var a = TreeTopTriangle.indices[i];
            var b = TreeTopTriangle.indices[i+1];
            var c = TreeTopTriangle.indices[i+2];
            
            var edge1 = subtract(TreeTopTriangle.vertexPositions[c],TreeTopTriangle.vertexPositions[b]);
            var edge2 = subtract(TreeTopTriangle.vertexPositions[a],TreeTopTriangle.vertexPositions[b]);
            var N = cross(edge1,edge2);
            
            normalSum[a] = add(normalSum[a],normalize(N));
            counts[a]++;
            normalSum[b] = add(normalSum[b],normalize(N));
            counts[b]++;
            normalSum[c] = add(normalSum[c],normalize(N));
            counts[c]++;
        
        }
            
        for (var i = 0; i < TreeTopTriangle.vertexPositions.length; i++) {
            TreeTopTriangle.vertexNormals[i] = mult(1.0/counts[i],normalSum[i]);
        }
    }

    static initialize() {
        TreeTopTriangle.computeNormals();
    	TreeTopTriangle.shaderProgram = initShaders( gl, "/glsl/lightvshader.glsl", "/glsl/lightfshader.glsl");
    	gl.useProgram(TreeTopTriangle.shaderProgram );
		
        // Load the data into the GPU
        TreeTopTriangle.positionBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, TreeTopTriangle.positionBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(TreeTopTriangle.vertexPositions), gl.STATIC_DRAW );

        TreeTopTriangle.normalBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, TreeTopTriangle.normalBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(TreeTopTriangle.vertexNormals), gl.STATIC_DRAW );
        
        TreeTopTriangle.textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, TreeTopTriangle.textureCoordBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(TreeTopTriangle.vertexTextureCoords), gl.STATIC_DRAW );
        
        TreeTopTriangle.uTextureUnit = gl.getUniformLocation(TreeTopTriangle.shaderProgram, "uTextureUnit");

        TreeTopTriangle.indexBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, TreeTopTriangle.indexBuffer);
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(TreeTopTriangle.indices), gl.STATIC_DRAW );
            
        // Associate our shader variables with our data buffer
        TreeTopTriangle.aPositionShader = gl.getAttribLocation( TreeTopTriangle.shaderProgram, "aPosition" );
        TreeTopTriangle.aTextureCoordShader = gl.getAttribLocation( TreeTopTriangle.shaderProgram, "aTextureCoord" );
        TreeTopTriangle.aNormalShader = gl.getAttribLocation( TreeTopTriangle.shaderProgram, "aNormal" );
        
        TreeTopTriangle.uModelMatrixShader = gl.getUniformLocation( TreeTopTriangle.shaderProgram, "modelMatrix" );
        TreeTopTriangle.uCameraMatrixShader = gl.getUniformLocation( TreeTopTriangle.shaderProgram, "cameraMatrix" );
        TreeTopTriangle.uProjectionMatrixShader = gl.getUniformLocation( TreeTopTriangle.shaderProgram, "projectionMatrix" );

        TreeTopTriangle.uMatAmbientShader = gl.getUniformLocation( TreeTopTriangle.shaderProgram, "matAmbient" );
		TreeTopTriangle.uMatDiffuseShader = gl.getUniformLocation( TreeTopTriangle.shaderProgram, "matDiffuse" );
		TreeTopTriangle.uMatSpecularShader = gl.getUniformLocation( TreeTopTriangle.shaderProgram, "matSpecular" );
		TreeTopTriangle.uMatAlphaShader = gl.getUniformLocation( TreeTopTriangle.shaderProgram, "matAlpha" );

        //directional light
		TreeTopTriangle.uLightDirectionShader = gl.getUniformLocation( TreeTopTriangle.shaderProgram, "lightDirection" );
		TreeTopTriangle.uLightAmbientShader = gl.getUniformLocation( TreeTopTriangle.shaderProgram, "lightAmbient" );
		TreeTopTriangle.uLightDiffuseShader = gl.getUniformLocation( TreeTopTriangle.shaderProgram, "lightDiffuse" );
		TreeTopTriangle.uLightSpecularShader = gl.getUniformLocation( TreeTopTriangle.shaderProgram, "lightSpecular" );

        //spotlight
		TreeTopTriangle.uSpotLightDirectionShader = gl.getUniformLocation( TreeTopTriangle.shaderProgram, "spotlightDirection" );
		TreeTopTriangle.uSpotLightAmbientShader = gl.getUniformLocation( TreeTopTriangle.shaderProgram, "spotlightAmbient" );
		TreeTopTriangle.uSpotLightDiffuseShader = gl.getUniformLocation( TreeTopTriangle.shaderProgram, "spotlightDiffuse" );
		TreeTopTriangle.uSpotLightSpecularShader = gl.getUniformLocation( TreeTopTriangle.shaderProgram, "spotlightSpecular" );
        TreeTopTriangle.uSpotLightLoc = gl.getUniformLocation( TreeTopTriangle.shaderProgram, "spotlightLoc");
		TreeTopTriangle.uSpotLightAlpha = gl.getUniformLocation( TreeTopTriangle.shaderProgram, "spotlightAlpha");
		TreeTopTriangle.uSpotLightCutoff = gl.getUniformLocation( TreeTopTriangle.shaderProgram, "spotlightCutoff");
        TreeTopTriangle.uSpotLightStatus = gl.getUniformLocation( TreeTopTriangle.shaderProgram, "spotlightStatus");

    }
    
    static initializeTexture(){
        var image = new Image();

        image.onload = function(){
            TreeTopTriangle.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, TreeTopTriangle.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, image.width, image.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image);
            
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            
            TreeTopTriangle.imageLoaded++;
        }
        
        image.src = "./textures/tree/spruce-leaf.png";
    }
    
    constructor(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh){
        super(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh);
        if(TreeTopTriangle.shaderProgram == -1){
            TreeTopTriangle.initialize()
            TreeTopTriangle.initializeTexture();
        }
        
    }
    
    draw() {
        if((TreeTopTriangle.texture == -1) || (TreeTopTriangle.imageLoaded != 1))  //only draw when texture is loaded.
        	return;
        
        gl.useProgram(TreeTopTriangle.shaderProgram);
        
        gl.bindBuffer( gl.ARRAY_BUFFER, TreeTopTriangle.positionBuffer);
       	gl.vertexAttribPointer(TreeTopTriangle.aPositionShader, 3, gl.FLOAT, false, 0, 0 );
        
        gl.bindBuffer( gl.ARRAY_BUFFER, TreeTopTriangle.normalBuffer);
       	gl.vertexAttribPointer(TreeTopTriangle.aNormalShader, 3, gl.FLOAT, false, 0, 0 );
       	
       	gl.bindBuffer( gl.ARRAY_BUFFER, TreeTopTriangle.textureCoordBuffer);
       	gl.vertexAttribPointer(TreeTopTriangle.aTextureCoordShader, 2, gl.FLOAT, false, 0, 0 );
       	
       	gl.activeTexture(gl.TEXTURE0);
       	gl.bindTexture(gl.TEXTURE_2D, TreeTopTriangle.texture);
       	gl.uniform1i(TreeTopTriangle.uTextureUnit,0);

	
       	gl.uniformMatrix4fv(TreeTopTriangle.uModelMatrixShader, false, flatten(this.modelMatrix));
        gl.uniformMatrix4fv(TreeTopTriangle.uCameraMatrixShader, false, flatten(camera1.cameraMatrix));
        gl.uniformMatrix4fv(TreeTopTriangle.uProjectionMatrixShader, false, flatten(camera1.projectionMatrix));

        gl.uniform4fv(TreeTopTriangle.uMatAmbientShader, this.matAmbient);
		gl.uniform4fv(TreeTopTriangle.uMatDiffuseShader, this.matDiffuse);
		gl.uniform4fv(TreeTopTriangle.uMatSpecularShader, this.matSpecular);
		gl.uniform1f(TreeTopTriangle.uMatAlphaShader, this.matAlpha);

        //directional light
		gl.uniform3fv(TreeTopTriangle.uLightDirectionShader, light1.direction);
		gl.uniform4fv(TreeTopTriangle.uLightAmbientShader, light1.ambient);
		gl.uniform4fv(TreeTopTriangle.uLightDiffuseShader, light1.diffuse);
		gl.uniform4fv(TreeTopTriangle.uLightSpecularShader, light1.specular);

        //spotlight
		gl.uniform3fv(TreeTopTriangle.uSpotLightDirectionShader, light2.direction);
		gl.uniform4fv(TreeTopTriangle.uSpotLightAmbientShader, light2.ambient);
		gl.uniform4fv(TreeTopTriangle.uSpotLightDiffuseShader, light2.diffuse);
		gl.uniform4fv(TreeTopTriangle.uSpotLightSpecularShader, light2.specular);
        gl.uniform3fv(TreeTopTriangle.uSpotLightLoc, light2.location);
		gl.uniform1f(TreeTopTriangle.uSpotLightAlpha, light2.alpha); 
		gl.uniform1f(TreeTopTriangle.uSpotLightCutoff, light2.cutoff); 
        gl.uniform1f(TreeTopTriangle.uSpotLightStatus, light2.status); 
                    
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, TreeTopTriangle.indexBuffer);
	
        gl.enableVertexAttribArray(TreeTopTriangle.aPositionShader);    
        gl.enableVertexAttribArray(TreeTopTriangle.aTextureCoordShader);
        gl.enableVertexAttribArray(TreeTopTriangle.aNormalShader);    
    	gl.drawElements(gl.TRIANGLES, TreeTopTriangle.indices.length, gl.UNSIGNED_INT, 0);
    	gl.disableVertexAttribArray(TreeTopTriangle.aPositionShader);    
    	gl.disableVertexAttribArray(TreeTopTriangle.aTextureCoordShader);    
        gl.disableVertexAttribArray(TreeTopTriangle.aNormalShader);    
    }
}