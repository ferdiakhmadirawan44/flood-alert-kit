// ---------------------------------------------------------------------------
// SIAGA — Alert Email
// The alert a resident of the Ciliwung riverside receives: what the level
// is, what it means, what to do now, where to go — everything derived from
// the one gauge reading, so the email can never disagree with the page,
// the guide or the card that carry the same reading ID.
// ---------------------------------------------------------------------------

import {
  Button,
  Column,
  Divider,
  Email,
  Heading,
  Link,
  MergeTag,
  Menu,
  Row,
  Section,
  Span,
  Text,
  token,
} from "@hyper-elements/react";
import {
  defaultData,
  formatArrivalWib,
  levelFromTma,
  levelInfo,
  manggaraiArrival,
  type SiagaData,
} from "./data.js";
import { ActionsList, AreasList, GaugeBars, LevelBadge, ReadingProof, SampleNote, ShelterTable } from "./shared.js";
import { C, MONO_FONT, siagaTheme } from "./theme.js";

export interface AlertEmailProps {
  data?: SiagaData;
}

function AlertEmail({ data = defaultData }: AlertEmailProps) {
  const r = data.reading;
  const level = levelFromTma(r.tmaCm);
  const info = levelInfo(level);
  const arrival = formatArrivalWib(manggaraiArrival(r, data.etaHoursToManggarai));
  return (
    <Email
      theme={siagaTheme}
      title={`${info.code} — Flood alert: Ciliwung at ${r.tmaCm} cm at Katulampa`}
      previewText={`${info.code} — Ciliwung at ${r.tmaCm} cm at Katulampa. ${info.headline}. Water reaches Manggarai around ${arrival}.`}
      lang="en"
      style={{ gap: 0 }}
    >
      {/* ---- Masthead: level-coloured band ---- */}
      <Section
        tokens={{ colors: { background: info.color, foreground: "#FFFFFF" } }}
        style={{ backgroundColor: info.color, padding: [28, 0, 24, 0], gap: 16 }}
      >
        <Row style={{ gap: 14, alignItems: "center" }}>
          <Column style={{ gap: 2 }}>
            <Text
              style={{
                fontSize: 30,
                fontWeight: 800,
                lineHeight: 1.15,
                color: "#FFFFFF",
                letterSpacing: 3,
              }}
            >
              SIAGA
            </Text>
            <Text style={{ color: "#FFFFFF", fontSize: 13 }}>
              Flood alert · Sungai Ciliwung · Jakarta
            </Text>
          </Column>
        </Row>
        <Divider style={{ borderTop: { width: 1, style: "solid", color: "#FFFFFF" } }} />
        <Row style={{ gap: 16, alignItems: "center" }}>
          <LevelBadge level={level} />
          <Text style={{ color: "#FFFFFF", fontSize: 12, fontFamily: MONO_FONT, flex: 1 }}>
            Reading {r.id}
          </Text>
          <Text style={{ color: "#FFFFFF", fontSize: 12, textAlign: "right" }}>
            {r.recordedAtLabel}
          </Text>
        </Row>
      </Section>

      {/* ---- Body ---- */}
      <Section style={{ padding: [24, 0, 8, 0], gap: 24 }}>
        {/* Hero: what is happening */}
        <Column style={{ apply: ["card"] }}>
          <Text
            style={{
              fontSize: 12,
              letterSpacing: 1.4,
              textTransform: "uppercase",
              color: token("colors.muted"),
            }}
          >
            Flood alert · {r.gauge}
          </Text>
          <Heading level={1}>{info.headline}</Heading>
          <Text>
            Good evening, <MergeTag name="first_name" /> — the Ciliwung at{" "}
            <Span style={{ fontWeight: 700 }}>{r.gauge}</Span> is at{" "}
            <Span style={{ fontWeight: 700, color: info.dark }}>{r.tmaCm} cm</Span>, up{" "}
            <Span style={{ fontWeight: 700, color: info.dark }}>
              {r.rise10mCm} cm in the last 10 minutes
            </Span>
            . That puts the river at {info.code} ({info.name}).
          </Text>
          <Divider style={{ borderTop: { width: 1, style: "solid", color: token("colors.border") } }} />
          <Row style={{ gap: 24 }}>
            <Column style={{ gap: 4 }}>
              <Text
                style={{
                  fontSize: 12,
                  letterSpacing: 1.2,
                  textTransform: "uppercase",
                  color: token("colors.muted"),
                }}
              >
                Water level
              </Text>
              <Text style={{ fontFamily: MONO_FONT, fontSize: 22, fontWeight: 700, color: info.dark }}>
                {r.tmaCm} cm
              </Text>
              <Text style={{ fontSize: 13, fontWeight: 700, color: info.dark }}>
                {info.code} · rising
              </Text>
            </Column>
            <Column style={{ gap: 4 }}>
              <Text
                style={{
                  fontSize: 12,
                  letterSpacing: 1.2,
                  textTransform: "uppercase",
                  color: token("colors.muted"),
                }}
              >
                Reaches Manggarai
              </Text>
              <Text style={{ fontFamily: MONO_FONT, fontSize: 22, fontWeight: 700 }}>
                ~{data.etaHoursToManggarai} hours
              </Text>
              <Text style={{ fontSize: 13, fontWeight: 700, color: info.dark }}>
                around {arrival}
              </Text>
            </Column>
          </Row>
          <Text style={{ fontSize: 13, color: token("colors.muted") }}>{info.meaning}</Text>
        </Column>

        {/* What to do now */}
        <Column style={{ apply: ["card"] }}>
          <Heading level={2}>What to do now</Heading>
          <ActionsList data={data} />
        </Column>

        {/* How the water rose */}
        <Column style={{ apply: ["card"] }}>
          <Heading level={2}>How the water rose</Heading>
          <Text style={{ color: token("colors.muted") }}>
            From 50 cm to {r.tmaCm} cm in 70 minutes — every bar below is one gauge reading from
            the same evening, coloured by the level it reached.
          </Text>
          <GaugeBars data={data} />
        </Column>

        {/* Areas affected */}
        <Column style={{ apply: ["card"] }}>
          <Heading level={2}>Areas affected</Heading>
          <AreasList data={data} />
        </Column>

        {/* Where to go */}
        <Column style={{ apply: ["card"] }}>
          <Heading level={2}>Where to go</Heading>
          <Text style={{ color: token("colors.muted") }}>
            Shelters open for this reading — go to the one nearest you, and tell your neighbours.
          </Text>
          <ShelterTable data={data} />
          <Text style={{ fontSize: 13, fontWeight: 700 }}>
            Emergency: {data.hotlineLabel} — call {data.hotline}.
          </Text>
        </Column>

        {/* Proof strip */}
        <Column style={{ apply: ["card"] }}>
          <Heading level={3}>One reading, one level</Heading>
          <ReadingProof data={data} />
          <Button href={`https://example.com/siaga/${r.id}`}>See the live status page</Button>
        </Column>
      </Section>

      {/* ---- Footer ---- */}
      <Section style={{ padding: [24, 0, 32, 0], gap: 24 }}>
        <Menu
          items={[
            { text: "Live status", href: `https://example.com/siaga/${r.id}` },
            { text: "Evacuation guide (PDF)", href: `https://example.com/siaga/${r.id}/guide.pdf` },
            { text: "Unsubscribe", href: "https://example.com/unsubscribe" },
          ]}
          separator="·"
          style={{ fontSize: 13, color: token("colors.muted") }}
        />
        <Text style={{ fontSize: 12, color: token("colors.muted"), textAlign: "center" }}>
          SIAGA flood alerts for the Ciliwung riverside, from {data.source}. You are receiving
          this because you subscribed to flood alerts for your area.
        </Text>
        <SampleNote />
        <Text style={{ fontSize: 12, color: token("colors.muted"), textAlign: "center" }}>
          BPBD DKI Jakarta · Jl. Raya Bogor, Jakarta · Emergency {data.hotline}
        </Text>
      </Section>
    </Email>
  );
}

// Props for `npx hyper-elements check/render` (the template renders its
// sample data when no props are given).
export default Object.assign(AlertEmail, { PreviewProps: {} });
