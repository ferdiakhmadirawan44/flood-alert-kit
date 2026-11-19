// ---------------------------------------------------------------------------
// SIAGA — Warning Card (Canvas, 1200 × 630)
// The share card: one glance, one level. It is built to be forwarded on
// WhatsApp and social media — the level, the water height, when the water
// arrives, what to do, and the reading ID that ties it to the email, the
// page and the guide. All visuals are drawn in code (SVG wave, level
// colours); there are no image assets.
// ---------------------------------------------------------------------------

import { Canvas, Column, Path, Row, Svg, Text } from "@hyper-elements/react";
import {
  defaultData,
  formatArrivalWib,
  levelFromTma,
  levelInfo,
  manggaraiArrival,
  type SiagaData,
} from "./data.js";
import { LevelBadge } from "./shared.js";
import { MONO_FONT, PRINT_FONT, PRINT_FONTS, siagaTheme } from "./theme.js";

export interface WarningCardProps {
  data?: SiagaData;
}

function WarningCard({ data = defaultData }: WarningCardProps) {
  const r = data.reading;
  const level = levelFromTma(r.tmaCm);
  const info = levelInfo(level);
  const arrival = formatArrivalWib(manggaraiArrival(r, data.etaHoursToManggarai));
  const strip = data.chronology.map((p) => `${p.time} ${p.tmaCm}`).join("  ·  ");
  return (
    <Canvas
      theme={siagaTheme}
      fonts={PRINT_FONTS}
      title={`SIAGA ${info.code} — Ciliwung at ${r.tmaCm} cm`}
      width={1200}
      height={630}
      lang="en"
      style={{ backgroundColor: info.color, fontFamily: PRINT_FONT, gap: 0 }}
    >
      {/* ---- Top: brand + reading ---- */}
      <Column style={{ padding: [44, 48, 0, 48], gap: 20 }}>
        <Row style={{ gap: 16, alignItems: "center" }}>
          <Text style={{ color: "#FFFFFF", fontSize: 30, fontWeight: 800, letterSpacing: 4 }}>
            SIAGA
          </Text>
          <LevelBadge level={level} />
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 14,
              fontFamily: MONO_FONT,
              flex: 1,
              textAlign: "right",
            }}
          >
            {r.id}
          </Text>
        </Row>

        {/* ---- The message ---- */}
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 104,
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: 2,
          }}
        >
          {info.code}
        </Text>
        <Text style={{ color: "#FFFFFF", fontSize: 44, fontWeight: 800, fontFamily: MONO_FONT }}>
          CILIWUNG · {r.tmaCm} cm
        </Text>
        <Text style={{ color: "#FFFFFF", fontSize: 24, fontWeight: 700 }}>
          {info.headline} — {r.gauge}, {r.recordedAtLabel}
        </Text>
      </Column>

      {/* ---- Wave divider into the dark band ---- */}
      <Svg width={1200} height={56} viewBox="0 0 1200 56" title="Rising water">
        <Path
          d="M0,28 Q150,4 300,28 T600,28 T900,28 T1200,28 L1200,56 L0,56 Z"
          style={{ fill: info.dark }}
        />
      </Svg>

      {/* ---- Bottom band: when + what + proof ---- */}
      <Column style={{ backgroundColor: info.dark, padding: [8, 48, 36, 48], gap: 10 }}>
        <Row style={{ gap: 32 }}>
          <Text style={{ color: "#FFFFFF", fontSize: 20, fontWeight: 800, flex: 1 }}>
            Water reaches Manggarai ~{arrival}
          </Text>
          <Text style={{ color: "#FFFFFF", fontSize: 20, fontWeight: 800 }}>
            Emergency: call {data.hotline}
          </Text>
        </Row>
        <Text style={{ color: info.tint, fontSize: 13, fontFamily: MONO_FONT }}>
          {strip} cm · Source: {data.source}
        </Text>
      </Column>
    </Canvas>
  );
}

// Props for `npx hyper-elements check/render` (the template renders its
// sample data when no props are given).
export default Object.assign(WarningCard, { PreviewProps: {} });
