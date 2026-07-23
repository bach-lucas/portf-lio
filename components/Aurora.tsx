'use client'

import { useEffect, useRef } from 'react'
import { Color, Mesh, Program, Renderer, Triangle } from 'ogl'

const vertex = `#version 300 es
in vec2 position;
void main(){gl_Position=vec4(position,0.,1.);}`
const fragment = `#version 300 es
precision highp float;
uniform float uTime; uniform vec2 uResolution; uniform vec3 uColors[3]; out vec4 color;
float noise(vec2 p){return sin(p.x*3.1+sin(p.y*2.7+uTime*.35))*.5+.5;}
void main(){vec2 uv=gl_FragCoord.xy/uResolution;float wave=noise(vec2(uv.x*2.2,uv.y*1.4+uTime*.12));float band=smoothstep(.05,.55,uv.y+wave*.42-.28);vec3 left=mix(uColors[0],uColors[1],uv.x);vec3 right=mix(uColors[1],uColors[2],uv.x);vec3 glow=mix(left,right,uv.x);float fade=smoothstep(0.,.24,band)*(1.-smoothstep(.65,1.,uv.y));color=vec4(glow*band*1.5,fade*.92);}`

export function Aurora({ colors = ['#ff704f', '#d9f17e', '#8973f2'] }: { colors?: string[] }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const container = ref.current
    if (!container) return
    const renderer = new Renderer({ alpha: true, antialias: true })
    const gl = renderer.gl
    gl.clearColor(0, 0, 0, 0)
    const geometry = new Triangle(gl)
    const program = new Program(gl, { vertex, fragment, uniforms: { uTime: { value: 0 }, uResolution: { value: [1, 1] }, uColors: { value: colors.map((hex) => { const c = new Color(hex); return [c.r, c.g, c.b] }) } } })
    const mesh = new Mesh(gl, { geometry, program })
    container.appendChild(gl.canvas)
    const resize = () => { renderer.setSize(container.clientWidth, container.clientHeight); program.uniforms.uResolution.value = [container.clientWidth, container.clientHeight] }
    let frame = 0
    const animate = (time: number) => { program.uniforms.uTime.value = time * .001; renderer.render({ scene: mesh }); frame = requestAnimationFrame(animate) }
    frame = requestAnimationFrame(animate); resize(); window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize); gl.canvas.remove(); gl.getExtension('WEBGL_lose_context')?.loseContext() }
  }, [colors])
  return <div className="aurora-container" ref={ref} aria-hidden="true" />
}
