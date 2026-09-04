// Style Schemes Generator

const PROP_MAP = {
  'bg': '--p-bg',
  'text': '--p-text',
  'border': '--p-border-color',
  'border-size': '--p-border-size',
  'icon': '--p-icon-color',
  'label-text': '--p-label-color',
  'on': '--p-text',
  'toggle': '--p-toggle-indicator-color',
  'padding-x': '--p-padding-x',
  'padding-y': '--p-padding-y',
  'gap': '--p-gap',
  'radius': '--p-radius',
  'leading': '--p-leading',
  'sub-text': '--p-sub-text-size',
  'sub-leading': '--p-sub-leading',
  'helper-text': '--p-helper-color',
  'placeholder-text': '--p-placeholder-color',
  'option-text': '--p-option-color',
  'border-color': '--p-border-color',
};

function cssProp(key, stateCtx = 'base', refOrVal = '') {
  const refStr = String(refOrVal);
  const isWidthOrSize = refStr.includes('.border.') || refStr.includes('.size.') || refStr.endsWith('px');

  if (key === 'border') {
    if (isWidthOrSize && !refStr.includes('.colors.')) {
      return stateCtx === 'disabled' || stateCtx === 'disable' ? '--p-border-size-disabled' : '--p-border-size';
    }
  }

  if (stateCtx === 'hover') {
    if (key === 'bg') return '--p-bg-hover';
    if (key === 'text') return '--p-text-hover';
    if (key === 'border' || key === 'border-color') return '--p-border-color-hover';
  }
  if (stateCtx === 'active') {
    if (key === 'bg') return '--p-bg-active';
    if (key === 'text') return '--p-text-active';
    if (key === 'border' || key === 'border-color') return '--p-border-color-active';
  }
  if (stateCtx === 'disabled' || stateCtx === 'disable') {
    if (key === 'bg') return '--p-bg-disabled';
    if (key === 'text') return '--p-text-disabled';
    if (key === 'border' || key === 'border-color') return '--p-border-color-disabled';
  }
  return PROP_MAP[key] || `--p-${key}`;
}

const STATE_NORM = {
  disable: 'disabled', hover: 'hover', active: 'active',
  error: 'error', success: 'success', filled: 'filled',
  disabled: 'disabled'
};
function normState(s) { return STATE_NORM[s] || s; }

function isTokenLeaf(val) {
  if (val === null || val === undefined) return false;
  if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') return true;
  if (typeof val === 'object' && '$value' in val) return true;
  return false;
}

function getTokenValue(val) {
  if (val === null || val === undefined) return undefined;
  if (typeof val === 'object' && '$value' in val) return val.$value;
  if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') return val;
  return undefined;
}

