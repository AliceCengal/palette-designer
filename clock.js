const { useEffect, useState } = preactHooks;
const { h, Fragment } = preact;
// import { formatDistanceStrict } from "date-fns";

const CLOCK_GRID_S = {
  margin: '2rem',
  display: 'grid',
  gridTemplateColumns: '1fr auto 1fr',
  columnGap: '1rem',
}

const CLOCK_GRID_TITLE_S = {
  gridColumn: '1 / -1'
}

export function App() {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setTime(Math.floor(Date.now() / 1000));
    }, 1000);

    return () => {
      clearInterval(t);
    };
  }, []);

  const timeBase10 = time.toString();
  const timeBase16 = time.toString(16);
  const timeBase36 = time.toString(36);

  return (
    h('main', { className: 'main' },
      h('h1', null, "Funny Clock"),

      h('div', { style: CLOCK_GRID_S },
        h('h2', { style: CLOCK_GRID_TITLE_S },
          "Base 10"
        ),
        h('div', { style: CLOCK_GRID_TITLE_S },
          timeBase10
        ),
        ...(Array(timeBase10.length - 1)
          .fill(0)
          .map((i, ix) => (
            h(TimeRangeRow10, { base: time, ix: ix })
          ))
        )
      ),

      h('div', { style: CLOCK_GRID_S },
        h('h2', { style: CLOCK_GRID_TITLE_S },
          "Base 16"
        ),
        h('div', { style: CLOCK_GRID_TITLE_S },
          timeBase16
        ),
        ...(Array(timeBase16.length - 1)
          .fill(0)
          .map((i, ix) => (
            h(TimeRangeRow16, { base: timeBase16, ix: ix })
          ))
        )
      ),

      h('div', { style: CLOCK_GRID_S },
        h('h2', { style: CLOCK_GRID_TITLE_S },
          "Base 36"
        ),
        h('div', { style: CLOCK_GRID_TITLE_S },
          timeBase36
        ),
        ...(Array(timeBase36.length - 1)
          .fill(0)
          .map((i, ix) => (
            h(TimeRangeRow36, { base: timeBase36, ix: ix })
          ))
        )
      ),
    )
  );
}

function TimeRangeRow10({ base, ix }) {
  const t1 = Math.floor(base / Math.pow(10, ix + 1)) * Math.pow(10, ix + 1);
  const t2 =
    (Math.floor(base / Math.pow(10, ix + 1)) + 1) * Math.pow(10, ix + 1) - 1;

  const d1 = new Date(t1 * 1000);
  const d2 = new Date(t2 * 1000);

  return (
    h(Fragment, null,
      h('span', null, t1),
      h('span', null, ' - '),
      h('span', null, t2),

      h('span', null, d1.toISOString()),
      h('span', null, ' - '),
      h('span', null, d2.toISOString()),

      h('div', { style: { gridColumn: '1 / -1', marginBottom: '0.5rem' } },
        formatDistanceStrict(d1, d2)
      )
    )
  );
}

function TimeRangeRow16({ base, ix }) {
  const t1 =
    base.slice(0, -ix - 1) +
    Array(ix + 1)
      .fill("0")
      .join("");
  const t2 =
    base.slice(0, -ix - 1) +
    Array(ix + 1)
      .fill("f")
      .join("");

  const d1 = new Date(Number.parseInt(t1, 16) * 1000);
  const d2 = new Date(Number.parseInt(t2, 16) * 1000);

  return (
    h(Fragment, null,
      h('span', null, t1),
      h('span', null, ' - '),
      h('span', null, t2),

      h('span', null, d1.toISOString()),
      h('span', null, ' - '),
      h('span', null, d2.toISOString()),

      h('div', { style: { gridColumn: '1 / -1', marginBottom: '0.5rem' } },
        formatDistanceStrict(d1, d2)
      )
    )
  );
}

function TimeRangeRow36({ base, ix }) {
  const t1 =
    base.slice(0, -ix - 1) +
    Array(ix + 1)
      .fill("0")
      .join("");
  const t2 =
    base.slice(0, -ix - 1) +
    Array(ix + 1)
      .fill("z")
      .join("");

  const d1 = new Date(Number.parseInt(t1, 36) * 1000);
  const d2 = new Date(Number.parseInt(t2, 36) * 1000);

  return (
    h(Fragment, null,
      h('span', null, t1),
      h('span', null, ' - '),
      h('span', null, t2),

      h('span', null, d1.toISOString()),
      h('span', null, ' - '),
      h('span', null, d2.toISOString()),

      h('div', { style: { gridColumn: '1 / -1', marginBottom: '0.5rem' } },
        formatDistanceStrict(d1, d2)
      )
    )
  );
}

const relative_time_format_tower = [
  [1000, 'second'],
  [60 * 1000, 'minute'],
  [60 * 60 * 1000, 'hour'],
  [24 * 60 * 60 * 1000, 'day'],
  [14 * 24 * 60 * 60 * 1000, 'week'],
  [30 * 24 * 60 * 60 * 1000, 'month'],
  [365 * 24 * 60 * 60 * 1000, 'year'],
]

function formatDistanceStrict(d1, d2) {
  const rtf = new Intl.RelativeTimeFormat('en', {
    numeric: 'always',
  })

  const deltaTime = d2 - d1;
  let candidate = relative_time_format_tower[0];

  for (const [f, word] of relative_time_format_tower.slice(1)) {
    const g = Math.floor(deltaTime / f);
    if (g > 0.5) {
      candidate = [f, word]
    }
  }


  return rtf.format(deltaTime / candidate[0], candidate[1]);
}
