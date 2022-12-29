var { useState, useMemo, useReducer } = preactHooks;
var h = preact.h;

export function App() {

  const [center, setCenter] = useState(180)
  const [saturation, setSaturation] = useState(50)
  const [angle, setAngle] = useState(30)
  const [hueNames, setNames] = useReducer(
    switchReducer,
    ['left', 'center', 'right', 'back']
  )

  const huePalette = useMemo(() => [
    [hueNames[0], 360 - angle],
    [hueNames[1], 0],
    [hueNames[2], angle],
    [hueNames[3], 180]
  ], [hueNames, angle])

  const mode = window.location.search

  const palette = useMemo(() => {
    const theme = {}

    for (const [hue, hueval] of huePalette) {
      for (const [lit, litval] of (mode ? litPalette2 : litPalette)) {
        let sat = (mode ? (litval - 50) * 2 : saturation)
        theme["--c-" + hue + '-' + lit] = "hsl(" +
          ((center + hueval) % 360) + ", " + sat + "%, " +
          Math.floor(litAdjust(((center + hueval) % 360), litval)) + "%)"
        // litval + "%)"
      }
    }

    return theme
  }, [huePalette, center, saturation])

  return (
    h('main', null,
      h("div", null,
        h("div", { class: "wheel" },
          ...(
            Array(12).fill(0).map((i, ix) =>
              h("div", {
                style: "background-color: hsl(" + (ix * 30 + 15) + ", " + saturation + "%, 50%)"
              }, "\u2800")
            )
          )
        ),
        h("div", { class: "wheel" },
          ...(
            Array(12).fill(0).map((i, ix) =>
              h("div", {
                style: "background-color: hsl(" + (ix * 30 + 15) + ", " + saturation + "%, " +
                  litAdjust(ix * 30, 50).toFixed(2) + "%)"
              }, "\u2800")
            )
          )
        )),
      h('div', { class: "slider" },
        h("label", null, "Primary hue: " + center.toString() + "\u00b0"),
        h("input", {
          type: "range",
          value: center,
          onChange: e => setCenter(Number(e.target.value)),
          min: 0, max: 355, step: 5
        }),
        !mode && h("label", null, "Saturation: " + saturation.toString() + "%"),
        !mode && h("input", {
          type: "range",
          value: saturation,
          onChange: e => setSaturation(Number(e.target.value)),
          min: 0, max: 100, step: 2
        }),
        h("label", null, "Adjacent angle: " + angle.toString() + "\u00b0"),
        h("input", {
          type: "range",
          value: angle,
          onChange: e => setAngle(Number(e.target.value)),
          min: 5, max: 175, step: 5
        })),
      h('div', { class: (mode ? "palette2" : "palette"), style: palette },
        ...(
          (mode ? litPalette2 : litPalette).map(([lit, litval]) =>
            huePalette.flatMap(([hue, hueval]) =>
              h('div', {
                id: hue + '-' + lit,
                style: 'background-color:var(--c-' + hue + '-' + lit + ")"
              }, hue + '-' + lit)
            )
          )
        )
      ),
      h("div", { class: "setting" },
        ...(
          hueNames.map((hue, ix) =>
            h('input', {
              type: "text",
              value: hueNames[ix],
              onChange: e => setNames([ix, e.target.value]),
              size: 1
            })
          )
        )
      ),
      h('div', { class: "output" },
        ...(
          Object.entries(palette).flatMap(p =>
            [h("span", null, p.join(":") + ";"), h("br")]
          )
        )
      ),
      h("div", null, ...copyright)
    )
  )
}

const litPalette = [
  ['dark', 35],
  ['base', 50],
  ['lite', 75],
  ['hint', 95]
]

const litPalette2 = Array(9).fill(1).map((i, ix) =>
  [(ix + 1).toString(), 55 + ix * 5]
)

function switchReducer(s, a) {
  const [which, name] = a
  return s.map((n, ix) => ix == which ? name : n)
}

function lumAdjust(hue) {
  // MAGIC NUMBERS
  const a = 0.57;
  const c = 28.5;
  const d = 40.5;
  const f = 69.0;

  const sine360 = Math.sin(Math.PI * hue / 180) + 1
  const cos120 = -Math.cos(Math.PI * hue / 60) + 1

  const chipmunk = a * sine360 + (1 - a) * cos120
  const ferret = c * chipmunk + d
  return (-f / ferret) + 1
}

function litAdjust(hue, lit) {
  const f = lumAdjust(hue)
  return f * lit * lit / 100 + (1 - f) * lit
}

const copyright = [
  h("a", { href: "https://github.com/AliceCengal/palette-designer" }, "Github"),
  h("br"),
  "site design and logo",
  h("br"),
  "\xA9 Athran Zuhail 2022 all\xA0rights\xA0reserved"
]