export function generateStyleSchemes(componentVars, refToCssVar) {
  const styleMap = new Map();

  function add(scheme, selector, propKey, refOrVal, stateCtx = 'base') {
    if (!styleMap.has(scheme)) styleMap.set(scheme, new Map());
    const schemeBlocks = styleMap.get(scheme);
    if (!schemeBlocks.has(selector)) schemeBlocks.set(selector, []);
    const cssVal = (typeof refOrVal === 'string' && refOrVal.startsWith('$.'))
      ? refToCssVar(refOrVal)
      : String(refOrVal);
    const primaryProp = cssProp(propKey, stateCtx, refOrVal);
    const rule = `  ${primaryProp}: ${cssVal};`;
    const existing = schemeBlocks.get(selector);
    if (!existing.includes(rule)) {
      existing.push(rule);
    }
    if (stateCtx === 'disabled' || stateCtx === 'disable') {
      const baseProp = cssProp(propKey, 'base', refOrVal);
      if (baseProp !== primaryProp) {
        const baseRule = `  ${baseProp}: ${cssVal};`;
        if (!existing.includes(baseRule)) {
          existing.push(baseRule);
        }
      }
    }
  }

  const styleObj = componentVars?.style || componentVars || {};

  if (styleObj.global) {
    for (const [key, val] of Object.entries(styleObj.global)) {
      const rawVal = getTokenValue(val);
      if (rawVal === undefined) continue;
      if (key === 'sharp' || key === 'rounded') {
        add('global', `[data-variant~="${key}"]`, 'radius', rawVal);
        add('global', `[data-style-scheme="global"][data-variant~="${key}"]`, 'radius', rawVal);
      } else if (key === 'none-gap') {
        add('global', `[data-variant~="none-gap"]`, 'gap', rawVal);
        add('global', `[data-style-scheme="global"][data-variant~="none-gap"]`, 'gap', rawVal);
      } else if (key === 'border') {
        add('global', `[data-style-scheme="global"]`, 'border-color', rawVal);
        add('global', `[data-color-scheme]`, 'border-color', rawVal);
      } else {
        add('global', `[data-style-scheme="global"]`, key, rawVal);
      }
    }
  }

  if (styleObj.action) {
    // Schema-only: [data-variant~="solid"] is always explicit on Petra buttons (per README).
    // No .p-btn class needed — fully driven by data-* attributes.

    // solid/fill variant of action scheme: has shadow (persists on hover too).
    const solidSel = `[data-style-scheme="action"][data-variant~="solid"]:not([data-state="disabled"], [data-state="loading"])`;
    add('action', solidSel, 'box-shadow', 'var(--p-shadow, var(--p-shadow-default, none))');

    // flat/outline/ghost/text + disabled/loading — no shadow at any interaction state.
    const noShadowVariants = `[data-variant~="flat"], [data-variant~="outline"], [data-variant~="ghost"], [data-variant~="text"]`;
    const noShadowStates = `[data-state="disabled"], [data-state="loading"]`;
    const noShadowSel = `[data-style-scheme="action"]:is(${noShadowVariants}, ${noShadowStates})`;
    const noShadowHover = `[data-style-scheme="action"]:is(${noShadowVariants}, ${noShadowStates}):is(:hover, :active, [aria-pressed="true"])`;
    add('action', `${noShadowSel}, ${noShadowHover}`, 'box-shadow', 'none');

    for (const [variant, variantVal] of Object.entries(styleObj.action)) {
      for (const [colorOrCommon, colorVal] of Object.entries(variantVal || {})) {
        if (!colorVal || typeof colorVal !== 'object') continue;
        for (const [propOrState, propVal] of Object.entries(colorVal)) {
          if (propOrState.startsWith('$')) continue;

          if (isTokenLeaf(propVal)) {
            const sel = colorOrCommon === 'common'
              ? `[data-style-scheme="action"][data-variant~="${variant}"]`
              : `[data-style-scheme="action"][data-variant~="${variant}"][data-color="${colorOrCommon}"]`;
            add('action', sel, propOrState, getTokenValue(propVal));
          } else if (propVal && typeof propVal === 'object') {
            const normS = normState(propOrState);
            const isHover = (normS === 'hover');
            const isDisable = (normS === 'disabled' || normS === 'disable');

            let sel;
            if (isDisable) {
              sel = colorOrCommon === 'common'
                ? `[data-style-scheme="action"][data-variant~="${variant}"][data-state="disabled"]`
                : `[data-style-scheme="action"][data-variant~="${variant}"][data-color="${colorOrCommon}"][data-state="disabled"]`;
            } else if (isHover) {
              const base = colorOrCommon === 'common'
                ? `[data-style-scheme="action"][data-variant~="${variant}"]`
                : `[data-style-scheme="action"][data-variant~="${variant}"][data-color="${colorOrCommon}"]`;
              sel = `${base}:not([data-state="disabled"]):is(:hover, [aria-pressed="true"], [data-state="active"], [data-active="true"])`;
            } else {
              sel = colorOrCommon === 'common'
                ? `[data-style-scheme="action"][data-variant~="${variant}"][data-state="${normS}"]`
                : `[data-style-scheme="action"][data-variant~="${variant}"][data-color="${colorOrCommon}"][data-state="${normS}"]`;
            }

            for (const [leafProp, leafVal] of Object.entries(propVal)) {
              const rawLeaf = getTokenValue(leafVal);
              if (leafProp.startsWith('$') || rawLeaf === undefined) continue;
              add('action', sel, leafProp, rawLeaf, isDisable ? 'disabled' : (isHover ? 'hover' : 'base'));
            }
          }
        }
      }
    }
  }

  for (const [groupName, groupVal] of Object.entries(styleObj)) {
    if (groupName === 'global' || groupName === 'action') continue;
    if (!groupVal || typeof groupVal !== 'object') continue;

    if (groupName === 'field') {
      handleFieldGroup(groupVal, add);
    } else if (groupName === 'badge') {
      handleBadgeGroup(groupVal, add);
    } else if (groupName === 'chip') {
      handleChipGroup(groupVal, add);
    } else if (groupName === 'toggle') {
      handleToggleGroup(groupVal, add);
    } else if (groupName === 'content') {
      handleContentGroup(groupVal, add);
    } else if (groupName === 'state') {
      handleStateGroup(groupVal, add);
    } else if (groupName === 'otp') {
      handleOtpGroup(groupVal, add);
    } else if (groupName === 'pagination') {
      handlePaginationGroup(groupVal, add);
    } else if (groupName === 'timeline') {
      handleTimelineGroup(groupVal, add);
    } else if (groupName === 'divider') {
      handleDividerGroup(groupVal, add);
    } else if (groupName === 'tab') {
      handleTabGroup(groupVal, add);
    } else if (groupName === 'progress') {
      handleProgressGroup(groupVal, add);
    } else if (groupName === 'circular-progress') {
      handleCircularProgressGroup(groupVal, add);
    } else if (groupName === 'toast') {
      handleToastGroup(groupVal, add);
    } else if (groupName === 'tree') {
      handleTreeGroup(groupVal, add);
    } else {
      walkStyleFallback(groupVal, [groupName], add);
    }
  }

  return styleMap;
}

