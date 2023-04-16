const { useMemo, useReducer } = preactHooks;
const h = preact.h;

const STATE = {
  center: 180,
  saturation: 50,
  hueName_0: 'base',
  hueName_1: 'gray',
  hueName_2: 'good',
  hueName_3: 'warn',
  hueName_4: 'evil',
  f_adjust_0: 0,
  f_adjust_1: 0,
  f_adjust_2: 0,
  f_adjust_3: 0,
  f_adjust_4: 0,
}

export function App() {

  const [state, dispatch] = useReducer(
    switchReducer,
    STATE
  )

  const { center, saturation } = state

  const hueNames = [
    state.hueName_0,
    state.hueName_1,
    state.hueName_2,
    state.hueName_3,
    state.hueName_4,
  ]

  const huePalette = useMemo(() => [
    [hueNames[0], center],
    [hueNames[1], center],
    [hueNames[2], 120],
    [hueNames[3], 45],
    [hueNames[4], 0]
  ], [hueNames, center])

  const palette = useMemo(() => {
    const theme = {}
    let hue_ix = 0
    for (const [hue, hueval] of huePalette) {
      for (const [lit, litval] of litPalette2) {
        theme["--c-" + hue + '-' + lit] = "hsl(" +
          hueval + ", " +
          (hue === hueNames[1] ? 5 : saturation) + "%, " +
          (hue === hueNames[1] ?
            Math.floor(litval * 100) :
            Math.floor(100 * litAdjust(hueval % 360, litval, state['f_adjust_' + hue_ix]))) + "%)"
      }
      hue_ix += 1
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
                  (litAdjust(ix * 30, 0.5) * 100).toFixed(2) + "%)"
              }, "\u2800")
            )
          )
        )),
      h('div', { class: "slider" },
        h("label", null, "Primary hue: " + center.toString() + "\u00b0"),
        h("input", {
          type: "range",
          value: center,
          onChange: e => dispatch(['center', Number(e.target.value)]),
          min: 0, max: 355, step: 5
        }),
        h("label", null, "Saturation: " + saturation.toString() + "%"),
        h("input", {
          type: "range",
          value: saturation,
          onChange: e => dispatch(['saturation', Number(e.target.value)]),
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
      h("div", { class: "palette2" },
        ...(
          hueNames.map((hue, ix) =>
            h('input', {
              type: "number",
              value: state['f_adjust_' + ix],
              onChange: e => dispatch(['f_adjust_' + ix, Number(e.target.value)]),
              min: -1,
              max: 1,
              step: 0.1,
              size: 1
            })
          )
        )
      ),
      h("div", { class: "palette2" },
        ...(
          hueNames.map((hue, ix) =>
            h('input', {
              type: "text",
              value: hueNames[ix],
              onChange: e => dispatch(['hueName_' + ix, e.target.value]),
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
  [(ix + 1).toString(), 0.31 + ix * 0.08]
)

function switchReducer(s, a) {
  const [which, value] = a
  return {
    ...s,
    [which]: value
  }
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
  return (f / ferret) - 1
}

function litAdjust(hue, lit, f_adjust = 0) {
  const f = lumAdjust(hue)
  return clamp(f * Math.pow(2, f_adjust)) * lit * (1 - lit) + lit
}

function clamp(n, min, max) {
  return n > max ? max : n < min ? min : n
}

const copyright = [
  h("a", { href: "https://github.com/AliceCengal/palette-designer" }, "Github"),
  h("br"),
  "site design and logo",
  h("br"),
  "\xA9 Athran Zuhail 2022 all\xA0rights\xA0reserved"
]
