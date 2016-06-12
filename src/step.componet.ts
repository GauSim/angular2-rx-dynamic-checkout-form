import { Store } from '@ngrx/store';
import { Component, OnInit, Input } from '@angular/core';
import { MD_CARD_DIRECTIVES } from '@angular2-material/card';

import { ACTIONS, AppState, StepState } from './app.store';
import template from './step.template';


@Component({
    selector: 'step-base',
    template: template,
    directives: [MD_CARD_DIRECTIVES],
    pipes: []
})
export class StepBase {

    @Input() step: StepState;

    constructor(public store: Store<AppState>) {
    }

    toggleValidity() {
        this.setValidity(!this.step.isValid);
    }

    setValidity(validity) {
        this.store.dispatch({
            type: ACTIONS.STEP_SET_VALIDITY,
            payload: [{ stepId: this.step.id, validity: validity }]
        });
    }
}