// --- Group-specific Handlers ---

function handleFieldGroup(fieldObj, add) {
  const scheme = 'field';

  if (fieldObj.outline) {
    const varSels = `:is([data-style-scheme="field"][data-variant~="outline"], [data-style-scheme="field"] [data-variant~="outline"])`;

    for (const [key, val] of Object.entries(fieldObj.outline)) {
      if (key === 'common') {
        for (const [propOrState, propVal] of Object.entries(val)) {
          const rawVal = getTokenValue(propVal);
          if (rawVal !== undefined) {
            add(scheme, varSels, propOrState, rawVal);
          } else if (propOrState === 'disabled' || propOrState === 'disable') {
            const disSel = `${varSels}[data-state="disabled"]`;
            for (const [dp, dv] of Object.entries(propVal)) {
              const rawDv = getTokenValue(dv);
              if (rawDv !== undefined) add(scheme, disSel, dp, rawDv, 'disabled');
            }
          }
        }
      } else {
        const normS = normState(key);
        const sel = normS === 'default'
          ? varSels
          : `${varSels}[data-state="${normS}"]`;
        const rawVal = getTokenValue(val);
        if (rawVal !== undefined) {
          add(scheme, sel, key, rawVal);
        } else if (typeof val === 'object') {
          for (const [p, v] of Object.entries(val)) {
            const rawV = getTokenValue(v);
            if (rawV !== undefined) add(scheme, sel, p, rawV, 'base');
          }
        }
      }
    }
  }

  if (fieldObj.dropdown?.menu) {
    const menuObj = fieldObj.dropdown.menu;
    const baseSel = `[data-style-scheme="field"] [data-part="menu"]`;
    for (const [k, v] of Object.entries(menuObj)) {
      const rawV = getTokenValue(v);
      if (rawV !== undefined) {
        add(scheme, baseSel, k, rawV);
      } else if (k === 'selected') {
        const sel = `${baseSel}[data-state="selected"], ${baseSel}[aria-selected="true"]`;
        for (const [p, val] of Object.entries(v)) {
          const rawVal = getTokenValue(val);
          if (rawVal !== undefined) add(scheme, sel, p, rawVal);
        }
      } else if (k === 'scroll') {
        const scrollSel = `[data-style-scheme="field"] [data-part="scroll"]`;
        for (const [p, val] of Object.entries(v)) {
          const rawVal = getTokenValue(val);
          if (rawVal !== undefined) add(scheme, scrollSel, p, rawVal);
        }
      }
    }
  }
}

