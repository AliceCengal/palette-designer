const { useState, useMemo, useReducer } = preactHooks;
const h = preact.h;

export function App() {

  const [center, setCenter] = useState(180)
  const [saturation, setSaturation] = useState(50)
  const [angle, setAngle] = useState(30)
  const [hueNames, setNames] = useReducer(
    switchReducer,
    ['base', 'neut', 'good', 'warn', 'evil']
  )

  const huePalette = useMemo(() => [
    [hueNames[0], center],
    [hueNames[1], center],
    [hueNames[2], 120],
    [hueNames[3], 45],
    [hueNames[4], 0]
  ], [hueNames, center])

  const palette = useMemo(() => {
    const theme = {}

    for (const [hue, hueval] of huePalette) {
      for (const [lit, litval] of litPalette2) {
        theme["--c-" + hue + '-' + lit] = "hsl(" +
          hueval + ", " +
          (hue === 'neut' ? 5 : saturation) + "%, " +
          (hue === 'neut' ? litval : Math.floor(litAdjust(((hueval) % 360), litval))) + "%)"
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
        h("label", null, "Saturation: " + saturation.toString() + "%"),
        h("input", {
          type: "range",
          value: saturation,
          onChange: e => setSaturation(Number(e.target.value)),
          min: 0, max: 100, step: 2
        })),
      h('div', { class: "palette2", style: palette },
        ...(
          litPalette2.map(([lit, litval]) =>
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

const litPalette2 = Array(9).fill(1).map((i, ix) =>
  [(ix + 1).toString(), 31 + ix * 8]
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
