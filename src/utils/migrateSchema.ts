import { State } from "../types"
import { getDefaultState } from "../defaults"
import { randomId } from "./helper"
import { availableCommandNames } from "src/defaults/commands"

export function migrateSchema(state: State) {
  const defaultState = getDefaultState()

  if (!state || state.version < 7) {
    return defaultState
  } 
  
  if (state.version === 7) {
    state = sevenToEight(state)  
  }

  if (state.version === 8) {
    state = eightToNine(state)
  }

  if (state.version === 9) {
    state = nineToTen(state)
  }

  // purify
  if (state.keybinds?.length) {
    state.keybinds = state.keybinds.filter(kb => availableCommandNames.includes(kb.command))
  }

  if (!(state?.version === defaultState.version)) {
    return defaultState
  }

  return state 
}

// These migration functions should be self contained. 
function sevenToEight(state: State) {
  state.version = 8 
  state.rules?.forEach(rule => {
    rule.condition = {
      parts: [{type: (rule as any).matchType || "CONTAINS", id: randomId(), value: (rule as any).match || ""}]
    }
    delete (rule as any).matchType
    delete (rule as any).match
  })
  return state 
}

function eightToNine(state: State) {
  state.version = 9
  state.keybinds?.forEach(kb => {
    if (kb.command === "seek") {
      kb.valueBool2 = true
    }
  })
  return state 
}

function nineToTen(state: State) {
  state.version = 10
  state.keybinds?.forEach(kb => {
    if ((kb.command as string) === "preservePitch") {
      kb.command = "speedChangesPitch"
      kb.valueState = kb.valueState === "on" ? "off" : kb.valueState === "off" ? "on" : "toggle"
    }
  })
  return state 
}