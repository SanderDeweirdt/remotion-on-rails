import { Composition } from "remotion";
import { HelloWorld, myCompSchema } from "./HelloWorld";
import { GentVibesReel } from "./GentVibesReel";
import type { GentVibesReelProps } from "./GentVibesReel";

const SLIDE_DURATION = 90;
const INTRO = 90;
const OUTRO = 60;
const DEFAULT_EVENT_COUNT = 3;
const DEFAULT_DURATION = INTRO + DEFAULT_EVENT_COUNT * SLIDE_DURATION + OUTRO;

const sampleEvents: GentVibesReelProps["events"] = [
  {
    name: "Democrazy Festival",
    location: "Vooruit, Ghent",
    day: "Saturday",
    startTime: "20:00",
    category: "CONCERT",
    imageUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1080&q=80",
  },
  {
    name: "Kraakgeluid Open Mic",
    location: "Cafe Video, Ghent",
    day: "Saturday",
    startTime: "21:30",
    category: "MUSIC",
    imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1080&q=80",
  },
  {
    name: "Sunday Market Kouter",
    location: "Kouter, Ghent",
    day: "Sunday",
    startTime: "07:00",
    category: "MARKET",
    imageUrl: "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=1080&q=80",
  },
];

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        schema={myCompSchema}
        defaultProps={{
          titleText: "Welcome to Remotion",
          titleColor: "#000000",
          logoColor1: "#91EAE4",
          logoColor2: "#86A8E7",
        }}
      />
      <Composition
        id="GentVibesReel"
        component={GentVibesReel}
        durationInFrames={DEFAULT_DURATION}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ events: sampleEvents }}
        calculateMetadata={({ props }) => {
          const eventCount = props.events?.length ?? DEFAULT_EVENT_COUNT;
          const frames = INTRO + eventCount * SLIDE_DURATION + OUTRO;
          return { durationInFrames: frames };
        }}
      />
    </>
  );
};