function handleBadgeGroup(badgeObj, add) {
  const scheme = 'badge';
  if (badgeObj.outline) {
    for (const [colorOrCommon, val] of Object.entries(badgeObj.outline)) {
      if (colorOrCommon === 'common') {
        const sel = `[data-style-scheme="badge"][data-variant~="outline"]`;
        for (const [p, v] of Object.entries(val)) {
          const rawV = getTokenValue(v);
          if (rawV !== undefined) add(scheme, sel, p, rawV);
        }
      } else {
        const sel = `[data-style-scheme="badge"][data-variant~="outline"][data-color="${colorOrCommon}"]`;
        for (const [p, v] of Object.entries(val)) {
          const rawV = getTokenValue(v);
          if (rawV !== undefined) add(scheme, sel, p, rawV);
        }
      }
    }
  }
}

function handleChipGroup(chipObj, add) {
  const scheme = 'chip';
  if (chipObj.outline) {
    const sel = `[data-style-scheme="chip"][data-variant~="outline"]`;
    for (const [key, val] of Object.entries(chipObj.outline)) {
      const rawVal = getTokenValue(val);
      if (rawVal !== undefined) {
        add(scheme, sel, key, rawVal);
      } else if (key === 'hover') {
        const hSel = `${sel}:not([data-state="disabled"]):hover`;
        for (const [p, v] of Object.entries(val)) {
          const rawV = getTokenValue(v);
          if (rawV !== undefined) add(scheme, hSel, p, rawV, 'hover');
        }
      } else if (key === 'disable' || key === 'disabled') {
        const dSel = `${sel}[data-state="disabled"]`;
        for (const [p, v] of Object.entries(val)) {
          const rawV = getTokenValue(v);
          if (rawV !== undefined) add(scheme, dSel, p, rawV, 'disabled');
        }
      }
    }
  }
}

function handleToggleGroup(toggleObj, add) {
  const scheme = 'toggle';
  if (toggleObj.switch) {
    const baseSel = `[data-style-scheme="toggle"]`;
    for (const [key, val] of Object.entries(toggleObj.switch)) {
      const rawVal = getTokenValue(val);
      if (rawVal !== undefined) {
        add(scheme, baseSel, key, rawVal);
      } else if (key === 'selected') {
        const sel = `${baseSel}:is([data-state="checked"], [data-state="selected"], [aria-checked="true"])`;
        for (const [p, v] of Object.entries(val)) {
          const rawV = getTokenValue(v);
          if (rawV !== undefined) add(scheme, sel, p, rawV);
        }
      } else if (key === 'disabled' || key === 'disable') {
        const disSel = `${baseSel}:is([data-disabled="true"], [data-state="disabled"])`;
        for (const [p, v] of Object.entries(val)) {
          const rawV = getTokenValue(v);
          if (rawV !== undefined) {
            add(scheme, disSel, p, rawV, 'disabled');
          } else if (p === 'selected') {
            const disSelSel = `${disSel}:is([data-state="checked"], [data-state="selected"], [aria-checked="true"], [data-checked="true"])`;
            for (const [sp, sv] of Object.entries(v)) {
              const rawSv = getTokenValue(sv);
              if (rawSv !== undefined) add(scheme, disSelSel, sp, rawSv, 'disabled');
            }
          }
        }
      }
    }
  }
}

