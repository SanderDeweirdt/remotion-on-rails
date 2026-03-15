import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from "remotion";

export interface GentEvent {
  name: string;
  location: string;
  day: string;
  startTime: string;
  category: string;
  imageUrl: string;
}

export interface GentVibesReelProps {
  events: GentEvent[];
}

const TEAL = "#00C9B1";
const SLIDE_DURATION_FRAMES = 90;
const INTRO_DURATION = 90;
const OUTRO_DURATION = 60;

function formatCategory(cat: string): string {
  return cat.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

const IntroSlide: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleOpacity = spring({ frame, fps, from: 0, to: 1, durationInFrames: 30 });
  const subtitleOpacity = spring({ frame: frame - 15, fps, from: 0, to: 1, durationInFrames: 30 });
  const tagOpacity = spring({ frame: frame - 30, fps, from: 0, to: 1, durationInFrames: 30 });
  const scale = spring({ frame, fps, from: 0.85, to: 1, durationInFrames: 40 });
  return (
    <AbsoluteFill style={{ background: "linear-gradient(160deg, #0a0a0a 0%, #111827 60%, #0f2027 100%)", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 6, background: TEAL, opacity: titleOpacity }} />
      <div style={{ transform: `scale(${scale})`, alignItems: "center", display: "flex", flexDirection: "column" }}>
        <div style={{ opacity: tagOpacity, fontSize: 32, color: TEAL, fontFamily: "sans-serif", fontWeight: 700, letterSpacing: 4, marginBottom: 24, textTransform: "uppercase" }}>@gentvibes</div>
        <div style={{ opacity: titleOpacity, fontSize: 110, fontWeight: 900, color: "#ffffff", fontFamily: "sans-serif", textAlign: "center", lineHeight: 1, letterSpacing: -2 }}>THIS<br />WEEKEND</div>
        <div style={{ opacity: subtitleOpacity, fontSize: 38, color: "rgba(255,255,255,0.6)", fontFamily: "sans-serif", fontWeight: 400, marginTop: 24, letterSpacing: 6, textTransform: "uppercase" }}>in Ghent</div>
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 6, background: TEAL, opacity: titleOpacity }} />
    </AbsoluteFill>
  );
};

const EventSlide: React.FC<{ event: GentEvent; index: number; total: number }> = ({ event, index, total }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const contentOpacity = spring({ frame, fps, from: 0, to: 1, durationInFrames: 20 });
  const slideIn = spring({ frame, fps, from: 60, to: 0, durationInFrames: 25 });
  const imgScale = interpolate(frame, [0, SLIDE_DURATION_FRAMES], [1, 1.07], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <Img src={event.imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${imgScale})`, transformOrigin: "center center" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 35%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0.5) 80%, rgba(0,0,0,0.75) 100%)" }} />
      <AbsoluteFill style={{ padding: "80px 60px 0", transform: `translateY(${slideIn}px)`, opacity: contentOpacity }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div style={{ background: TEAL, color: "#000", fontFamily: "sans-serif", fontWeight: 800, fontSize: 24, padding: "8px 24px", borderRadius: 100, letterSpacing: 1, textTransform: "uppercase" }}>{formatCategory(event.category)}</div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontFamily: "sans-serif", fontWeight: 600, fontSize: 24, letterSpacing: 2 }}>{index + 1} / {total}</div>
        </div>
        <div style={{ color: "#ffffff", fontFamily: "sans-serif", fontWeight: 900, fontSize: 68, lineHeight: 1.1, letterSpacing: -1, maxWidth: 900, marginBottom: 28, textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>{event.name}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 16 }}>
          <div style={{ color: TEAL, fontFamily: "sans-serif", fontWeight: 700, fontSize: 32, letterSpacing: 1 }}>{event.day.toUpperCase()}</div>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.4)" }} />
          <div style={{ color: "rgba(255,255,255,0.85)", fontFamily: "sans-serif", fontWeight: 600, fontSize: 32 }}>{event.startTime}</div>
        </div>
        <div style={{ color: "rgba(255,255,255,0.7)", fontFamily: "sans-serif", fontWeight: 500, fontSize: 28, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 26 }}>📍</span>{event.location}
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", bottom: 200, right: 60, color: "rgba(255,255,255,0.5)", fontFamily: "sans-serif", fontWeight: 700, fontSize: 22, letterSpacing: 2, opacity: contentOpacity }}>@gentvibes</div>
    </AbsoluteFill>
  );
};

const OutroSlide: React.FC<{ eventCount: number }> = ({ eventCount }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = spring({ frame, fps, from: 0, to: 1, durationInFrames: 25 });
  const scale = spring({ frame, fps, from: 0.9, to: 1, durationInFrames: 30 });
  return (
    <AbsoluteFill style={{ background: "linear-gradient(160deg, #0a0a0a 0%, #111827 60%, #0f2027 100%)", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 6, background: TEAL }} />
      <div style={{ opacity, transform: `scale(${scale})`, display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
        <div style={{ fontSize: 90, fontFamily: "sans-serif", fontWeight: 900, color: "#fff", letterSpacing: -2, textAlign: "center", lineHeight: 1 }}>SEE YOU<br />THERE!</div>
        <div style={{ width: 80, height: 4, background: TEAL, borderRadius: 2 }} />
        <div style={{ fontSize: 34, fontFamily: "sans-serif", fontWeight: 700, color: TEAL, letterSpacing: 3, textTransform: "uppercase" }}>@gentvibes</div>
        <div style={{ fontSize: 26, fontFamily: "sans-serif", fontWeight: 400, color: "rgba(255,255,255,0.5)", letterSpacing: 2 }}>{eventCount} events this weekend in Ghent</div>
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 6, background: TEAL }} />
    </AbsoluteFill>
  );
};

export const GentVibesReel: React.FC<GentVibesReelProps> = ({ events }) => {
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Sequence from={0} durationInFrames={INTRO_DURATION}><IntroSlide /></Sequence>
      {events.map((event, i) => (
        <Sequence key={i} from={INTRO_DURATION + i * SLIDE_DURATION_FRAMES} durationInFrames={SLIDE_DURATION_FRAMES}>
          <EventSlide event={event} index={i} total={events.length} />
        </Sequence>
      ))}
      <Sequence from={INTRO_DURATION + events.length * SLIDE_DURATION_FRAMES} durationInFrames={OUTRO_DURATION}>
        <OutroSlide eventCount={events.length} />
      </Sequence>
    </AbsoluteFill>
  );
};
