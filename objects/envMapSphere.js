class EnvMapSphere extends Drawable{
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

    static envFrameBuffer = -1;
    static envRenderBuffer = -1;
    static texsize = 256;


    static imageLoaded = 0;

    static computeNormals(){
        var normalSum = [];
        var counts = [];
        
        //initialize sum of normals for each vertex and how often its used.
        for (var i = 0; i<EnvMapSphere.vertexPositions.length; i++) {
            normalSum.push(vec3(0, 0, 0));
            counts.push(0);
        }
        
        //for each triangle
        for (var i = 0; i<EnvMapSphere.indices.length; i+=3) {
            var a = EnvMapSphere.indices[i];
            var b = EnvMapSphere.indices[i+1];
            var c = EnvMapSphere.indices[i+2];
            
            var edge1 = subtract(EnvMapSphere.vertexPositions[c],EnvMapSphere.vertexPositions[b]);
            var edge2 = subtract(EnvMapSphere.vertexPositions[a],EnvMapSphere.vertexPositions[b]);
            var N = cross(edge1,edge2);
            
            normalSum[a] = add(normalSum[a],normalize(N));
            counts[a]++;
            normalSum[b] = add(normalSum[b],normalize(N));
            counts[b]++;
            normalSum[c] = add(normalSum[c],normalize(N));
            counts[c]++;
        
        }
        for (var i = 0; i < EnvMapSphere.vertexPositions.length; i++) {
            EnvMapSphere.vertexNormals[i] = mult(1.0/counts[i],normalSum[i]);
        }
    }

    static initialize() {
        EnvMapSphere.computeNormals();
    	EnvMapSphere.shaderProgram = initShaders( gl, "/glsl/lightcubevshader.glsl", "/glsl/lightcubefshader.glsl");
    	gl.useProgram(EnvMapSphere.shaderProgram );
		
        // Load the data into the GPU
        EnvMapSphere.positionBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, EnvMapSphere.positionBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(EnvMapSphere.vertexPositions), gl.STATIC_DRAW );
        
        EnvMapSphere.textureUnit = gl.getUniformLocation(EnvMapSphere.shaderProgram, "textureUnit");

        EnvMapSphere.indexBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, EnvMapSphere.indexBuffer);
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(EnvMapSphere.indices), gl.STATIC_DRAW );
            
        // Associate our shader variables with our data buffer
        EnvMapSphere.aPositionShader = gl.getAttribLocation( EnvMapSphere.shaderProgram, "aPosition" );
        EnvMapSphere.aNormalShader = gl.getAttribLocation( EnvMapSphere.shaderProgram, "aNormal" );
        
        EnvMapSphere.uModelMatrixShader = gl.getUniformLocation( EnvMapSphere.shaderProgram, "modelMatrix" );
        EnvMapSphere.uCameraMatrixShader = gl.getUniformLocation( EnvMapSphere.shaderProgram, "cameraMatrix" );
        EnvMapSphere.uProjectionMatrixShader = gl.getUniformLocation( EnvMapSphere.shaderProgram, "projectionMatrix" );

        EnvMapSphere.uMatAmbientShader = gl.getUniformLocation( EnvMapSphere.shaderProgram, "matAmbient" );
		EnvMapSphere.uMatDiffuseShader = gl.getUniformLocation( EnvMapSphere.shaderProgram, "matDiffuse" );
		EnvMapSphere.uMatSpecularShader = gl.getUniformLocation( EnvMapSphere.shaderProgram, "matSpecular" );
		EnvMapSphere.uMatAlphaShader = gl.getUniformLocation( EnvMapSphere.shaderProgram, "matAlpha" );

        //directional light
		EnvMapSphere.uLightDirectionShader = gl.getUniformLocation( EnvMapSphere.shaderProgram, "lightDirection" );
		EnvMapSphere.uLightAmbientShader = gl.getUniformLocation( EnvMapSphere.shaderProgram, "lightAmbient" );
		EnvMapSphere.uLightDiffuseShader = gl.getUniformLocation( EnvMapSphere.shaderProgram, "lightDiffuse" );
		EnvMapSphere.uLightSpecularShader = gl.getUniformLocation( EnvMapSphere.shaderProgram, "lightSpecular" );

        //spotlight
		EnvMapSphere.uSpotLightDirectionShader = gl.getUniformLocation( EnvMapSphere.shaderProgram, "spotlightDirection" );
		EnvMapSphere.uSpotLightAmbientShader = gl.getUniformLocation( EnvMapSphere.shaderProgram, "spotlightAmbient" );
		EnvMapSphere.uSpotLightDiffuseShader = gl.getUniformLocation( EnvMapSphere.shaderProgram, "spotlightDiffuse" );
		EnvMapSphere.uSpotLightSpecularShader = gl.getUniformLocation( EnvMapSphere.shaderProgram, "spotlightSpecular" );
        EnvMapSphere.uSpotLightLoc = gl.getUniformLocation( EnvMapSphere.shaderProgram, "spotlightLoc");
		EnvMapSphere.uSpotLightAlpha = gl.getUniformLocation( EnvMapSphere.shaderProgram, "spotlightAlpha");
		EnvMapSphere.uSpotLightCutoff = gl.getUniformLocation( EnvMapSphere.shaderProgram, "spotlightCutoff");
        EnvMapSphere.uSpotLightStatus = gl.getUniformLocation( EnvMapSphere.shaderProgram, "spotlightStatus");

    }
    
    static initializeTexture(){
        EnvMapSphere.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, EnvMapSphere.texture);

        gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGB, EnvMapSphere.texsize, EnvMapSphere.texsize, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGB, EnvMapSphere.texsize, EnvMapSphere.texsize, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGB, EnvMapSphere.texsize, EnvMapSphere.texsize, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGB, EnvMapSphere.texsize, EnvMapSphere.texsize, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGB, EnvMapSphere.texsize, EnvMapSphere.texsize, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGB, EnvMapSphere.texsize, EnvMapSphere.texsize, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
        
        EnvMapSphere.envFrameBuffer = gl.createFramebuffer();
        EnvMapSphere.envFrameBuffer.width = EnvMapSphere.texsize;
        EnvMapSphere.envFrameBuffer.height = EnvMapSphere.texsize;
        gl.bindFramebuffer(gl.FRAMEBUFFER, EnvMapSphere.envFrameBuffer);

        EnvMapSphere.envRenderBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, EnvMapSphere.envRenderBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, EnvMapSphere.texsize, EnvMapSphere.texsize);

        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, EnvMapSphere.envRenderBuffer);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null); //restore to window frame/depth buffer
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);

    }
    
    constructor(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh){
        super(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh);
        if(EnvMapSphere.shaderProgram == -1){
            EnvMapSphere.initialize()
            EnvMapSphere.initializeTexture();
        }
        
    }
    
    draw() {
        this.createEnvironmentMap();

        if((EnvMapSphere.texture == -1) || (EnvMapSphere.imageLoaded != 6))  //only draw when texture is loaded.
        	return;
        
        gl.useProgram(EnvMapSphere.shaderProgram);
        
        gl.bindBuffer( gl.ARRAY_BUFFER, EnvMapSphere.positionBuffer);
       	gl.vertexAttribPointer(EnvMapSphere.aPositionShader, 3, gl.FLOAT, false, 0, 0 );
       	
       	gl.activeTexture(gl.TEXTURE0);
       	gl.bindTexture(gl.TEXTURE_CUBE_MAP, EnvMapSphere.texture);
       	gl.uniform1i(EnvMapSphere.textureUnit,0);
	
       	gl.uniformMatrix4fv(EnvMapSphere.uModelMatrixShader, false, flatten(this.modelMatrix));
        gl.uniformMatrix4fv(EnvMapSphere.uCameraMatrixShader, false, flatten(camera1.cameraMatrix));
        gl.uniformMatrix4fv(EnvMapSphere.uProjectionMatrixShader, false, flatten(camera1.projectionMatrix));

        gl.uniform4fv(EnvMapSphere.uMatAmbientShader, this.matAmbient);
		gl.uniform4fv(EnvMapSphere.uMatDiffuseShader, this.matDiffuse);
		gl.uniform4fv(EnvMapSphere.uMatSpecularShader, this.matSpecular);
		gl.uniform1f(EnvMapSphere.uMatAlphaShader, this.matAlpha);

        //directional light
		gl.uniform3fv(EnvMapSphere.uLightDirectionShader, light1.direction);
		gl.uniform4fv(EnvMapSphere.uLightAmbientShader, light1.ambient);
		gl.uniform4fv(EnvMapSphere.uLightDiffuseShader, light1.diffuse);
		gl.uniform4fv(EnvMapSphere.uLightSpecularShader, light1.specular);

        //spotlight
		gl.uniform3fv(EnvMapSphere.uSpotLightDirectionShader, light2.direction);
		gl.uniform4fv(EnvMapSphere.uSpotLightAmbientShader, light2.ambient);
		gl.uniform4fv(EnvMapSphere.uSpotLightDiffuseShader, light2.diffuse);
		gl.uniform4fv(EnvMapSphere.uSpotLightSpecularShader, light2.specular);
        gl.uniform3fv(EnvMapSphere.uSpotLightLoc, light2.location);
		gl.uniform1f(EnvMapSphere.uSpotLightAlpha, light2.alpha); 
		gl.uniform1f(EnvMapSphere.uSpotLightCutoff, light2.cutoff); 
        gl.uniform1f(EnvMapSphere.uSpotLightStatus, light2.status); 
                    
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, EnvMapSphere.indexBuffer);
	
        gl.enableVertexAttribArray(EnvMapSphere.aPositionShader);  
        gl.enableVertexAttribArray(EnvMapSphere.aNormalShader);    
    	gl.drawElements(gl.TRIANGLES, EnvMapSphere.indices.length, gl.UNSIGNED_INT, 0);
    	gl.disableVertexAttribArray(EnvMapSphere.aPositionShader);    
        gl.disableVertexAttribArray(EnvMapSphere.aNormalShader);    

    }

    createEnvironmentMap() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, EnvMapSphere.envFrameBuffer);
        gl.bindRenderbuffer(gl.RENDERBUFFER, EnvMapSphere.envRenderBuffer);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP,EnvMapSphere.texture);

        // store the current camera1 info
        var origu = vec3(camera1.u);
        var origv = vec3(camera1.v);
        var orign = vec3(camera1.n);
        var origvrp = vec3(camera1.vrp);
        var viewportParams = gl.getParameter(gl.VIEWPORT);

        gl.viewport(0,0, EnvMapSphere.texsize, EnvMapSphere.texsize);

        camera1.projectionMatrix = perspective(90, 1.0, 0.1, 100);
        camera1.vrp = vec3(this.tx, this.ty, this.tz);

        for(var j = 0; j < 6; j++){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, EnvMapSphere.texture);
            switch(j){
                case 0: //-z
                camera1.u = vec3(1,0,0);
                camera1.v = vec3(0,1,0);
                camera1.n = vec3(0,0,1);
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, EnvMapSphere.texture, 0);
                break;
                
                case 1: //z
                camera1.u = vec3(1,0,0);
                camera1.v = vec3(0,1,0);
                camera1.n = vec3(0,0,-1);
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_Z, EnvMapSphere.texture, 0);
                break;

                case 2: //-x
                camera1.u = vec3(0,0,-1);
                camera1.v = vec3(0,1,0);
                camera1.n = vec3(-1,0,0);
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_NEGATIVE_X, EnvMapSphere.texture, 0);
                break;

                case 3: //x
                camera1.u = vec3(0,0,1);
                camera1.v = vec3(0,1,0);
                camera1.n = vec3(1,0,0);
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_X, EnvMapSphere.texture, 0);
                break;

                case 4: //-y
                camera1.u = vec3(1,0,0);
                camera1.v = vec3(0,0,-1);
                camera1.n = vec3(0,1,0);
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, EnvMapSphere.texture, 0);
                break;

                case 5: //y
                camera1.u = vec3(1,0,0);
                camera1.v = vec3(0,0,1);
                camera1.n = vec3(0,-1,0);
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_Y, EnvMapSphere.texture, 0);
                break;
            }
            camera1.updateCameraMatrix();
            gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
            let beforePos = camera1.vrp;
            let beforeU = camera1.u;
            let beforeV = camera1.v;
            let beforeN = camera1.n;
            camera1.vrp = vec3(0,-0.5,0);  
            camera1.updateCameraMatrix();

            gl.disable(gl.DEPTH_TEST);
            skyCube.draw();
            gl.enable(gl.DEPTH_TEST);

            camera1.vrp = beforePos;
            camera1.u = beforeU;
            camera1.v = beforeV;
            camera1.n = beforeN;
            camera1.updateCameraMatrix();
            groundPlane.draw();
            // slime.draw();

            for(var i = 0; i < objectList.length; i++) {
                if(objectList[i]!=this) {
                    objectList[i].draw();
                }
            }

            EnvMapSphere.imageLoaded ++;
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