function handleContentGroup(contentObj, add) {
  const scheme = 'content';
  if (contentObj.card) {
    const sel = `[data-style-scheme="content"]`;
    for (const [p, v] of Object.entries(contentObj.card)) {
      const rawV = getTokenValue(v);
      if (rawV !== undefined) add(scheme, sel, p, rawV);
    }
  }
}

function handleStateGroup(stateObj, add) {
  const scheme = 'state';
  for (const [variant, val] of Object.entries(stateObj)) {
    const sel = `[data-style-scheme="state"][data-variant~="${variant}"]`;
    if (typeof val === 'object') {
      for (const [p, v] of Object.entries(val)) {
        const rawV = getTokenValue(v);
        if (rawV !== undefined) add(scheme, sel, p, rawV);
      }
    }
  }
}

function handleOtpGroup(otpObj, add) {
  const scheme = 'otp';
  const SIZES = ['sm', 'base', 'lg', 'xl'];
  for (const [key, val] of Object.entries(otpObj)) {
    if (SIZES.includes(key)) {
      const sel = `[data-style-scheme="otp"][data-size="${key}"]`;
      for (const [p, v] of Object.entries(val)) {
        const rawV = getTokenValue(v);
        if (rawV !== undefined) add(scheme, sel, p, rawV);
      }
    } else {
      const rawVal = getTokenValue(val);
      if (rawVal !== undefined) add(scheme, `[data-style-scheme="otp"]`, key, rawVal);
    }
  }
}

function handlePaginationGroup(paginationObj, add) {
  const scheme = 'pagination';
  const COLORS = ['primary', 'secondary', 'success', 'error', 'info', 'warning', 'neutral'];

  if (paginationObj.default) {
    const baseSel = `[data-style-scheme="pagination"]`;
    for (const [p, v] of Object.entries(paginationObj.default)) {
      const rawV = getTokenValue(v);
      if (rawV !== undefined) {
        add(scheme, baseSel, p, rawV);
      } else if (p === 'hover') {
        const hSel = `${baseSel}:not([data-state="disabled"]):hover`;
        for (const [hp, hv] of Object.entries(v)) {
          const rawHv = getTokenValue(hv);
          if (rawHv !== undefined) add(scheme, hSel, hp, rawHv, 'hover');
        }
      }
    }
  }

  if (paginationObj.selected) {
    const selBase = `[data-style-scheme="pagination"][data-state="selected"]`;
    for (const [key, val] of Object.entries(paginationObj.selected)) {
      if (COLORS.includes(key)) {
        const colSel = `[data-style-scheme="pagination"][data-state="selected"][data-color="${key}"]`;
        for (const [p, v] of Object.entries(val)) {
          const rawV = getTokenValue(v);
          if (rawV !== undefined) add(scheme, colSel, p, rawV);
        }
      } else {
        const rawVal = getTokenValue(val);
        if (rawVal !== undefined) add(scheme, selBase, key, rawVal);
      }
    }
  }

  if (paginationObj.disabled) {
    const disSel = `[data-style-scheme="pagination"][data-state="disabled"]`;
    for (const [p, v] of Object.entries(paginationObj.disabled)) {
      const rawV = getTokenValue(v);
      if (rawV !== undefined) add(scheme, disSel, p, rawV, 'disabled');
    }
  }

  if (paginationObj.outline) {
    const outSel = `[data-style-scheme="pagination"][data-variant~="outline"]`;
    for (const [p, v] of Object.entries(paginationObj.outline)) {
      const rawV = getTokenValue(v);
      if (rawV !== undefined) {
        add(scheme, outSel, p, rawV);
      } else if (p === 'disabled') {
        const disOutSel = `${outSel}[data-state="disabled"]`;
        for (const [dp, dv] of Object.entries(v)) {
          const rawDv = getTokenValue(dv);
          if (rawDv !== undefined) add(scheme, disOutSel, dp, rawDv, 'disabled');
        }
      }
    }
  }
}

