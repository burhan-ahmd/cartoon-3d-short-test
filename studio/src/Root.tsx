import React from "react";
import { Composition } from "remotion";
import { MoonMarket, MOONMARKET_FRAMES } from "./videos/moonmarket/MoonMarket";
import { MonsoonCity, MONSOON_FRAMES } from "./videos/monsoon/MonsoonCity";

export const Root: React.FC = () => <>
  <Composition id="MoonMarket" component={MoonMarket} durationInFrames={MOONMARKET_FRAMES} fps={30} width={1080} height={1920} />
  <Composition id="MonsoonCity" component={MonsoonCity} durationInFrames={MONSOON_FRAMES} fps={30} width={1080} height={1920} />
</>;
