const stars = Array.from({ length: 54 }, (_, index) => ({
  left: `${(index * 37) % 100}%`,
  top: `${(index * 61 + 7) % 100}%`,
  size: `${index % 5 === 0 ? 3 : index % 3 === 0 ? 2 : 1}px`,
  delay: `${(index % 9) * .45}s`,
}))

export function UniverseLayer() {
  return <div className="universe-layer" aria-hidden="true"><div className="nebula nebula-one" /><div className="nebula nebula-two" /><div className="star-field">{stars.map((star, index) => <i key={index} style={{ left: star.left, top: star.top, width: star.size, height: star.size, animationDelay: star.delay }} />)}</div><div className="shooting-star" /></div>
}
