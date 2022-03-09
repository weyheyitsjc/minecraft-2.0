class HouseTop extends Drawable{
  static vertexPositions = [
    vec3( 1, 0, 1 ),
    vec3( 1, 0, -1 ),
    vec3( -1, 0, -1 ),
    vec3( -1, 0, 1 ),
    vec3( 0, 1, 0 )
  ];

	static indices = [
		0,1,2,
		0,2,3,
		0,4,1,
		1,4,2,
		2,4,3,
		3,4,0
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

    HouseTop.textureUnit = gl.getUniformLocation(HouseTop.shaderProgram, "textureUnit");

    HouseTop.indexBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, HouseTop.indexBuffer);
    gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(HouseTop.indices), gl.STATIC_DRAW );
      
    // Associate our shader variables with our data buffer
    HouseTop.aPositionShader = gl.getAttribLocation( HouseTop.shaderProgram, "aPosition" );
    HouseTop.aNormalShader = gl.getAttribLocation( HouseTop.shaderProgram, "aNormal" );

    HouseTop.uModelMatrixShader = gl.getUniformLocation( HouseTop.shaderProgram, "modelMatrix" );
    HouseTop.uCameraMatrixShader = gl.getUniformLocation( HouseTop.shaderProgram, "cameraMatrix" );
    HouseTop.uProjectionMatrixShader = gl.getUniformLocation( HouseTop.shaderProgram, "projectionMatrix" );

    HouseTop.uMatAmbientShader = gl.getUniformLocation( HouseTop.shaderProgram, "matAmbient" );
    HouseTop.uMatDiffuseShader = gl.getUniformLocation( HouseTop.shaderProgram, "matDiffuse" );
    HouseTop.uMatSpecularShader = gl.getUniformLocation( HouseTop.shaderProgram, "matSpecular" );
    HouseTop.uMatAlphaShader = gl.getUniformLocation( HouseTop.shaderProgram, "matAlpha" );

    //spotlight
    HouseTop.uSpotLightDirectionShader = gl.getUniformLocation( HouseTop.shaderProgram, "spotlightDirection" );
    HouseTop.uSpotLightAmbientShader = gl.getUniformLocation( HouseTop.shaderProgram, "spotlightAmbient" );
    HouseTop.uSpotLightDiffuseShader = gl.getUniformLocation( HouseTop.shaderProgram, "spotlightDiffuse" );
    HouseTop.uSpotLightSpecularShader = gl.getUniformLocation( HouseTop.shaderProgram, "spotlightSpecular" );
    HouseTop.uSpotLightLoc = gl.getUniformLocation( HouseTop.shaderProgram, "spotlightLoc");
    HouseTop.uSpotLightAlpha = gl.getUniformLocation( HouseTop.shaderProgram, "spotlightAlpha");
    HouseTop.uSpotLightCutoff = gl.getUniformLocation( HouseTop.shaderProgram, "spotlightCutoff");
  }

  static initializeTexture(){
    var imagePX = new Image();
    var imageNX = new Image();
    var imagePY = new Image();
    var imageNY = new Image();
    var imagePZ = new Image();
    var imageNZ = new Image();
    
    HouseBottom.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_HouseBottom_MAP, HouseBottom.texture);
    gl.texParameteri(gl.TEXTURE_HouseBottom_MAP,gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_HouseBottom_MAP,gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_HouseBottom_MAP,gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_HouseBottom_MAP,gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_HouseBottom_MAP,gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);


    imagePX.onload = function(){
        gl.bindTexture(gl.TEXTURE_HouseBottom_MAP, HouseBottom.texture);
        gl.texImage2D(gl.TEXTURE_HouseBottom_MAP_POSITIVE_X, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imagePX);
        
        HouseBottom.imageLoaded++;
    };
    
    imagePX.src = "./textures/house/house.jpg";


    imageNX.onload = function(){
        gl.bindTexture(gl.TEXTURE_HouseBottom_MAP, HouseBottom.texture);
        gl.texImage2D(gl.TEXTURE_HouseBottom_MAP_NEGATIVE_X, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imageNX);
        
        HouseBottom.imageLoaded++;
    };

    imageNX.src = "./textures/house/house.jpg";

    imagePY.onload = function(){
        gl.bindTexture(gl.TEXTURE_HouseBottom_MAP, HouseBottom.texture);
        gl.texImage2D(gl.TEXTURE_HouseBottom_MAP_POSITIVE_Y, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imagePY);
        
        HouseBottom.imageLoaded++;
    };

    imagePY.src = "./textures/house/house.jpg";


    imageNY.onload = function(){
        gl.bindTexture(gl.TEXTURE_HouseBottom_MAP, HouseBottom.texture);
        gl.texImage2D(gl.TEXTURE_HouseBottom_MAP_NEGATIVE_Y, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imageNY);
        
        HouseBottom.imageLoaded++;
    };

    imageNY.src = "./textures/house/house.jpg";


    imagePZ.onload = function(){
        gl.bindTexture(gl.TEXTURE_HouseBottom_MAP, HouseBottom.texture);
        gl.texImage2D(gl.TEXTURE_HouseBottom_MAP_POSITIVE_Z, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imagePZ);
    
        HouseBottom.imageLoaded++;
    };
    
    imagePZ.src = "./textures/house/house-front.jpg";

    imageNZ.onload = function(){
        gl.bindTexture(gl.TEXTURE_HouseBottom_MAP, HouseBottom.texture);
        gl.texImage2D(gl.TEXTURE_HouseBottom_MAP_NEGATIVE_Z, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, imageNZ);
        
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
    if((HouseBottom.texture == -1) || (HouseBottom.imageLoaded != 6))  //only draw when texture is loaded.
      return;

    gl.useProgram(HouseBottom.shaderProgram);

    gl.bindBuffer( gl.ARRAY_BUFFER, HouseBottom.positionBuffer);
    gl.vertexAttribPointer(HouseBottom.aPositionShader, 3, gl.FLOAT, false, 0, 0 );

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_HouseBottom_MAP, HouseBottom.texture);
    gl.uniform1i(HouseBottom.textureUnit,0);

    gl.uniformMatrix4fv(HouseBottom.uModelMatrixShader, false, flatten(this.modelMatrix));
    gl.uniformMatrix4fv(HouseBottom.uCameraMatrixShader, false, flatten(camera1.cameraMatrix));
    gl.uniformMatrix4fv(HouseBottom.uProjectionMatrixShader, false, flatten(camera1.projectionMatrix));

    gl.uniform4fv(HouseBottom.uMatAmbientShader, this.matAmbient);
    gl.uniform4fv(HouseBottom.uMatDiffuseShader, this.matDiffuse);
    gl.uniform4fv(HouseBottom.uMatSpecularShader, this.matSpecular);
    gl.uniform1f(HouseBottom.uMatAlphaShader, this.matAlpha);


    //spotlight
    gl.uniform3fv(HouseBottom.uSpotLightDirectionShader, light1.direction);
    gl.uniform4fv(HouseBottom.uSpotLightAmbientShader, light1.ambient);
    gl.uniform4fv(HouseBottom.uSpotLightDiffuseShader, light1.diffuse);
    gl.uniform4fv(HouseBottom.uSpotLightSpecularShader, light1.specular);
    gl.uniform3fv(HouseBottom.uSpotLightLoc, light1.location);
    gl.uniform1f(HouseBottom.uSpotLightAlpha, light1.alpha); 
    gl.uniform1f(HouseBottom.uSpotLightCutoff, light1.cutoff); 
              
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, HouseBottom.indexBuffer);

    gl.enableVertexAttribArray(HouseBottom.aPositionShader);  
    gl.enableVertexAttribArray(HouseBottom.aNormalShader);    
    gl.drawElements(gl.TRIANGLES, HouseBottom.indices.length, gl.UNSIGNED_INT, 0);
    gl.disableVertexAttribArray(HouseBottom.aPositionShader);    
    gl.disableVertexAttribArray(HouseBottom.aNormalShader);    

  }
}