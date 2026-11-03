/**
 * dsh-sidebar-collapse — Client half.
 *
 * The Harness sidebar stacks four regions in one fixed-height column:
 *
 *   [ brand ][ New Session ][ global plugin buttons ][ workspace list ][ footer ]
 *
 * The plugin button strip (`sidebar.panellist`) is `flex: none` and takes one
 * 36px row per registered panel, directly out of the workspace/session list.
 * This module adds a single fold control that hides the whole strip and gives
 * the column back to the workspace list; the choice is remembered in
 * localStorage. It hides no plugin registration and replaces nothing.
 *
 * Where the control lives
 * -----------------------
 * DSH exposes no slot inside the workspace header row, so the control is parked
 * there with CSS anchor positioning: the header's search area is the anchor and
 * the button sits immediately to its left, in the header's own button cluster.
 *
 * The control is rendered from `sidebar.footer.action` — the footer is a real
 * seat inside the sidebar column, and the column root becomes its containing
 * block — because an anchor reference only resolves when the anchor element is
 * inside the positioned element's containing block. (Rendering it from the
 * frame-wide `shell.overlay` layer, whose containing block is the overlay
 * itself, leaves the anchor unresolvable.)
 *
 * A measured fallback covers engines where the anchor still does not resolve:
 * when the computed offsets come back `auto`, the control measures the anchor
 * with `getBoundingClientRect()` and pins itself with inline fixed offsets
 * instead. Whichever path runs, the button is the same element.
 */

