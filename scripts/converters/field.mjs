// Field Scheme Custom Helpers (Input, Textarea, Field wrapper)

export function applyFieldColorRules(fieldBlocks) {
  fieldBlocks.set('[data-color-scheme="field"]', [
    ...(fieldBlocks.get('[data-color-scheme="field"]') || []),
    '  --p-field-label-color: var(--p-text);',
    '  --p-field-label-helper-color: var(--p-helper-color);',
    '  --p-field-counter-color: var(--p-helper-color);',
    '  --p-field-helper-color: var(--p-helper-color);',
  ]);
  fieldBlocks.set('[data-color-scheme="field"] [data-part="label"]', ['  color: var(--p-field-label-color);']);
  fieldBlocks.set('[data-color-scheme="field"] [data-part="label-helper"]', ['  color: var(--p-field-label-helper-color);']);
  fieldBlocks.set('[data-color-scheme="field"] [data-part="counter"]', ['  color: var(--p-field-counter-color);']);
  fieldBlocks.set('[data-color-scheme="field"] [data-part="helper"]', ['  color: var(--p-field-helper-color);']);
  // Field container base: no shadow in default resting state
  fieldBlocks.set('[data-color-scheme="field"] [data-part="container"]', [
    '  border-color: var(--p-border-color, var(--p-colors-transparent-default));',
    '  background-color: var(--p-bg);',
    '  box-shadow: none;',
  ]);

  // Field container on hover / active / focus (only when not outline, ghost, disabled, loading): gets size-based shadow
  fieldBlocks.set('[data-color-scheme="field"] [data-part="container"]:not([data-variant~="outline"], [data-variant~="ghost"], [data-state="disabled"], [data-state="loading"]):is(:hover, :active, [data-state="active"], :focus-within)', [
    '  box-shadow: var(--p-shadow, var(--p-shadow-default, none));',
  ]);
}

export function applyFieldSizeRules(fieldSizeBlocks) {
  fieldSizeBlocks.set('[data-size-scheme="field"]', ['  --p-field-border-width: 1px;']);
  fieldSizeBlocks.set('[data-size-scheme="field"][data-scheme-variant="otp"]', [
    '  width: var(--p-size, auto) !important;',
    '  min-width: var(--p-size, auto) !important;',
  ]);
}
