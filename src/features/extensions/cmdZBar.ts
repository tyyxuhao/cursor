import { StateEffect, ChangeDesc } from '@codemirror/state'
import { Decoration, DecorationSet } from '@codemirror/view'
import { StateField } from '@codemirror/state'
import { invertedEffects } from '@codemirror/commands'
import { EditorView } from '@codemirror/view'
import * as cs from '../chat/chatSlice'
import * as gs from '../globalSlice'
import { store } from '../../app/store'
import { Tab } from '../window/state'

export interface BarInfo {
    activateBundle: any
    message: string
}

export const showBar = StateEffect.define<BarInfo>({})
export const hideBar = StateEffect.define<BarInfo>({})
export const barField = StateField.define({
    create() {
        return Decoration.none
    },
    update(ranges, tr) {
        ranges = ranges.map(tr.changes)
        for (let e of tr.effects) {
            if (e.is(showBar)) {
            }
            if (e.is(hideBar)) {
                store.dispatch(cs.openCommandBar())
                store.dispatch(
                    cs.activateDiffFromEditor(e.value.activateBundle)
                )

                store.dispatch(cs.setCurrentDraftMessage(e.value.message))

                const selection = e.value.activateBundle.selection
                const tabs = store.getState().global.tabs
                const currentTabIndex = parseInt(
                    Object.keys(tabs).find((index) => tabs[index].isActive)!
                )
                // This is so insanely nasty smh
                store.dispatch(
                    gs.addTransaction({
                        tabId: currentTabIndex,
                        transactionFunction: {
                            type: 'newSelection',
                            from: selection.from,
                            to: selection.to,
                            inHistory: false,
                        },
                    })
                )
            }
        }
        return ranges
    },
    provide: (field) => EditorView.decorations.from(field),
})

const invertBar = invertedEffects.of((tr) => {
    let found = []
    for (let e of tr.effects) {
        if (e.is(showBar)) {
            found.push(hideBar.of(e.value))
        }
        if (e.is(hideBar)) {
            found.push(hideBar.of(e.value))
        }
    }
    return found
})

export function barExtension() {
    return [invertBar, barField]
}