function handleTimelineGroup(timelineObj, add) {
  const scheme = 'timeline';
  const SIZES = ['sm', 'base', 'lg', 'xl'];
  const COLORS = ['primary', 'secondary', 'success', 'error', 'info', 'warning', 'neutral', 'surface'];

  for (const [key, val] of Object.entries(timelineObj)) {
    if (key === 'common') {
      const sel = `[data-style-scheme="timeline"]`;
      for (const [p, v] of Object.entries(val)) {
        const rawV = getTokenValue(v);
        if (rawV !== undefined) add(scheme, sel, p, rawV);
      }
    } else if (SIZES.includes(key)) {
      const sel = `[data-style-scheme="timeline"][data-size="${key}"]`;
      for (const [p, v] of Object.entries(val)) {
        const rawV = getTokenValue(v);
        if (rawV !== undefined) add(scheme, sel, p, rawV);
      }
    } else if (key === 'active') {
      const actSel = `[data-style-scheme="timeline"][data-state="active"]`;
      for (const [cp, cv] of Object.entries(val)) {
        if (COLORS.includes(cp)) {
          const colSel = `[data-style-scheme="timeline"][data-state="active"][data-color="${cp}"]`;
          for (const [p, v] of Object.entries(cv)) {
            const rawV = getTokenValue(v);
            if (rawV !== undefined) add(scheme, colSel, p, rawV);
          }
        } else {
          const rawCv = getTokenValue(cv);
          if (rawCv !== undefined) add(scheme, actSel, cp, rawCv);
        }
      }
    } else if (key === 'inactive') {
      const inactSel = `[data-style-scheme="timeline"][data-state="inactive"]`;
      for (const [p, v] of Object.entries(val)) {
        const rawV = getTokenValue(v);
        if (rawV !== undefined) add(scheme, inactSel, p, rawV);
      }
    }
  }
}

function handleDividerGroup(dividerObj, add) {
  const scheme = 'divider';
  const sel = `[data-style-scheme="divider"]`;
  for (const [p, v] of Object.entries(dividerObj)) {
    const rawV = getTokenValue(v);
    if (rawV !== undefined) add(scheme, sel, p, rawV);
  }
}

function handleTabGroup(tabObj, add) {
  const scheme = 'tab';
  const SIZES = ['sm', 'base', 'lg', 'xl'];
  const VARIANTS = ['contained', 'underline', 'pill'];

  for (const [key, val] of Object.entries(tabObj)) {
    const rawVal = getTokenValue(val);
    if (rawVal !== undefined) {
      add(scheme, `[data-style-scheme="tab"]`, key, rawVal);
    } else if (key === 'disabled') {
      const disSel = `[data-style-scheme="tab"][data-state="disabled"]`;
      for (const [p, v] of Object.entries(val)) {
        const rawV = getTokenValue(v);
        if (rawV !== undefined) add(scheme, disSel, p, rawV, 'disabled');
      }
    } else if (VARIANTS.includes(key)) {
      const varSel = `[data-style-scheme="tab"][data-variant~="${key}"]`;
      for (const [p, v] of Object.entries(val)) {
        const rawV = getTokenValue(v);
        if (rawV !== undefined) {
          add(scheme, varSel, p, rawV);
        } else if (p === 'selected') {
          const selSel = `${varSel}:is([data-state="selected"], [aria-selected="true"])`;
          for (const [sp, sv] of Object.entries(v)) {
            const rawSv = getTokenValue(sv);
            if (rawSv !== undefined) add(scheme, selSel, sp, rawSv);
          }
        }
      }
    } else if (SIZES.includes(key)) {
      const sizeSel = `[data-style-scheme="tab"][data-size="${key}"]`;
      for (const [p, v] of Object.entries(val)) {
        const rawV = getTokenValue(v);
        if (rawV !== undefined) add(scheme, sizeSel, p, rawV);
      }
    }
  }
}

