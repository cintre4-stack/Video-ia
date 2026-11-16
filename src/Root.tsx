import { Composition, Folder } from "remotion";
import { ReelAnfield } from "./ReelAnfield/ReelAnfield";
import { REEL_ANFIELD_FRAMES } from "./ReelAnfield/timeline";
import { ReelLasagna } from "./ReelLasagna/ReelLasagna";
import { REEL_LASAGNA_FRAMES } from "./ReelLasagna/timeline";
import { Reel9320 } from "./Reel9320/Reel9320";
import { REEL_9320_FRAMES } from "./Reel9320/timeline";

export const RemotionRoot: React.FC = () => {
  return (
    <Folder name="Reels">
      <Composition
        id="Reel-Aguero-9320"
        component={Reel9320}
        durationInFrames={REEL_9320_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Reel-Anfield-2019"
        component={ReelAnfield}
        durationInFrames={REEL_ANFIELD_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Reel-Lasana-ChefBolo"
        component={ReelLasagna}
        durationInFrames={REEL_LASAGNA_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
    </Folder>
  );
};
