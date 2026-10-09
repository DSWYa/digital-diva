import React from "react";
import { Composition } from "remotion";
import { DigitalDiva } from "./DigitalDiva";
import { outro } from "./lib/plan";

const FPS = 30;

export const RemotionRoot: React.FC = () => (
  <Composition
    id="DigitalDiva"
    component={DigitalDiva}
    durationInFrames={Math.ceil(outro.end * FPS)}
    fps={FPS}
    width={1920}
    height={1080}
    defaultProps={{ showTimingDebug: false }}
  />
);
