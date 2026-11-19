// ---------------------------------------------------------------------------
// SIAGA — Status Page
// The live dashboard for one gauge reading: the level, the water, the
// countdown to Manggarai, the areas, the shelters, the routes. Everything
// on this page is derived from the same reading as the email, the guide
// and the card — same reading ID, same level, same numbers.
// ---------------------------------------------------------------------------

import {
  Column,
  Divider,
  Grid,
  Heading,
  Page,
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
  type SiagaLevel,
} from "./data.js";
import {
  ActionsList,
  AreasList,
  GaugeChart,
  LevelBadge,
  ReadingProof,
  SampleNote,
  ShelterTable,
} from "./shared.js";
import { C, MONO_FONT, siagaTheme } from "./theme.js";

export interface StatusPageProps {
  data?: SiagaData;
}

function StatusPage({ data = defaultData }: StatusPageProps) {
  const r = data.reading;
  const level = levelFromTma(r.tmaCm);
  const info = levelInfo(level);
  const arrival = formatArrivalWib(manggaraiArrival(r, data.etaHoursToManggarai));
  return (
    <Page
      theme={siagaTheme}
      title={`SIAGA — Ciliwung flood status: ${info.code} at ${r.tmaCm} cm`}
      description={`Live flood status for the Ciliwung at Bendung Katulampa: ${info.code}, water at ${r.tmaCm} cm and rising. Water reaches Manggarai around ${arrival}.`}
      width={1120}
      lang="en"
      style={{ backgroundColor: C.page, gap: 0 }}
    >
      {/* ---- Top bar ---- */}
      <Section style={{ padding: [20, 0, 0, 0], gap: 0 }}>
        <Row style={{ gap: 16, alignItems: "center" }}>
          <Text style={{ fontSize: 22, fontWeight: 800, letterSpacing: 3, flex: 1 }}>SIAGA</Text>
          <Text style={{ fontSize: 13, color: token("colors.muted"), fontFamily: MONO_FONT }}>
            Reading {r.id}
          </Text>
          <Text style={{ fontSize: 13, color: token("colors.muted") }}>{r.recordedAtLabel}</Text>
        </Row>
        <Divider style={{ borderTop: { width: 1, style: "solid", color: token("colors.border") } }} />
      </Section>

      {/* ---- Hero: the level ---- */}
      <Section style={{ padding: [28, 0, 8, 0], gap: 24 }}>
        <Column
          style={{
            backgroundColor: info.color,
            borderRadius: 16,
            padding: 32,
            gap: 16,
          }}
        >
          <Row style={{ gap: 16, alignItems: "center" }}>
            <LevelBadge level={level} large />
            <Text style={{ color: "#FFFFFF", fontSize: 13, fontFamily: MONO_FONT }}>
              {r.gauge} · {r.river}
            </Text>
          </Row>
          <Heading level={1} style={{ color: "#FFFFFF" }}>
            {info.headline}
          </Heading>
          <Row style={{ gap: 32 }}>
            <Column style={{ gap: 2 }}>
              <Text style={{ fontSize: 12, color: "#FFFFFF", textTransform: "uppercase", letterSpacing: 1 }}>
                Water level
              </Text>
              <Text style={{ fontFamily: MONO_FONT, fontSize: 40, fontWeight: 800, color: "#FFFFFF" }}>
                {r.tmaCm} cm
              </Text>
              <Text style={{ fontSize: 13, fontWeight: 700, color: "#FFFFFF" }}>
                rising · +{r.rise10mCm} cm in 10 minutes
              </Text>
            </Column>
            <Column style={{ gap: 2 }}>
              <Text style={{ fontSize: 12, color: "#FFFFFF", textTransform: "uppercase", letterSpacing: 1 }}>
                Reaches Manggarai
              </Text>
              <Text style={{ fontFamily: MONO_FONT, fontSize: 40, fontWeight: 800, color: "#FFFFFF" }}>
                ~{data.etaHoursToManggarai} h
              </Text>
              <Text style={{ fontSize: 13, fontWeight: 700, color: "#FFFFFF" }}>
                around {arrival}
              </Text>
            </Column>
          </Row>
          <Text style={{ color: "#FFFFFF", fontSize: 15 }}>{info.meaning}</Text>
        </Column>

        {/* ---- Chart + what to do ---- */}
        <Grid columns={2} style={{ gap: 16 }}>
          <Column style={{ apply: ["card"] }}>
            <Heading level={2}>How the water rose</Heading>
            <Text style={{ color: token("colors.muted") }}>
              Eight gauge readings, 18:00–19:10 WIB — from 50 cm to {r.tmaCm} cm in 70 minutes.
              The bands are the Siaga thresholds: 80, 150 and 200 cm.
            </Text>
            <GaugeChart data={data} width={480} height={190} />
          </Column>
          <Column style={{ apply: ["card"] }}>
            <Heading level={2}>What to do now</Heading>
            <ActionsList data={data} />
          </Column>
        </Grid>

        {/* ---- The level scale ---- */}
        <Column style={{ apply: ["card"] }}>
          <Heading level={2}>The Siaga scale — where this reading sits</Heading>
          <Text style={{ color: token("colors.muted") }}>
            The level is computed from the water height by the official BNPB thresholds — change
            the reading and the level, the actions and the areas below all change with it.
          </Text>
          <Grid columns={4} style={{ gap: 12 }}>
            {([4, 3, 2, 1] as SiagaLevel[]).map((lv) => {
              const li = levelInfo(lv);
              const current = lv === level;
              return (
                <Column
                  key={lv}
                  style={{
                    backgroundColor: current ? li.tint : "#FFFFFF",
                    border: `2px solid ${current ? li.color : C.border}`,
                    borderRadius: 12,
                    padding: 16,
                    gap: 6,
                  }}
                >
                  <Text style={{ fontWeight: 800, color: li.dark, fontSize: 13 }}>
                    {li.code} {current ? "← NOW" : ""}
                  </Text>
                  <Text style={{ fontWeight: 700, fontSize: 14 }}>{li.name}</Text>
                  <Text style={{ fontSize: 12, color: token("colors.muted") }}>
                    {lv === 1 ? "≥ 200 cm" : lv === 2 ? "150–199 cm" : lv === 3 ? "80–149 cm" : "< 80 cm"}
                  </Text>
                  <Text style={{ fontSize: 13 }}>{li.meaning}</Text>
                </Column>
              );
            })}
          </Grid>
        </Column>

        {/* ---- Areas + shelters ---- */}
        <Grid columns={2} style={{ gap: 16 }}>
          <Column style={{ apply: ["card"] }}>
            <Heading level={2}>Areas affected</Heading>
            <AreasList data={data} />
          </Column>
          <Column style={{ apply: ["card"] }}>
            <Heading level={2}>Where to go</Heading>
            <ShelterTable data={data} />
            <Text style={{ fontSize: 13, fontWeight: 700 }}>
              Emergency: {data.hotlineLabel} — call {data.hotline}.
            </Text>
          </Column>
        </Grid>

        {/* ---- Routes ---- */}
        <Column style={{ apply: ["card"] }}>
          <Heading level={2}>Evacuation routes</Heading>
          <Text style={{ color: token("colors.muted") }}>
            One route per area, from the same data as the guide — the route on this page and the
            route in the printed PDF can never disagree.
          </Text>
          {data.routes.map((rt) => (
            <Row key={rt.code} style={{ gap: 12, alignItems: "center" }}>
              <Text
                style={{
                  fontWeight: 800,
                  fontSize: 13,
                  color: info.dark,
                  width: 64,
                }}
              >
                {rt.code}
              </Text>
              <Text style={{ flex: 1 }}>
                <Span style={{ fontWeight: 700 }}>{rt.from}</Span>
                {" → via "}
                {rt.via}
                {" → "}
                <Span style={{ fontWeight: 700 }}>{rt.to}</Span>
              </Text>
            </Row>
          ))}
        </Column>

        {/* ---- Proof strip ---- */}
        <Column style={{ apply: ["card"] }}>
          <Heading level={3}>One reading, one level</Heading>
          <ReadingProof data={data} />
        </Column>
      </Section>

      {/* ---- Footer ---- */}
      <Section style={{ padding: [24, 0, 32, 0], gap: 16 }}>
        <Text style={{ fontSize: 13, color: token("colors.muted"), textAlign: "center" }}>
          SIAGA flood alerts for the Ciliwung riverside · {data.source} · Emergency{" "}
          {data.hotline}
        </Text>
        <SampleNote />
      </Section>
    </Page>
  );
}

// Props for `npx hyper-elements check/render` (the template renders its
// sample data when no props are given).
export default Object.assign(StatusPage, { PreviewProps: {} });
