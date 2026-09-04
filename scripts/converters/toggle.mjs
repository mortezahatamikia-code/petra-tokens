// Toggle Scheme Custom Helpers (Checkbox, Radio, Switch)

export function applyToggleColorRules(toggleBlocks) {
  toggleBlocks.set('[data-color-scheme="toggle"]', [
    ...(toggleBlocks.get('[data-color-scheme="toggle"]') || []),
    '  --p-border-color-hover: var(--p-primary-500, #3b82f6);',
    '  --p-ring-color-focus: var(--p-primary-200, #bfdbfe);',
    '  --p-checkbox-bg: var(--p-bg, #fff);',
    '  --p-checkbox-border-color: var(--p-colors-border-default, var(--p-neutral-300, #d1d5db));',
    '  --p-checkbox-border-color-hover: var(--p-primary-500, #3b82f6);',
    '  --p-checkbox-label-color: var(--p-text, var(--p-neutral-900, #111827));',
    '  --p-checkbox-tic-color: var(--p-toggle-indicator-color, #fff);',
    '  --p-checkbox-mixed-line-color: var(--p-toggle-indicator-color, #fff);',
    '  --p-checkbox-checked-bg: var(--p-primary-500, #3b82f6);',
    '  --p-checkbox-checked-border: var(--p-primary-500, #3b82f6);',
    '  --p-radio-bg: var(--p-bg, #fff);',
    '  --p-radio-border-color: var(--p-colors-border-default, var(--p-neutral-300, #d1d5db));',
    '  --p-radio-label-color: var(--p-text, var(--p-neutral-900, #111827));',
    '  --p-radio-dot-color: var(--p-primary-500, #3b82f6);',
    '  --p-radio-checked-border: var(--p-primary-500, #3b82f6);',
    '  --p-switch-track-bg: var(--p-bg, #e5e7eb);',
    '  --p-switch-bg-inner-bg: var(--p-bg, #e5e7eb);',
    '  --p-switch-indicator-bg: var(--p-toggle-indicator-color, #fff);',
  ]);
  toggleBlocks.set('[data-color-scheme="toggle"] [data-part="checkbox-box"]', ['  background-color: var(--p-checkbox-bg, #fff);', '  border-color: var(--p-checkbox-border-color, #d1d5db);']);
  toggleBlocks.set('[data-color-scheme="toggle"] [data-part="radio-box"]', ['  background-color: var(--p-radio-bg, #fff);', '  border-color: var(--p-radio-border-color, #d1d5db);']);
  toggleBlocks.set(':is([data-color-scheme="toggle"][data-state="checked"], [data-color-scheme="toggle"][aria-checked="true"]) [data-part="radio-box"]:is([data-variant="default"], :not([data-variant="hollow"]):not([data-variant="space"])), [data-color-scheme="toggle"] [data-part="radio-box"][data-state="checked"]:is([data-variant="default"], :not([data-variant="hollow"]):not([data-variant="space"]))', ['  background-color: var(--p-radio-dot-color, var(--p-primary-500, #3b82f6));', '  border-color: var(--p-radio-checked-border, var(--p-primary-500, #3b82f6));']);
  toggleBlocks.set(':is([data-color-scheme="toggle"][data-state="checked"], [data-color-scheme="toggle"][aria-checked="true"]) [data-part="radio-box"][data-variant="space"], [data-color-scheme="toggle"] [data-part="radio-box"][data-state="checked"][data-variant="space"]', ['  background-color: var(--p-radio-bg, #fff);', '  border-color: var(--p-radio-checked-border, var(--p-primary-500, #3b82f6));']);
  toggleBlocks.set(':is([data-color-scheme="toggle"][data-state="checked"], [data-color-scheme="toggle"][aria-checked="true"]) [data-part="radio-box"][data-variant="hollow"], [data-color-scheme="toggle"] [data-part="radio-box"][data-state="checked"][data-variant="hollow"]', ['  background-color: transparent;', '  border-width: 2px;', '  border-color: var(--p-radio-checked-border, var(--p-primary-500, #3b82f6));']);
  toggleBlocks.set('[data-color-scheme="toggle"] [data-part="checkbox-label"]', ['  color: var(--p-checkbox-label-color);']);
  toggleBlocks.set('[data-color-scheme="toggle"] [data-part="radio-label"]', ['  color: var(--p-radio-label-color);']);
  toggleBlocks.set('[data-color-scheme="toggle"] [data-part="checkbox-tic"]', ['  stroke: var(--p-checkbox-tic-color);']);
  toggleBlocks.set('[data-color-scheme="toggle"] [data-part="checkbox-mixed-line"]', ['  background-color: var(--p-checkbox-mixed-line-color);']);
  toggleBlocks.set('[data-color-scheme="toggle"] [data-part="radio-dot"]', ['  background-color: var(--p-radio-dot-color, var(--p-primary-500, #3b82f6));']);
  toggleBlocks.set(':is([data-color-scheme="toggle"][data-state="checked"], [data-color-scheme="toggle"][aria-checked="true"]) [data-part="radio-dot"]', ['  transform: translate(-50%, -50%) scale(1);', '  opacity: 1;']);
  toggleBlocks.set('[data-color-scheme="toggle"] [data-part="switch-track"]', ['  background-color: var(--p-switch-track-bg);']);
  toggleBlocks.set('[data-color-scheme="toggle"] [data-part="switch-bg-inner"]', ['  background-color: var(--p-switch-bg-inner-bg);']);
  toggleBlocks.set('[data-color-scheme="toggle"] [data-part="switch-indicator"]', ['  background-color: var(--p-switch-indicator-bg);']);
}

export function applyToggleSizeRules(toggleSizeBlocks) {
  // Sizing is driven by size tokens (--p-icon-size, size.json) and toggle.scss per-size rules
}
