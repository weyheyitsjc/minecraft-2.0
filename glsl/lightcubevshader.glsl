#version 300 es
in vec3 aPosition;
in vec3 aNormal;

out vec3 texCoord;
out vec4 vColor;

uniform mat4 modelMatrix, cameraMatrix, projectionMatrix;

uniform vec4 matAmbient, matDiffuse, matSpecular;
uniform float matAlpha;

uniform vec3 lightDirection;
uniform vec4 lightAmbient, lightDiffuse, lightSpecular;

uniform vec3 spotlightLoc, spotlightDirection;
uniform vec4 spotlightAmbient, spotlightDiffuse, spotlightSpecular;
uniform float spotlightAlpha, spotlightCutoff, spotlightStatus;


void main()
{
    gl_Position = projectionMatrix*cameraMatrix*modelMatrix*vec4(aPosition,1.0);
    texCoord = normalize(aPosition.xyz);

    //compute vectors in camera coordinates
    //the vertex in camera coordinates
    vec3 pos = (cameraMatrix*modelMatrix*vec4(aPosition,1.0)).xyz;

    //the ray from the vertex towards the light
    //for a directional light, this is just -lightDirection
    vec3 L = normalize((-cameraMatrix*vec4(lightDirection,0.0)).xyz);
    //for a spotlight this is just -lightdirection
    vec3 SL = normalize((-cameraMatrix*vec4(spotlightDirection,0.0)).xyz); 
    
    //the ray from the vertex towards the camera
    vec3 E = normalize(vec3(0,0,0)-pos);
    
    //normal in camera coordinates
    vec3 N = normalize(cameraMatrix*modelMatrix*vec4(aNormal,0)).xyz;
    
    //half-way vector	
    vec3 H = normalize(L+E);
    
    //directional light
    vec4 ambient = lightAmbient*matAmbient;
    
    float Kd = max(dot(L,N),0.0);
    vec4 diffuse = Kd*lightDiffuse*matDiffuse;
    
    float Ks = pow(max(dot(N,H),0.0),matAlpha);
    vec4 specular = Ks*lightSpecular*matSpecular;
    
    vec4 lightColor1 = ambient + diffuse + specular;

    //spotlight
    vec4 sAmbient = spotlightAmbient*matAmbient;
    
    float sKd = max(dot(SL,N),0.0);
    vec4 sDiffuse = sKd*spotlightDiffuse*matDiffuse;

    vec3 sH = normalize(SL+E);
    float sKs = pow(max(dot(N,sH),0.0),matAlpha);
    vec4 sSpecular = sKs*spotlightSpecular*matSpecular;
    
    vec3 LsToPoint = normalize(pos-spotlightLoc);
    float cSpot = pow(max(dot(LsToPoint,normalize(spotlightDirection)),0.0),spotlightAlpha);
    
    vec4 lightColor2;
    
    if (spotlightStatus > 0.5) {
        if (abs(acos(dot(LsToPoint,normalize(spotlightDirection)))) > (spotlightCutoff)){
            lightColor2 = vec4(0.0,0.0,0.0,0.0);
        } else {
            lightColor2 = cSpot/pow((dot((pos-spotlightLoc),(pos-spotlightLoc))),0.15)*(sAmbient + sDiffuse + sSpecular);
        }
    } 

    //vec4 lightColor = lightColor2;

    vec4 lightColor = lightColor1+lightColor2;
    lightColor.a = 1.0;

    vColor = lightColor;
}