window.__ModuleLoader__.load({
  id: 'dsh-sidebar-collapse',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const NS = 'sidebar-collapse';
    const STORAGE_KEY = 'dsh-sidebar-collapse:collapsed';
    const TOGGLE_ID = 'sidebar-collapse-toggle';
    /** Panel buttons below this count are not worth folding. */
    const FOLD_THRESHOLD = 5;
    /** The workspace header's search area: the anchor for the floating button. */
    const ANCHOR_SELECTOR = '[data-slot="sidebar.workspaces"] [class*="_searchSlot"]';
    /** Glyph width; the button is placed one gutter left of the anchor. */
    const BUTTON_SIZE = 28;
    const GUTTER = 4;

    /** Text used until (or if) the locale service supplies a dictionary. */
    const FALLBACK = {
      'label': '插件按钮收纳',
      'toggle.collapse': '收起插件按钮',
      'toggle.expand': '展开插件按钮',
    };

    function readCollapsed() {
      try {
        return window.localStorage.getItem(STORAGE_KEY) === '1';
      } catch {
        return false;
      }
    }

    function writeCollapsed(collapsed) {
      try {
        window.localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0');
      } catch {
        /* storage unavailable (private mode): state stays in memory */
      }
    }

    /**
     * The whole visual effect.
     *
     * - `[data-slot="sidebar"] > div` is the sidebar column root; making it
     *   positioned gives the control a containing block that contains the
     *   header anchor.
     * - The fold hides every child of the panel strip; in the collapsed rail it
     *   is skipped, because there the strip is the rail's only navigation.
     * - The `@supports` guard keeps the button hidden on an engine without
     *   anchor positioning (the measured fallback then takes over).
     */
    const STYLES = `
[data-dsh-sidebar-collapse]{display:none;position:absolute;align-items:center;justify-content:center;width:${BUTTON_SIZE}px;height:${BUTTON_SIZE}px;padding:0;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;line-height:1;transition:background-color .12s ease,color .12s ease}
[data-dsh-sidebar-collapse]:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}
[data-dsh-sidebar-collapse]:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}
[data-dsh-sidebar-collapse]>svg{display:block;transition:transform .12s ease}
html:has([data-dsh-sidebar-collapse][aria-expanded="false"]):not(:has([data-slot="sidebar"] [class*="_collapsed"])) nav[class*="_panelList"]>*{display:none}
html:has([data-dsh-sidebar-collapse][aria-expanded="false"]):not(:has([data-slot="sidebar"] [class*="_collapsed"])) [data-slot="sidebar"] nav>*{display:none}
[data-slot="sidebar.workspaces"] [class*="_searchSlot"]{anchor-name:--dsh-ws-search}
[data-dsh-sidebar-collapse]{position-anchor:--dsh-ws-search;left:calc(anchor(--dsh-ws-search left) - ${BUTTON_SIZE + GUTTER}px);top:anchor(--dsh-ws-search top)}
html:has(nav[class*="_panelList"]>button:nth-child(${FOLD_THRESHOLD}):not([aria-haspopup="menu"])):has([data-slot="sidebar.workspaces"] [class*="_searchSlot"]):not(:has([class*="_searchSlotExpanded"])) [data-dsh-sidebar-collapse]{display:inline-flex}
html:has([data-dsh-sidebar-collapse][aria-expanded="false"]):has([data-slot="sidebar.workspaces"] [class*="_searchSlot"]) [data-dsh-sidebar-collapse]{display:inline-flex}
`;

    /**
     * Measured fallback: only acts when the anchor reference did not resolve,
     * detected as `left`/`top` computing to `auto` while no inline offset is
     * set. Positions the same element against the anchor's viewport rect.
     */
    function useMeasuredPlacement(ref, folded) {
      React.useEffect(() => {
        const element = ref.current;
        if (element === null || element === undefined) return undefined;

        let frame = 0;
        const timers = [];
        let observer = null;

        const clearInline = () => {
          element.style.position = '';
          element.style.left = '';
          element.style.top = '';
          element.removeAttribute('data-dsh-collapse-measured');
        };

        const place = () => {
          if (element.getClientRects().length === 0) return; // hidden by CSS
          const computed = window.getComputedStyle(element);
          const resolvedBysCss =
            element.style.position === '' &&
            computed.left !== 'auto' &&
            computed.top !== 'auto';
          if (resolvedBysCss) {
            if (element.style.position !== '') clearInline();
            return;
          }
          const anchor = document.querySelector(ANCHOR_SELECTOR);
          if (anchor === null) return;
          const rect = anchor.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return;
          element.style.position = 'fixed';
          element.style.left = `${Math.round(rect.left) - BUTTON_SIZE - GUTTER}px`;
          element.style.top = `${Math.round(rect.top)}px`;
          element.setAttribute('data-dsh-collapse-measured', '');
        };

        const schedule = () => {
          if (frame !== 0) return;
          frame = window.requestAnimationFrame(() => {
            frame = 0;
            try {
              place();
            } catch {
              /* a layout race must never break the sidebar */
            }
          });
        };

        schedule();
        // Initial layout can settle after the first frame; retry twice.
        timers.push(window.setTimeout(schedule, 120));
        timers.push(window.setTimeout(schedule, 400));

        if (typeof ResizeObserver === 'function') {
          observer = new ResizeObserver(schedule);
          const anchor = document.querySelector(ANCHOR_SELECTOR);
          if (anchor !== null) observer.observe(anchor);
          const column = document.querySelector('[data-slot="sidebar"] > div');
          if (column !== null) observer.observe(column);
        }
        window.addEventListener('resize', schedule);

        return () => {
          if (frame !== 0) window.cancelAnimationFrame(frame);
          for (const timer of timers) window.clearTimeout(timer);
          window.removeEventListener('resize', schedule);
          if (observer !== null) observer.disconnect();
        };
      }, [ref, folded]);
    }

    /** Chevron: points up while the strip is open (fold), down when folded. */
    function Chevron({ folded }) {
      return h(
        'svg',
        {
          viewBox: '0 0 16 16',
          width: 15,
          height: 15,
          'aria-hidden': true,
          style: { transform: folded ? 'rotate(180deg)' : 'none' },
        },
        h('path', {
          d: 'M4 10 8 6l4 4',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.7,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }),
      );
    }

    function SidebarDensityToggle(props) {
      const [folded, setFolded] = React.useState(readCollapsed);
      const ref = React.useRef(null);
      useMeasuredPlacement(ref, folded);

      const translate = typeof props.t === 'function' ? props.t : null;
      const text = (key) => {
        if (translate === null) return FALLBACK[key];
        try {
          const value = translate(key);
          return typeof value === 'string' && value !== '' ? value : FALLBACK[key];
        } catch {
          return FALLBACK[key];
        }
      };
      const label = folded ? text('toggle.expand') : text('toggle.collapse');

      const onClick = React.useCallback((event) => {
        event.preventDefault();
        setFolded((previous) => {
          const next = !previous;
          writeCollapsed(next);
          return next;
        });
      }, []);

      return h(
        React.Fragment,
        null,
        h('style', null, STYLES),
        h(
          'button',
          {
            type: 'button',
            ref,
            'data-dsh-sidebar-collapse': 'toggle',
            'aria-expanded': folded ? 'false' : 'true',
            'aria-label': label,
            title: label,
            onClick,
          },
          h(Chevron, { folded }),
        ),
      );
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        /** Translate through the locale service once it is available. */
        let translate = (key) => FALLBACK[key];
        let localeReady = false;

        // Locale is optional: without it the component falls back to Chinese.
        ctx.inject(['locale'], (localeCtx) => {
          localeCtx.effect(
            () =>
              localeCtx.locale.register(NS, {
                zh: {
                  'label': '插件按钮收纳',
                  'toggle.collapse': '收起插件按钮',
                  'toggle.expand': '展开插件按钮',
                },
                en: {
                  'label': 'Plugin buttons',
                  'toggle.collapse': 'Collapse plugin buttons',
                  'toggle.expand': 'Expand plugin buttons',
                },
              }),
            'sidebar-collapse: dictionaries',
          );
          try {
            const bound = localeCtx.locale.bind(NS);
            translate = (key) => {
              try {
                const value = bound(key);
                return typeof value === 'string' && value !== '' ? value : FALLBACK[key];
              } catch {
                return FALLBACK[key];
              }
            };
            localeReady = true;
          } catch {
            translate = (key) => FALLBACK[key];
            localeReady = false;
          }
          localeCtx.effect(() => () => {
            translate = (key) => FALLBACK[key];
            localeReady = false;
          }, 'sidebar-collapse: locale detach');
        });

        // Inside the sidebar column, so the header anchor is inside the
        // control's containing block and the reference resolves.
        ctx.slots.inject('sidebar.footer.action', () => {
          const options = {
            name: 'sidebar.footer.action',
            id: TOGGLE_ID,
            order: 0,
            label: () => translate('label'),
          };
          // Only advertise a namespace the renderer can actually resolve.
          if (localeReady) options.locale = NS;
          return ctx.slots.register(options, SidebarDensityToggle);
        });
      },
    };
  },
});
