var { useState, useMemo, useReducer } = preactHooks;
var h = preact.h;

export function App(props) {

  const [center, setCenter] = useState(180)
  const [angle, setAngle] = useState(30)
  const [hueNames, setNames] = useReducer(
    (s, a) => {
      const [which, name] = a
      return s.map((n, ix) => ix == which ? name : n)
    },
    ['left', 'center', 'right', 'back']
  )

  const huePalette = useMemo(() => [
    [hueNames[0], 360 - angle],
    [hueNames[1], 0],
    [hueNames[2], angle],
    [hueNames[3], 180]
  ], [hueNames, angle])

  const litPalette = [
    ['dark', 35],
    ['base', 50],
    ['lite', 75],
    ['hint', 95]
  ]

  function makePalette(center) {
    const theme = {}

    for (let [hue, hueval] of huePalette) {
      for (let [lit, litval] of litPalette) {
        theme["--c-" + hue + '-' + lit] = "hsl(" +
          ((center + hueval) % 360) + ", 50%, " +
          Math.floor(litAdjust(((center + hueval) % 360), litval)) + "%)"
          // litval + "%)"
      }
    }

    return theme
  }

  const palette = makePalette(center)

  return (
    h('main', null,
      h("div", null,
        h("div", { class: "wheel" },
          ...(
            Array(12).fill(0).map((i, ix) =>
              h("div", {
                style: "background-color: hsl(" + (ix * 30) + ", 50%, 50%)"
              }, "\u2800")
            )
          )
        ),
        h("div", { class: "wheel" },
          ...(
            Array(12).fill(0).map((i, ix) =>
              h("div", {
                style: "background-color: hsl(" + (ix * 30) + ", 50%, " +
                  litAdjust(ix * 30, 50).toFixed(2) + "%)"
              }, "\u2800")
            )
          )
        )),
      h('div', { class: "slider" },
        h("label", null, "Primary hue: " + center.toString()),
        h("input", {
          type: "range",
          value: center,
          onChange: e => setCenter(Number(e.target.value)),
          min: 0, max: 355, step: 5
        }),
        h("label", null, "Adjacent angle: " + angle.toString()),
        h("input", {
          type: "range",
          value: angle,
          onChange: e => setAngle(Number(e.target.value)),
          min: 5, max: 175, step: 5
        })),
      h('div', { class: "palette", style: palette },
        ...(
          litPalette.map(([lit, litval]) =>
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
  return f / ferret
}

function litAdjust(hue, lit) {
  if (lit > 90) { return 90 + 5 * lumAdjust(hue) }
  if (lit > 55) { return 50 + 25 * lumAdjust(hue) }
  if (lit > 40) { return 30 + 20 * lumAdjust(hue) }
  return 15 + 20 * lumAdjust(hue)
}

const copyright = [
  "site design and logo",
  h("br", null),
  "\xA9 Athran Zuhail 2022 all\xA0rights\xA0reserved"
]
