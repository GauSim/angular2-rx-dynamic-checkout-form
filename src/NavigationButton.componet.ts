import { Store } from '@ngrx/store';
import { Component, OnInit, Input } from '@angular/core';
import { MD_BUTTON_DIRECTIVES } from '@angular2-material/button';
import { ACTIONS, IStepNavigationButton, AppState } from './app.store';

@Component({
    selector: 'navigation-button',
    template: ` <button md-raised-button [color]="(buttonModel.isCurrent ? 'primary' : '')" [class.hidden]="!buttonModel.isAvailable" [disabled]="!buttonModel.isReachable && !buttonModel.isCurrent" (click)="goTo(buttonModel.stepId)">
                    <span [class]="(buttonModel.isValid ? 'glyphicon glyphicon-ok' : '')" aria-hidden="true"></span> {{ buttonModel.title }}
                </button>`,
    directives: [MD_BUTTON_DIRECTIVES],
    pipes: []
})
export class NavigationButton {

    @Input() buttonModel: IStepNavigationButton;

    constructor(public store: Store<AppState>) {
    }

    goTo(stepId) {
        this.store.dispatch({
            type: ACTIONS.STEPS_GO_STEPID,
            payload: { stepId }
        });
    }

}