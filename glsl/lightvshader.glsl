#version 300 es
in vec3 aPosition;
in vec2 aTextureCoord;
in vec3 aNormal;

out vec2 vTextureCoord;
out vec4 vColor;

uniform mat4 modelMatrix, cameraMatrix, projectionMatrix;

uniform vec4 matAmbient, matDiffuse, matSpecular;
uniform float matAlpha;

uniform vec3 spotlightLoc, spotlightDirection;
uniform vec4 spotlightAmbient, spotlightDiffuse, spotlightSpecular;
uniform float spotlightAlpha, spotlightCutoff;



void main()
{
    gl_Position = projectionMatrix*cameraMatrix*modelMatrix*vec4(aPosition,1.0);
    vTextureCoord = aTextureCoord;

    //compute vectors in camera coordinates
    //the vertex in camera coordinates
    vec3 pos = (cameraMatrix*modelMatrix*vec4(aPosition,1.0)).xyz;

    //the ray from the vertex towards the light
    //for a spotlight this is just -lightdirection
    vec3 SL = normalize((-cameraMatrix*vec4(spotlightDirection,0.0)).xyz); 
    
    //the ray from the vertex towards the camera
    vec3 E = normalize(vec3(0,0,0)-pos);
    
    //normal in camera coordinates
    vec3 N = normalize(cameraMatrix*modelMatrix*vec4(aNormal,0)).xyz;

    //spotlight
    vec4 sAmbient = spotlightAmbient*matAmbient;
    
    float sKd = max(dot(SL,N),0.0);
    vec4 sDiffuse = sKd*spotlightDiffuse*matDiffuse;

    vec3 sH = normalize(SL+E);
    float sKs = pow(max(dot(N,sH),0.0),matAlpha);
    vec4 sSpecular = sKs*spotlightSpecular*matSpecular;
    
    vec3 LsToPoint = normalize(pos-spotlightLoc);
    float cSpot = pow(max(dot(LsToPoint,normalize(spotlightDirection)),0.0),spotlightAlpha);
    
    vec4 lightColor;
    
    if (abs(acos(dot(LsToPoint,normalize(spotlightDirection)))) > (spotlightCutoff)){
        lightColor = vec4(0.0,0.0,0.0,0.0);
    } else {
        lightColor = cSpot/pow((dot((pos-spotlightLoc),(pos-spotlightLoc))),0.15)*(sDiffuse + sSpecular) + sAmbient;
    }

    lightColor.a = 1.0;

    vColor = lightColor;
}