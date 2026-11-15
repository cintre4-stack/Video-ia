import { Composition, Folder } from "remotion";
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
    </Folder>
  );
};
