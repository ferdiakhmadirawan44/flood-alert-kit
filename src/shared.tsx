// ---------------------------------------------------------------------------
// Shared pieces of the SIAGA kit — used by all four outputs so the kit can
// never disagree with itself. Every piece reads the SAME `data` object and
// derives everything from the reading; nothing is re-typed per output.
// ---------------------------------------------------------------------------

import {
  Circle,
  Column,
  Divider,
  Line,
  List,
  ListItem,
  Path,
  Rect,
  Row,
  Svg,
  Table,
  TableCell,
  TableRow,
  Text,
  token,
} from "@hyper-elements/react";
import {
  affectedAreas,
  levelFromTma,
  levelInfo,
  type SiagaData,
  type SiagaLevel,
} from "./data.js";
import { C, MONO_FONT } from "./theme.js";

/** Coloured badge: "SIAGA 1" over "AWAS — DANGER". A white pill with a
 *  coloured border and dark text, so it stays visible on the level-coloured
 *  header band (a solid level-colour pill would vanish into the same red)
 *  and on white cards alike. Stacked, not side by side: DejaVu Bold is
 *  wider than it looks, and the side-by-side badge kept wrapping the name
 *  ("AWAS — DAN-GER") at every width tried. The fixed width only has to
 *  fit the longest single line, and the PDF and image renderers stretch a
 *  shrink-to-fit Row (classic Outlook also needs a known width). */
export function LevelBadge({ level, large }: { level: SiagaLevel; large?: boolean }) {
  const info = levelInfo(level);
  return (
    <Column
      style={{
        backgroundColor: "#FFFFFF",
        border: `2px solid ${info.color}`,
        borderRadius: 14,
        padding: large ? [12, 22] : [10, 18],
        gap: 2,
        alignItems: "center",
        justifyContent: "start",
        width: large ? 250 : 200,
      }}
    >
      <Text
        style={{
          color: info.dark,
          fontWeight: 800,
          fontSize: large ? 17 : 13,
          letterSpacing: 1,
          textAlign: "center",
        }}
      >
        {info.code}
      </Text>
      <Text
        style={{
          color: info.dark,
          fontSize: large ? 14 : 12,
          fontWeight: 700,
          textAlign: "center",
        }}
      >
        {info.name}
      </Text>
    </Column>
  );
}

/**
 * The proof strip — IDENTICAL text on the email, the page, the guide and
 * the card. If any output ever shows a different reading ID, the kit is
 * broken; that is the whole point of "one reading, one level".
 */
export function ReadingProof({ data, dark }: { data: SiagaData; dark?: boolean }) {
  const r = data.reading;
  const color = dark ? "#CBD5E1" : token("colors.muted");
  return (
    <Column style={{ gap: 4 }}>
      <Text style={{ fontSize: 12, color, fontFamily: MONO_FONT }}>
        Reading {r.id} · {r.gauge}, {r.river}
      </Text>
      <Text style={{ fontSize: 12, color }}>
        Recorded {r.recordedAtLabel} · Source: {data.source}
      </Text>
      <Text style={{ fontSize: 12, fontWeight: 700, color: dark ? "#FFFFFF" : C.ink }}>
        One reading, one level — this ID is identical on the email, the page,
        the guide and the card.
      </Text>
    </Column>
  );
}

/** Chronology as layout bars (Email + Document: no SVG needed). */
export function GaugeBars({ data, barMax = 110 }: { data: SiagaData; barMax?: number }) {
  const max = Math.max(...data.chronology.map((p) => p.tmaCm), 210);
  return (
    <Column style={{ gap: 10 }}>
      <Row style={{ gap: 6, alignItems: "end" }}>
        {data.chronology.map((p) => {
          const lv = levelFromTma(p.tmaCm);
          const info = levelInfo(lv);
          return (
            <Column key={p.time} style={{ flex: 1, gap: 4, alignItems: "center" }}>
              <Text
                style={{
                  fontFamily: MONO_FONT,
                  fontSize: 11,
                  fontWeight: 700,
                  color: info.dark,
                }}
              >
                {p.tmaCm}
              </Text>
              <Column
                style={{
                  width: "100%",
                  height: Math.max(8, Math.round((p.tmaCm / max) * barMax)),
                  backgroundColor: info.color,
                  borderRadius: 3,
                }}
              />
              <Text style={{ fontSize: 11, color: token("colors.muted"), fontFamily: MONO_FONT }}>
                {p.time}
              </Text>
            </Column>
          );
        })}
      </Row>
      <Row style={{ gap: 12 }}>
        {([1, 2, 3, 4] as SiagaLevel[]).map((lv) => {
          const info = levelInfo(lv);
          return (
            <Row key={lv} style={{ gap: 5, alignItems: "center" }}>
              <Column
                style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: info.color }}
              />
              <Text style={{ fontSize: 11, color: token("colors.muted") }}>
                {info.code} {lv === 1 ? "≥200" : lv === 2 ? "150–199" : lv === 3 ? "80–149" : "<80"} cm
              </Text>
            </Row>
          );
        })}
      </Row>
    </Column>
  );
}

/**
 * Chronology as an SVG chart (Page + Canvas): level bands behind the bars,
 * threshold lines at 80 / 150 / 200 cm, one bar per reading coloured by the
 * level that reading reached. Time labels sit in a flex row underneath so
 * they line up with the evenly-spaced bars.
 */
