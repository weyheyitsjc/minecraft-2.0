class GroundPlane extends Drawable {
    static vertexPositions = [];
  
    static vertexTextureCoords = [];
    
    static indices = [];

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
        for (var i = 0; i<GroundPlane.vertexPositions.length; i++) {
            normalSum.push(vec3(0, 0, 0));
            counts.push(0);
        }
        
        //for each triangle
        for (var i = 0; i<GroundPlane.indices.length; i+=3) {
            var a = GroundPlane.indices[i];
            var b = GroundPlane.indices[i+1];
            var c = GroundPlane.indices[i+2];
            
            var edge1 = subtract(GroundPlane.vertexPositions[c],GroundPlane.vertexPositions[b]);
            var edge2 = subtract(GroundPlane.vertexPositions[a],GroundPlane.vertexPositions[b]);
            var N = cross(edge1,edge2);
            
            normalSum[a] = add(normalSum[a],normalize(N));
            counts[a]++;
            normalSum[b] = add(normalSum[b],normalize(N));
            counts[b]++;
            normalSum[c] = add(normalSum[c],normalize(N));
            counts[c]++;
        
        }
            
        for (var i = 0; i < GroundPlane.vertexPositions.length; i++) {
            GroundPlane.vertexNormals[i] = mult(1.0/counts[i],normalSum[i]);
        }
    }

    static initialize() {
        GroundPlane.computeNormals();
    	GroundPlane.shaderProgram = initShaders( gl, "/glsl/lightvshader.glsl", "/glsl/lightfshader.glsl");
    	gl.useProgram(GroundPlane.shaderProgram );
		
        // Load the data into the GPU
        GroundPlane.positionBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, GroundPlane.positionBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(GroundPlane.vertexPositions), gl.STATIC_DRAW );

        GroundPlane.normalBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, GroundPlane.normalBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(GroundPlane.vertexNormals), gl.STATIC_DRAW );
        
        GroundPlane.textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, GroundPlane.textureCoordBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(GroundPlane.vertexTextureCoords), gl.STATIC_DRAW );
        
        GroundPlane.uTextureUnit = gl.getUniformLocation(GroundPlane.shaderProgram, "uTextureUnit");

        GroundPlane.indexBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, GroundPlane.indexBuffer);
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(GroundPlane.indices), gl.STATIC_DRAW );
            
        // Associate our shader variables with our data buffer
        GroundPlane.aPositionShader = gl.getAttribLocation( GroundPlane.shaderProgram, "aPosition" );
        GroundPlane.aTextureCoordShader = gl.getAttribLocation( GroundPlane.shaderProgram, "aTextureCoord" );
        GroundPlane.aNormalShader = gl.getAttribLocation( GroundPlane.shaderProgram, "aNormal" );
        
        GroundPlane.uModelMatrixShader = gl.getUniformLocation( GroundPlane.shaderProgram, "modelMatrix" );
        GroundPlane.uCameraMatrixShader = gl.getUniformLocation( GroundPlane.shaderProgram, "cameraMatrix" );
        GroundPlane.uProjectionMatrixShader = gl.getUniformLocation( GroundPlane.shaderProgram, "projectionMatrix" );

        GroundPlane.uMatAmbientShader = gl.getUniformLocation( GroundPlane.shaderProgram, "matAmbient" );
		GroundPlane.uMatDiffuseShader = gl.getUniformLocation( GroundPlane.shaderProgram, "matDiffuse" );
		GroundPlane.uMatSpecularShader = gl.getUniformLocation( GroundPlane.shaderProgram, "matSpecular" );
		GroundPlane.uMatAlphaShader = gl.getUniformLocation( GroundPlane.shaderProgram, "matAlpha" );

        //directional light
		GroundPlane.uLightDirectionShader = gl.getUniformLocation( GroundPlane.shaderProgram, "lightDirection" );
		GroundPlane.uLightAmbientShader = gl.getUniformLocation( GroundPlane.shaderProgram, "lightAmbient" );
		GroundPlane.uLightDiffuseShader = gl.getUniformLocation( GroundPlane.shaderProgram, "lightDiffuse" );
		GroundPlane.uLightSpecularShader = gl.getUniformLocation( GroundPlane.shaderProgram, "lightSpecular" );

        //spotlight
		GroundPlane.uSpotLightDirectionShader = gl.getUniformLocation( GroundPlane.shaderProgram, "spotlightDirection" );
		GroundPlane.uSpotLightAmbientShader = gl.getUniformLocation( GroundPlane.shaderProgram, "spotlightAmbient" );
		GroundPlane.uSpotLightDiffuseShader = gl.getUniformLocation( GroundPlane.shaderProgram, "spotlightDiffuse" );
		GroundPlane.uSpotLightSpecularShader = gl.getUniformLocation( GroundPlane.shaderProgram, "spotlightSpecular" );
        GroundPlane.uSpotLightLoc = gl.getUniformLocation( GroundPlane.shaderProgram, "spotlightLoc");
		GroundPlane.uSpotLightAlpha = gl.getUniformLocation( GroundPlane.shaderProgram, "spotlightAlpha");
		GroundPlane.uSpotLightCutoff = gl.getUniformLocation( GroundPlane.shaderProgram, "spotlightCutoff");
        GroundPlane.uSpotLightStatus = gl.getUniformLocation( GroundPlane.shaderProgram, "spotlightStatus");

    }
    
    static initializeTexture(){
        var image = new Image();

        image.onload = function(){
            GroundPlane.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, GroundPlane.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, image.width, image.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image);
            
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            
            GroundPlane.imageLoaded++;
        }
        
        image.src = "./textures/256x grass block.png";
    }
    
    constructor(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh){
        super(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh);
        this.setUp();
        if(GroundPlane.shaderProgram == -1){
            GroundPlane.initialize()
            GroundPlane.initializeTexture();
        }
        
    }
    
    draw() {
        if((GroundPlane.texture == -1) || (GroundPlane.imageLoaded != 1)) { //only draw when texture is loaded.
        	return;
        }
        
        gl.useProgram(GroundPlane.shaderProgram);
        
        gl.bindBuffer( gl.ARRAY_BUFFER, GroundPlane.positionBuffer);
       	gl.vertexAttribPointer(GroundPlane.aPositionShader, 3, gl.FLOAT, false, 0, 0 );
        
        gl.bindBuffer( gl.ARRAY_BUFFER, GroundPlane.normalBuffer);
       	gl.vertexAttribPointer(GroundPlane.aNormalShader, 3, gl.FLOAT, false, 0, 0 );
       	
       	gl.bindBuffer( gl.ARRAY_BUFFER, GroundPlane.textureCoordBuffer);
       	gl.vertexAttribPointer(GroundPlane.aTextureCoordShader, 2, gl.FLOAT, false, 0, 0 );
       	
       	gl.activeTexture(gl.TEXTURE0);
       	gl.bindTexture(gl.TEXTURE_2D, GroundPlane.texture);
       	gl.uniform1i(GroundPlane.uTextureUnit,0);

	
       	gl.uniformMatrix4fv(GroundPlane.uModelMatrixShader, false, flatten(this.modelMatrix));
        gl.uniformMatrix4fv(GroundPlane.uCameraMatrixShader, false, flatten(camera1.cameraMatrix));
        gl.uniformMatrix4fv(GroundPlane.uProjectionMatrixShader, false, flatten(camera1.projectionMatrix));

        gl.uniform4fv(GroundPlane.uMatAmbientShader, this.matAmbient);
		gl.uniform4fv(GroundPlane.uMatDiffuseShader, this.matDiffuse);
		gl.uniform4fv(GroundPlane.uMatSpecularShader, this.matSpecular);
		gl.uniform1f(GroundPlane.uMatAlphaShader, this.matAlpha);

        //directional light
		gl.uniform3fv(GroundPlane.uLightDirectionShader, light1.direction);
		gl.uniform4fv(GroundPlane.uLightAmbientShader, light1.ambient);
		gl.uniform4fv(GroundPlane.uLightDiffuseShader, light1.diffuse);
		gl.uniform4fv(GroundPlane.uLightSpecularShader, light1.specular);

        //spotlight
		gl.uniform3fv(GroundPlane.uSpotLightDirectionShader, light2.direction);
		gl.uniform4fv(GroundPlane.uSpotLightAmbientShader, light2.ambient);
		gl.uniform4fv(GroundPlane.uSpotLightDiffuseShader, light2.diffuse);
		gl.uniform4fv(GroundPlane.uSpotLightSpecularShader, light2.specular);
        gl.uniform3fv(GroundPlane.uSpotLightLoc, light2.location);
		gl.uniform1f(GroundPlane.uSpotLightAlpha, light2.alpha); 
		gl.uniform1f(GroundPlane.uSpotLightCutoff, light2.cutoff); 
        gl.uniform1f(GroundPlane.uSpotLightStatus, light2.status); 
                    
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, GroundPlane.indexBuffer);
	
        gl.enableVertexAttribArray(GroundPlane.aPositionShader);    
        gl.enableVertexAttribArray(GroundPlane.aTextureCoordShader);
        gl.enableVertexAttribArray(GroundPlane.aNormalShader);    
    	gl.drawElements(gl.TRIANGLES, GroundPlane.indices.length, gl.UNSIGNED_INT, 0);
    	gl.disableVertexAttribArray(GroundPlane.aPositionShader);    
    	gl.disableVertexAttribArray(GroundPlane.aTextureCoordShader);    
        gl.disableVertexAttribArray(GroundPlane.aNormalShader);    
    }

    setUp(){
        let v0 = vec3(-0.5, 0.0, 0.5); // front Left
		let v1 = vec3( 0.5, 0.0, 0.5); // front right
		let v2 = vec3( 0.5, 0.0,-0.5); // back right
        let v3 = vec3(-0.5, 0.0,-0.5); // back Left

        this.divideQuad(v0, v1, v2, v3, 6);
    }

    divideQuad(a, b, c, d, depth) {
        if (depth > 0) {
            var v1 = mult(0.5,add(a,b));
            v1[3] = 1.0;
            var v2 = mult(0.5,add(b,c));
            v2[3] = 1.0;
            var v3 = mult(0.5,add(c,d));
            v3[3] = 1.0;
            var v4 = mult(0.5,add(d,a));
            v4[3] = 1.0;
            var v5 = mult(0.5,add(a,c));
            v5[3] = 1.0;
            this.divideQuad(a, v1, v5,v4, depth - 1);
            this.divideQuad(v1, b, v2,v5, depth - 1);
            this.divideQuad(v2, c, v3,v5, depth - 1);
            this.divideQuad(v3, d, v4,v5, depth - 1);
        } else {
            
            // Allow duplicate to due to copying and pasting texture patches instead of fitting a texture into the plane
            GroundPlane.vertexPositions.push(a);
            GroundPlane.vertexPositions.push(b);
            GroundPlane.vertexPositions.push(c);
            GroundPlane.vertexPositions.push(d);
            
            GroundPlane.vertexTextureCoords.push(vec2(0,0));
            GroundPlane.vertexTextureCoords.push(vec2(1,0));
            GroundPlane.vertexTextureCoords.push(vec2(1,1));
            GroundPlane.vertexTextureCoords.push(vec2(0,1));

            //Triangle #1
            GroundPlane.indices.push(GroundPlane.vertexPositions.lastIndexOf(a));
            GroundPlane.indices.push(GroundPlane.vertexPositions.lastIndexOf(b));
            GroundPlane.indices.push(GroundPlane.vertexPositions.lastIndexOf(c));
        

            //Triangle #2
            GroundPlane.indices.push(GroundPlane.vertexPositions.lastIndexOf(c));
            GroundPlane.indices.push(GroundPlane.vertexPositions.lastIndexOf(d));
            GroundPlane.indices.push(GroundPlane.vertexPositions.lastIndexOf(a));

        }
    }
}


