'use client'

import { useLayoutEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Color, Mesh, ShaderMaterial } from 'three'

const vertexShader = `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`
const fragmentShader = `varying vec2 vUv; uniform float uTime; uniform float uSpeed; uniform float uScale; uniform float uRotation; uniform float uNoiseIntensity; uniform vec3 uColor; float noise(vec2 p){float G=2.71828;vec2 r=G*sin(G*p);return fract(r.x*r.y*(1.0+p.x));} vec2 rotateUvs(vec2 uv,float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c)*uv;} void main(){float rnd=noise(gl_FragCoord.xy);vec2 uv=rotateUvs(vUv*uScale,uRotation);float t=uSpeed*uTime;uv.y+=.03*sin(8.0*uv.x-t);float pattern=.6+.4*sin(5.0*(uv.x+uv.y+cos(3.0*uv.x+5.0*uv.y)+.02*t)+sin(20.0*(uv.x+uv.y-.1*t)));vec3 col=uColor*pattern-rnd/15.0*uNoiseIntensity;gl_FragColor=vec4(col,1.0);}`

function SilkPlane({ color, speed, scale, noiseIntensity, rotation }: { color: string; speed: number; scale: number; noiseIntensity: number; rotation: number }) {
  const ref = useRef<Mesh>(null)
  const { viewport } = useThree()
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uSpeed: { value: speed }, uScale: { value: scale }, uNoiseIntensity: { value: noiseIntensity }, uRotation: { value: rotation }, uColor: { value: new Color(color) } }), [color, speed, scale, noiseIntensity, rotation])
  useLayoutEffect(() => { ref.current?.scale.set(viewport.width, viewport.height, 1) }, [viewport])
  // Movimento deliberadamente lento: o background respira sem competir com os projetos.
  useFrame((_, delta) => { uniforms.uTime.value += .035 * delta })
  return <mesh ref={ref}><planeGeometry args={[1, 1]} /><shaderMaterial uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} /></mesh>
}

export function Silk({ speed = 5, scale = 1, color = '#7B7481', noiseIntensity = 1.5, rotation = 0 }) {
  return <Canvas className="silk-canvas" dpr={[1, 2]} frameloop="always"><SilkPlane speed={speed} scale={scale} color={color} noiseIntensity={noiseIntensity} rotation={rotation} /></Canvas>
}