function handleProgressGroup(progressObj, add) {
  const scheme = 'progress';
  const SIZES = ['sm', 'base', 'lg', 'xl'];

  for (const [size, val] of Object.entries(progressObj)) {
    if (SIZES.includes(size) && val.gap) {
      const sizeSel = `[data-style-scheme="progress"][data-size="${size}"]`;
      for (const [part, pval] of Object.entries(val.gap)) {
        const rawPval = getTokenValue(pval);
        if (rawPval !== undefined) {
          add(scheme, sizeSel, `gap-${part}`, rawPval);
        }
      }
    }
  }
}

function handleCircularProgressGroup(cpObj, add) {
  const scheme = 'circular-progress';
  const SIZES = ['sm', 'base', 'lg', 'xl'];

  for (const [key, val] of Object.entries(cpObj)) {
    if (SIZES.includes(key)) {
      const sel = `[data-style-scheme="circular-progress"][data-size="${key}"]`;
      for (const [p, v] of Object.entries(val)) {
        const rawV = getTokenValue(v);
        if (rawV !== undefined) add(scheme, sel, p, rawV);
      }
    } else {
      const rawVal = getTokenValue(val);
      if (rawVal !== undefined) add(scheme, `[data-style-scheme="circular-progress"]`, key, rawVal);
    }
  }
}

function handleToastGroup(toastObj, add) {
  const scheme = 'toast';
  const baseSel = `[data-style-scheme="toast"]`;

  for (const [key, val] of Object.entries(toastObj)) {
    const rawVal = getTokenValue(val);
    if (rawVal !== undefined) {
      add(scheme, baseSel, key, rawVal);
    } else if (key === 'notification') {
      for (const [nk, nv] of Object.entries(val)) {
        const rawNv = getTokenValue(nv);
        if (rawNv !== undefined) {
          add(scheme, baseSel, nk, rawNv);
        } else if (nk === 'button') {
          const btnSel = `[data-style-scheme="toast"] [data-part="button"]`;
          for (const [bp, bv] of Object.entries(nv)) {
            const rawBv = getTokenValue(bv);
            if (rawBv !== undefined) add(scheme, btnSel, bp, rawBv);
          }
        }
      }
    }
  }
}

function handleTreeGroup(treeObj, add) {
  const scheme = 'tree';
  const baseSel = `[data-style-scheme="tree"]`;

  for (const [key, val] of Object.entries(treeObj)) {
    const rawVal = getTokenValue(val);
    if (rawVal !== undefined) {
      add(scheme, baseSel, key, rawVal);
    } else if (key === 'hover') {
      const rawVal = getTokenValue(val);
      if (rawVal !== undefined) add(scheme, `${baseSel}:not([data-state="disabled"]):hover`, 'bg', rawVal, 'hover');
    } else if (key === 'item') {
      const itemSel = `[data-style-scheme="tree"] [data-part="item"]`;
      for (const [ip, iv] of Object.entries(val)) {
        const rawIv = getTokenValue(iv);
        if (rawIv !== undefined) add(scheme, itemSel, ip, rawIv);
      }
    }
  }
}

function walkStyleFallback(obj, keyPath, add) {
  if (!obj) return;
  if (isTokenLeaf(obj)) {
    const groupName = keyPath[0];
    const lastKey = keyPath[keyPath.length - 1];
    add(groupName, `[data-style-scheme="${groupName}"]`, lastKey, getTokenValue(obj));
    return;
  }
  if (typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      if (k.startsWith('$')) continue;
      walkStyleFallback(v, [...keyPath, k], add);
    }
  }
}