export function GaugeChart({
  data,
  width = 560,
  height = 210,
}: {
  data: SiagaData;
  width?: number;
  height?: number;
}) {
  const padTop = 8;
  const padBottom = 8;
  const plotH = height - padTop - padBottom;
  const maxTma = 260; // headroom above the 210 cm peak
  const y = (tma: number) => padTop + plotH - (tma / maxTma) * plotH;
  const n = data.chronology.length;
  const slot = width / n;
  const barW = Math.min(34, slot * 0.52);
  // Level bands: [fromTma, toTma, tint]
  const bands: Array<[number, number, string]> = [
    [200, 260, levelInfo(1).tint],
    [150, 200, levelInfo(2).tint],
    [80, 150, levelInfo(3).tint],
    [0, 80, levelInfo(4).tint],
  ];
  const line = data.chronology
    .map((p, i) => `${i === 0 ? "M" : "L"}${(i * slot + slot / 2).toFixed(1)},${y(p.tmaCm).toFixed(1)}`)
    .join(" ");
  return (
    <Column style={{ gap: 6 }}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} title="Water level at Bendung Katulampa, 18:00–19:10 WIB">
        {bands.map(([from, to, tint]) => (
          <Rect
            key={from}
            x={0}
            y={y(to)}
            width={width}
            height={Math.max(0, y(from) - y(to))}
            style={{ fill: tint }}
          />
        ))}
        {[80, 150, 200].map((t) => (
          <Line
            key={t}
            x1={0}
            y1={y(t)}
            x2={width}
            y2={y(t)}
            style={{ stroke: "#94A3B8", strokeWidth: 1 }}
          />
        ))}
        {data.chronology.map((p, i) => {
          const info = levelInfo(levelFromTma(p.tmaCm));
          const x = i * slot + (slot - barW) / 2;
          return (
            <Rect
              key={p.time}
              x={x}
              y={y(p.tmaCm)}
              width={barW}
              height={Math.max(2, padTop + plotH - y(p.tmaCm))}
              rx={2}
              style={{ fill: info.color }}
            />
          );
        })}
        <Path d={line} style={{ fill: "rgba(0,0,0,0)", stroke: "#0F172A", strokeWidth: 2 }} />
        {data.chronology.map((p, i) => (
          <Circle
            key={p.time}
            cx={i * slot + slot / 2}
            cy={y(p.tmaCm)}
            r={4}
            style={{ fill: "#0F172A", stroke: "#FFFFFF", strokeWidth: 2 }}
          />
        ))}
      </Svg>
      <Row style={{ gap: 0 }}>
        {data.chronology.map((p) => (
          <Text
            key={p.time}
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: 11,
              fontFamily: MONO_FONT,
              color: token("colors.muted"),
            }}
          >
            {p.time}
          </Text>
        ))}
      </Row>
    </Column>
  );
}

/** The level's action list — numbered, in order, from the level data. */
export function ActionsList({ data }: { data: SiagaData }) {
  const info = levelInfo(levelFromTma(data.reading.tmaCm));
  return (
    <List type="number">
      {info.actions.map((a) => (
        <ListItem key={a}>{a}</ListItem>
      ))}
    </List>
  );
}

/** Shelters as a table (Email / Page / Document). */
export function ShelterTable({ data }: { data: SiagaData }) {
  return (
    <Table
      style={{
        cellPadding: [10, 8],
        rowBorder: { width: 1, style: "solid", color: C.border },
      }}
    >
      <TableRow header>
        <TableCell>Shelter</TableCell>
        <TableCell>Where</TableCell>
        <TableCell style={{ textAlign: "right", width: 96 }}>Capacity</TableCell>
      </TableRow>
      {data.shelters.map((s, i) => (
        <TableRow key={s.name} style={i % 2 === 1 ? { backgroundColor: C.zebra } : undefined}>
          <TableCell style={{ fontWeight: 700 }}>{s.name}</TableCell>
          <TableCell>{s.area}</TableCell>
          <TableCell style={{ textAlign: "right", fontFamily: MONO_FONT }}>{s.capacity}</TableCell>
        </TableRow>
      ))}
    </Table>
  );
}

/** Areas affected at the current level — derived by the data module. */
export function AreasList({ data }: { data: SiagaData }) {
  const areas = affectedAreas(data);
  return (
    <Column style={{ gap: 8 }}>
      {areas.map((a) => (
        <Row key={a.name} style={{ gap: 10, alignItems: "start", justifyContent: "start" }}>
          {/* A drawn dot, not a "●" character: the PDF renderer measures
              the glyph far wider than it draws, which pushed the text
              column to the right half of the page. */}
          <Column
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: levelInfo(levelFromTma(data.reading.tmaCm)).dark,
              flex: "none",
            }}
          />
          <Column style={{ gap: 2, flex: 1 }}>
            <Text style={{ fontWeight: 700 }}>{a.name}</Text>
            <Text style={{ fontSize: 13, color: token("colors.muted") }}>{a.detail}</Text>
          </Column>
        </Row>
      ))}
      <Text style={{ fontSize: 12, color: token("colors.muted") }}>
        {areas.length} of {data.areas.length} monitored areas affected at this level — computed
        from the reading.
      </Text>
    </Column>
  );
}

/** Small divider + "sample scenario" note used at the foot of every output. */
export function SampleNote() {
  return (
    <Column style={{ gap: 8 }}>
      <Divider style={{ borderTop: { width: 1, style: "solid", color: "#CBD5E1" } }} />
      <Text style={{ fontSize: 12, color: token("colors.muted"), textAlign: "center" }}>
        SAMPLE SCENARIO — the real flood of 15 Nov 2015. Not a live alert. Shelters and routes
        are illustrative; thresholds and the 9-hour travel time are real (BNPB).
      </Text>
    </Column>
  );
}
