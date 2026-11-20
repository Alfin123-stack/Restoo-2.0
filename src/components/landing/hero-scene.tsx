/** Layered pixel landscape (day or night follows the theme). Decorative only. */
export function HeroScene() {
  return (
    <div className="scene" aria-hidden="true">
      <div className="scene-layer l-sky" />
      <div className="scene-par par-far">
        <div className="scene-par drift-a">
          <div className="scene-layer l-clouds-far" />
        </div>
      </div>
      <div className="scene-par par-city">
        <div className="scene-layer l-city" />
      </div>
      <div className="scene-par par-far">
        <div className="scene-par drift-b">
          <div className="scene-layer l-clouds-near" />
        </div>
      </div>
      <div className="scene-layer l-mid" />
      <div className="scene-layer l-tree" />
      <div className="scene-layer l-grass" />
      <div className="scene-layer l-warung" />
      <div className="scene-layer l-steam0" />
      <div className="scene-layer l-steam1" />
      <div className="scene-rays" />
    </div>
  );
}
