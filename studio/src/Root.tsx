import React from "react";
import { Composition } from "remotion";
import { MoonMarket, MOONMARKET_FRAMES } from "./videos/moonmarket/MoonMarket";

export const Root: React.FC = () => (
  <Composition
    id="MoonMarket"
    component={MoonMarket}
    durationInFrames={MOONMARKET_FRAMES}
    fps={30}
    width={1080}
    height={1920}
  />
);
