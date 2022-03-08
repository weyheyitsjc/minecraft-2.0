#version 300 es
precision mediump float;

in vec3 texCoord;
uniform samplerCube textureUnit;

out vec4 fColor;

void main()
{
    fColor = texture(textureUnit, texCoord);
    fColor.a = 1.0;
}