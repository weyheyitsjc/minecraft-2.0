class EnvMapCube extends Drawable{
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

    static texture = -1;
    static textureUnit = -1;

    static envFrameBuffer = -1;
    static envRenderBuffer = -1;
    static texsize = 256;


    static imageLoaded = 0;

    static computeNormals(){
        var normalSum = [];
        var counts = [];
        
        //initialize sum of normals for each vertex and how often its used.
        for (var i = 0; i<EnvMapCube.vertexPositions.length; i++) {
            normalSum.push(vec3(0, 0, 0));
            counts.push(0);
        }
        
        //for each triangle
        for (var i = 0; i<EnvMapCube.indices.length; i+=3) {
            var a = EnvMapCube.indices[i];
            var b = EnvMapCube.indices[i+1];
            var c = EnvMapCube.indices[i+2];
            
            var edge1 = subtract(EnvMapCube.vertexPositions[c],EnvMapCube.vertexPositions[b]);
            var edge2 = subtract(EnvMapCube.vertexPositions[a],EnvMapCube.vertexPositions[b]);
            var N = cross(edge1,edge2);
            
            normalSum[a] = add(normalSum[a],normalize(N));
            counts[a]++;
            normalSum[b] = add(normalSum[b],normalize(N));
            counts[b]++;
            normalSum[c] = add(normalSum[c],normalize(N));
            counts[c]++;
        
        }
        for (var i = 0; i < EnvMapCube.vertexPositions.length; i++) {
            EnvMapCube.vertexNormals[i] = mult(1.0/counts[i],normalSum[i]);
        }
    }

    static initialize() {
        EnvMapCube.computeNormals();
    	EnvMapCube.shaderProgram = initShaders( gl, "/glsl/reflectivecubevshader.glsl", "/glsl/reflectivecubefshader.glsl");
    	gl.useProgram(EnvMapCube.shaderProgram );
		
        // Load the data into the GPU
        EnvMapCube.positionBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, EnvMapCube.positionBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(EnvMapCube.vertexPositions), gl.STATIC_DRAW );
        
        EnvMapCube.textureUnit = gl.getUniformLocation(EnvMapCube.shaderProgram, "textureUnit");

        EnvMapCube.normalBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, EnvMapCube.normalBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(EnvMapCube.vertexNormals), gl.STATIC_DRAW );

        EnvMapCube.indexBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, EnvMapCube.indexBuffer);
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(EnvMapCube.indices), gl.STATIC_DRAW );
            
        // Associate our shader variables with our data buffer
        EnvMapCube.aPositionShader = gl.getAttribLocation( EnvMapCube.shaderProgram, "aPosition" );
        EnvMapCube.aNormalShader = gl.getAttribLocation( EnvMapCube.shaderProgram, "aNormal" );
        
        EnvMapCube.uModelMatrixShader = gl.getUniformLocation( EnvMapCube.shaderProgram, "modelMatrix" );
        EnvMapCube.uCameraMatrixShader = gl.getUniformLocation( EnvMapCube.shaderProgram, "cameraMatrix" );
        EnvMapCube.uProjectionMatrixShader = gl.getUniformLocation( EnvMapCube.shaderProgram, "projectionMatrix" );

    }
    
    static initializeTexture(){
        EnvMapCube.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, EnvMapCube.texture);

        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGB, EnvMapCube.texsize, EnvMapCube.texsize, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGB, EnvMapCube.texsize, EnvMapCube.texsize, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGB, EnvMapCube.texsize, EnvMapCube.texsize, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGB, EnvMapCube.texsize, EnvMapCube.texsize, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGB, EnvMapCube.texsize, EnvMapCube.texsize, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGB, EnvMapCube.texsize, EnvMapCube.texsize, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
        
        EnvMapCube.envFrameBuffer = gl.createFramebuffer();
        EnvMapCube.envFrameBuffer.width = EnvMapCube.texsize;
        EnvMapCube.envFrameBuffer.height = EnvMapCube.texsize;
        gl.bindFramebuffer(gl.FRAMEBUFFER, EnvMapCube.envFrameBuffer);

        EnvMapCube.envRenderBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, EnvMapCube.envRenderBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, EnvMapCube.texsize, EnvMapCube.texsize);

        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, EnvMapCube.envRenderBuffer);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null); //restore to window frame/depth buffer
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);

    }
    
    constructor(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh){
        super(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh);
        if(EnvMapCube.shaderProgram == -1){
            EnvMapCube.initialize()
            EnvMapCube.initializeTexture();
        }
        
    }
    
    draw() {
        this.createEnvironmentMap();

        if ((EnvMapCube.texture == -1) || (EnvMapCube.imageLoaded != 6)) {  //only draw when texture is loaded.
        	return;
        }
        
        gl.useProgram(EnvMapCube.shaderProgram);
        
        gl.bindBuffer( gl.ARRAY_BUFFER, EnvMapCube.positionBuffer);
       	gl.vertexAttribPointer(EnvMapCube.aPositionShader, 3, gl.FLOAT, false, 0, 0 );

       	gl.activeTexture(gl.TEXTURE0);
       	gl.bindTexture(gl.TEXTURE_CUBE_MAP, EnvMapCube.texture);
       	gl.uniform1i(EnvMapCube.textureUnit,0);
        
        gl.bindBuffer( gl.ARRAY_BUFFER, EnvMapCube.normalBuffer);
       	gl.vertexAttribPointer(EnvMapCube.aNormalShader, 3, gl.FLOAT, false, 0, 0 );
	
       	gl.uniformMatrix4fv(EnvMapCube.uModelMatrixShader, false, flatten(this.modelMatrix));
        gl.uniformMatrix4fv(EnvMapCube.uCameraMatrixShader, false, flatten(camera1.cameraMatrix));
        gl.uniformMatrix4fv(EnvMapCube.uProjectionMatrixShader, false, flatten(camera1.projectionMatrix));
                    
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, EnvMapCube.indexBuffer);
	
        gl.enableVertexAttribArray(EnvMapCube.aPositionShader);  
        gl.enableVertexAttribArray(EnvMapCube.aNormalShader);    
    	gl.drawElements(gl.TRIANGLES, EnvMapCube.indices.length, gl.UNSIGNED_INT, 0);
    	gl.disableVertexAttribArray(EnvMapCube.aPositionShader);    
        gl.disableVertexAttribArray(EnvMapCube.aNormalShader);   
        
        // Reset imageloaded to load the next instance
        EnvMapCube.imageLoaded = 0;

    }

    createEnvironmentMap() {
        //change to our other frame and depth buffer, and bind our texture
        gl.bindFramebuffer(gl.FRAMEBUFFER, EnvMapCube.envFrameBuffer);
        gl.bindRenderbuffer(gl.RENDERBUFFER, EnvMapCube.envRenderBuffer);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP,EnvMapCube.texture);

        // store the current camera1 info
        var origu = vec3(camera1.u);
        var origv = vec3(camera1.v);
        var orign = vec3(camera1.n);
        var origvrp = vec3(camera1.vrp);
        var viewportParams = gl.getParameter(gl.VIEWPORT);

        gl.viewport(0, 0, EnvMapCube.texsize, EnvMapCube.texsize);

        camera1.projectionMatrix = perspective(90, 1.0, 0.1, 100);
        camera1.vrp = vec3(this.tx, this.ty, this.tz);

        for(var j = 0; j < 6; j++) {
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, EnvMapCube.texture);
            switch(j) {
                case 0: //-z
                    camera1.u = vec3(1,0,0);
                    camera1.v = vec3(0,1,0);
                    camera1.n = vec3(0,0,1);
                    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, EnvMapCube.texture, 0);
                    break;
                
                case 1: //z
                    camera1.u = vec3(-1,0,0);
                    camera1.v = vec3(0,-1,0);
                    camera1.n = vec3(0,0,1);
                    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_Z, EnvMapCube.texture, 0);
                    break;

                case 2: //-x
                    camera1.u = vec3(0,0,-1);
                    camera1.v = vec3(0,1,0);
                    camera1.n = vec3(-1,0,0);
                    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_NEGATIVE_X, EnvMapCube.texture, 0);
                    break;

                case 3: //x
                    camera1.u = vec3(0,0,1);
                    camera1.v = vec3(0,1,0);
                    camera1.n = vec3(1,0,0);
                    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_X, EnvMapCube.texture, 0);
                    break;

                case 4: //-y
                    camera1.u = vec3(1,0,0);
                    camera1.v = vec3(0,0,-1);
                    camera1.n = vec3(0,1,0);
                    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, EnvMapCube.texture, 0);
                    break;

                case 5: //y
                    camera1.u = vec3(1,0,0);
                    camera1.v = vec3(0,0,1);
                    camera1.n = vec3(0,-1,0);
                    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_Y, EnvMapCube.texture, 0);
                    break;
            }

            camera1.updateCameraMatrix();
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            for(var i = 0; i < objectList.length; i++) {
                if(objectList[i] != this) {
                    objectList[i].draw();
                }
            }

            // if (bgSlimeJumpCount != 10) {
            //     slime.draw();
            // } else {
            //     slime1.draw();
            //     slime2.draw();
            // }

            EnvMapCube.imageLoaded ++;
        }

        //the regular rendering
        camera1.u = origu;
        camera1.v = origv;
        camera1.n = orign;
        camera1.vrp = origvrp;
        camera1.updateCameraMatrix();

        camera1.projectionMatrix = perspective(90,1.0,0.1,100);
        gl.viewport( viewportParams[0], viewportParams[1], viewportParams[2], viewportParams[3]);
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    }
}