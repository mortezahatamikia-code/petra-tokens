// Toggle Scheme Custom Helpers (Checkbox, Radio, Switch)

export function applyToggleColorRules(toggleBlocks) {
  toggleBlocks.set('[data-color-scheme="toggle"]', [
    ...(toggleBlocks.get('[data-color-scheme="toggle"]') || []),
    '  --p-border-color-hover: var(--p-colors-primary-default);',
    '  --p-ring-color-focus: var(--p-colors-primary-muted);',
    '  --p-checkbox-bg: var(--p-bg);',
    '  --p-checkbox-border-color: var(--p-border-color);',
    '  --p-checkbox-label-color: var(--p-text);',
    '  --p-checkbox-tic-color: var(--p-toggle-indicator-color);',
    '  --p-checkbox-mixed-line-color: var(--p-toggle-indicator-color);',
    '  --p-radio-bg: var(--p-bg);',
    '  --p-radio-border-color: var(--p-border-color);',
    '  --p-radio-label-color: var(--p-text);',
    '  --p-radio-dot-color: var(--p-toggle-indicator-color);',
    '  --p-switch-track-bg: var(--p-bg);',
    '  --p-switch-bg-inner-bg: var(--p-bg);',
    '  --p-switch-indicator-bg: var(--p-toggle-indicator-color);',
  ]);
  toggleBlocks.set('[data-color-scheme="toggle"] [data-part="checkbox-box"]', ['  background-color: var(--p-checkbox-bg);', '  border-color: var(--p-checkbox-border-color);']);
  toggleBlocks.set('[data-color-scheme="toggle"] [data-part="radio-box"]', ['  background-color: var(--p-radio-bg);', '  border-color: var(--p-radio-border-color);']);
  toggleBlocks.set('[data-color-scheme="toggle"] [data-part="checkbox-label"]', ['  color: var(--p-checkbox-label-color);']);
  toggleBlocks.set('[data-color-scheme="toggle"] [data-part="radio-label"]', ['  color: var(--p-radio-label-color);']);
  toggleBlocks.set('[data-color-scheme="toggle"] [data-part="checkbox-tic"]', ['  stroke: var(--p-checkbox-tic-color);']);
  toggleBlocks.set('[data-color-scheme="toggle"] [data-part="checkbox-mixed-line"]', ['  background-color: var(--p-checkbox-mixed-line-color);']);
  toggleBlocks.set('[data-color-scheme="toggle"] [data-part="radio-dot"]', ['  background-color: var(--p-radio-dot-color);']);
  toggleBlocks.set('[data-color-scheme="toggle"] [data-part="switch-track"]', ['  background-color: var(--p-switch-track-bg);']);
  toggleBlocks.set('[data-color-scheme="toggle"] [data-part="switch-bg-inner"]', ['  background-color: var(--p-switch-bg-inner-bg);']);
  toggleBlocks.set('[data-color-scheme="toggle"] [data-part="switch-indicator"]', ['  background-color: var(--p-switch-indicator-bg);']);
}

export function applyToggleSizeRules(toggleSizeBlocks) {
  toggleSizeBlocks.set('[data-size-scheme="toggle"]', [
    ...(toggleSizeBlocks.get('[data-size-scheme="toggle"]') || []),
    '  --psz-sub: calc((var(--p-size, 2.5rem) / 2) - 0.25rem);',
    '  --p-toggle-gap: 0.5rem;',
    '  --p-checkbox-width: var(--psz-sub);',
    '  --p-checkbox-height: var(--psz-sub);',
    '  --p-radio-width: var(--psz-sub);',
    '  --p-radio-height: var(--psz-sub);',
    '  --p-switch-track-width: var(--p-size, 2.5rem);',
    '  --p-switch-track-height: calc(var(--psz-sub) + var(--p-padding-y, 0.625rem));',
    '  --p-switch-indicator-width: var(--psz-sub);',
    '  --p-switch-indicator-height: var(--psz-sub);',
    '  --p-switch-indicator-transform: translateX(0);',
    '  --p-switch-indicator-transform-checked: translateX(calc(var(--p-direction-sign, 1) * (100% - var(--psz-sub))));',
  ]);
  toggleSizeBlocks.set('[data-size-scheme="toggle"] [data-part="switch-indicator-wrapper"]', ['  transform: var(--p-switch-indicator-transform);']);
  toggleSizeBlocks.set('[data-size-scheme="toggle"] [data-part="checkbox-box"], [data-size-scheme="toggle"] [data-part="radio-box"]', ['  width: var(--p-checkbox-width);', '  height: var(--p-checkbox-height);', '  min-width: 0;']);
  toggleSizeBlocks.set('[data-size-scheme="toggle"] [data-part="switch-track"]', ['  min-width: var(--p-switch-track-width);', '  min-height: var(--p-switch-track-height);']);
  toggleSizeBlocks.set('[data-size-scheme="toggle"] [data-part="switch-indicator"]', ['  width: var(--p-switch-indicator-width);', '  height: var(--p-switch-indicator-height);']);
  toggleSizeBlocks.set(':is([data-size-scheme="toggle"][data-state="checked"], [data-size-scheme="toggle"] [data-state="checked"]) [data-part="switch-indicator-wrapper"]', ['  transform: var(--p-switch-indicator-transform-checked);']);

}
