import { gridToRects } from "@/lib/pixel/art";
import { buildWarungScene, SCENE_H, SCENE_W } from "@/lib/pixel/scene";
import { Mascot, Sprite } from "./sprite";

const grid = buildWarungScene();
const rects = gridToRects(grid, 0, undefined, true);

/**
 * Warung street scene for the hero. 320px wide (scale 5) on small screens and 512px (scale 8)
 * from sm up, so every pixel stays an integer multiple. Only the mascot moves.
 */
export function WarungScene() {
  return (
    <div className="px-box scene-sky relative z-10 mx-auto w-[320px] overflow-hidden [--px-bg:var(--color-langit-300)] sm:w-[512px] lg:translate-y-36">
      <div className="relative aspect-[2/1]">
        {/* clouds: static (one moving thing per screen: the mascot) */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-[14%] h-full overflow-hidden"
        >
          <div className="absolute left-[8%]">
            <Sprite name="cloud" scale={4} still />
          </div>
          <div className="absolute top-8 left-[62%]">
            <Sprite name="cloud" scale={3} still />
          </div>
        </div>

        <svg
          viewBox={`0 0 ${SCENE_W} ${SCENE_H}`}
          shapeRendering="crispEdges"
          role="img"
          aria-label="Pixel warung with a striped awning, bunting flags, and Koki Meong waving hello"
          className="absolute inset-0 size-full"
        >
          {rects.map((r, i) => (
            <rect key={i} x={r.x} y={r.y} width={r.w} height={1} fill={r.fill} />
          ))}
        </svg>

        {/* steaming bowl on the counter */}
        <div className="absolute bottom-[34.4%] left-[40.6%]">
          <span className="sm:hidden">
            <Sprite name="bowl-steam" scale={5} fps={2} still />
          </span>
          <span className="hidden sm:block">
            <Sprite name="bowl-steam" scale={8} fps={2} still />
          </span>
        </div>

        {/* Koki Meong greets you */}
        <div className="absolute bottom-[6.25%] left-[7%]">
          <span className="sm:hidden">
            <Mascot scale={5} mood="happy" />
          </span>
          <span className="hidden sm:block">
            <Mascot scale={8} mood="happy" />
          </span>
        </div>
      </div>
    </div>
  );
}
