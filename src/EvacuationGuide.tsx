// ---------------------------------------------------------------------------
// SIAGA — Evacuation Guide (PDF)
// The printable guide for one gauge reading: what to do before leaving,
// what to bring, where to go, how to get there, what never to do. It is
// printed from the SAME reading as the email, the page and the card — the
// reading ID on this guide is the reading ID on all of them, so a printed
// guide can never disagree with the alert on someone's phone.
// ---------------------------------------------------------------------------

import {
  Column,
  Divider,
  Document,
  Heading,
  PageNumber,
  Row,
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
import {
  ActionsList,
  AreasList,
  GaugeBars,
  LevelBadge,
  ReadingProof,
  SampleNote,
  ShelterTable,
} from "./shared.js";
import { C, MONO_FONT, PRINT_FONT, PRINT_FONTS, siagaTheme } from "./theme.js";

export interface EvacuationGuideProps {
  data?: SiagaData;
}

/** One checklist row: a square box + the text. */
function CheckItem({ children }: { children: string }) {
  return (
    <Row style={{ gap: 10, alignItems: "start" }}>
      <Column
        style={{
          width: 15,
          height: 15,
          border: `2px solid ${C.ink}`,
          borderRadius: 3,
          flex: "none",
        }}
      />
      <Text style={{ flex: 1 }}>{children}</Text>
    </Row>
  );
}

function EvacuationGuide({ data = defaultData }: EvacuationGuideProps) {
  const r = data.reading;
  const level = levelFromTma(r.tmaCm);
  const info = levelInfo(level);
  const arrival = formatArrivalWib(manggaraiArrival(r, data.etaHoursToManggarai));
  return (
    <Document
      theme={siagaTheme}
      fonts={PRINT_FONTS}
      title={`SIAGA — Evacuation Guide (${info.code}, ${r.tmaCm} cm at Katulampa)`}
      size="A4"
      orientation="portrait"
      lang="en"
      style={{ fontFamily: PRINT_FONT, fontSize: 13 }}
    >
      {/* ================= Page 1: leave now ================= */}
      <Document.Page style={{ gap: 14 }}>
        <Column
          style={{ backgroundColor: info.color, borderRadius: 10, padding: 20, gap: 8 }}
        >
          <Row style={{ gap: 12, alignItems: "center" }}>
            <Text style={{ color: "#FFFFFF", fontSize: 22, fontWeight: 800, letterSpacing: 3 }}>
              SIAGA
            </Text>
            <LevelBadge level={level} />
          </Row>
          <Heading level={1} style={{ color: "#FFFFFF" }}>
            Evacuation guide — {info.name}
          </Heading>
          <Text style={{ color: "#FFFFFF", fontSize: 13 }}>
            {r.gauge}, {r.river} · {r.tmaCm} cm at {r.recordedAtLabel} · Reading {r.id}
          </Text>
        </Column>

        <Column style={{ gap: 8 }}>
          <Heading level={2}>Before you leave</Heading>
          <Text>{info.meaning}</Text>
          <ActionsList data={data} />
        </Column>

        <Column style={{ gap: 8 }}>
          <Heading level={2}>What to bring</Heading>
          <Column style={{ gap: 6 }}>
            <CheckItem>Identity documents, in a waterproof bag</CheckItem>
            <CheckItem>Medicine you take every day</CheckItem>
            <CheckItem>Drinking water and dry food for one day</CheckItem>
            <CheckItem>Phone, charger and power bank</CheckItem>
            <CheckItem>A change of clothes and a blanket</CheckItem>
            <CheckItem>Some cash — ATMs may be down</CheckItem>
          </Column>
        </Column>

        <Column style={{ gap: 8 }}>
          <Heading level={2}>Where to go</Heading>
          <ShelterTable data={data} />
          <Text style={{ fontSize: 13, fontWeight: 700 }}>
            Emergency: {data.hotlineLabel} — call {data.hotline}.
          </Text>
        </Column>

        <Divider style={{ borderTop: { width: 1, style: "solid", color: token("colors.border") } }} />
        <Text style={{ fontSize: 11, color: token("colors.muted"), textAlign: "center" }}>
          Page <PageNumber /> of <PageNumber total /> · Reading {r.id}
        </Text>
      </Document.Page>

      {/* ================= Page 2: routes, never-do, proof ================= */}
      <Document.Page style={{ gap: 6 }}>
        <Column style={{ gap: 8 }}>
          <Heading level={2}>Evacuation routes</Heading>
          <Text style={{ color: token("colors.muted") }}>
            One route per area — same data as the status page. Water reaches Manggarai around{" "}
            {arrival}.
          </Text>
          {data.routes.map((rt) => (
            <Row key={rt.code} style={{ gap: 12, alignItems: "center" }}>
              <Text style={{ fontWeight: 800, fontSize: 13, color: info.dark, width: 64 }}>
                {rt.code}
              </Text>
              <Text style={{ flex: 1 }}>
                {rt.from} → via {rt.via} → {rt.to}
              </Text>
            </Row>
          ))}
        </Column>

        <Column style={{ gap: 8 }}>
          <Heading level={2}>Areas affected</Heading>
          <AreasList data={data} />
        </Column>

        <Column style={{ gap: 8 }}>
          <Heading level={2}>How the water rose</Heading>
          <Text style={{ color: token("colors.muted") }}>
            Eight gauge readings, 18:00–19:10 WIB — from 50 cm to {r.tmaCm} cm in 70 minutes.
          </Text>
          <GaugeBars data={data} barMax={40} />
        </Column>

        <Column style={{ gap: 8 }}>
          <Heading level={2}>Never do this</Heading>
          <Column style={{ gap: 6 }}>
            <Text>× Never walk or drive through flood water — 30 cm can sweep you away.</Text>
            <Text>× Never touch electrical equipment while standing in water.</Text>
            <Text>× Never drink flood water, even if it looks clear.</Text>
            <Text>× Never return home until officials say it is safe.</Text>
          </Column>
        </Column>

        <Column style={{ gap: 8 }}>
          <Heading level={3}>One reading, one level</Heading>
          <ReadingProof data={data} />
          <Text style={{ fontSize: 12, fontFamily: MONO_FONT }}>
            If this guide disagrees with the alert on your phone, trust the newer reading ID.
          </Text>
        </Column>

        <Divider style={{ borderTop: { width: 1, style: "solid", color: token("colors.border") } }} />
        <SampleNote />
        <Text style={{ fontSize: 11, color: token("colors.muted"), textAlign: "center" }}>
          Page <PageNumber /> of <PageNumber total /> · Reading {r.id} · {data.source}
        </Text>
      </Document.Page>
    </Document>
  );
}

// Props for `npx hyper-elements check/render` (the template renders its
// sample data when no props are given).
export default Object.assign(EvacuationGuide, { PreviewProps: {} });
