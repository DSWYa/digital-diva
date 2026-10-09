import React from "react";
import { Composition } from "remotion";
import { DigitalDiva, DigitalDivaProps } from "./DigitalDiva";
import { analysis } from "./lib/timing";

const FPS = 30;

export const RemotionRoot: React.FC = () => (
  <Composition
    id="DigitalDiva"
    component={DigitalDiva}
    durationInFrames={Math.ceil(analysis.durationSec * FPS)}
    fps={FPS}
    width={1920}
    height={1080}
    defaultProps={{ showTimingDebug: false } satisfies DigitalDivaProps}
  />
);
