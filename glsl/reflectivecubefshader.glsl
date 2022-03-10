#version 300 es
precision mediump float;

in vec3 R;
uniform samplerCube textureUnit;

out vec4 fColor;

void main()
{
    fColor = texture(textureUnit, R);
    fColor.a = 1.0;
}