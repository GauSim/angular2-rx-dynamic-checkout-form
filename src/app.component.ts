import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { MD_BUTTON_DIRECTIVES } from '@angular2-material/button';
import { MD_TABS_DIRECTIVES } from '@angular2-material/tabs';
import { Observable } from 'rxjs';

import { ACTIONS, STEP_NAME, RootState, StepState } from './app.store';
import { AppState } from './index';
import { propPipe } from './pipes/propPipe';

import { StepBase } from './step.componet';


import template from './app.template';
@Component({
  selector: 'app-root',
  template: template,
  directives: [MD_BUTTON_DIRECTIVES, MD_TABS_DIRECTIVES, StepBase],
  pipes: [propPipe]
})

export class AppComponent implements OnInit {

  showPrevButton: boolean = false;
  showNextButton: boolean = false;

  disablePrevButton: boolean = true;
  disableNextButton: boolean = true;

  currentStep: StepState = null;
  stepButtons;

  root: Observable<RootState>;

  constructor(public store: Store<AppState>) {
    this.root = store.select(s => s.root);
    this.root.subscribe(root => {
      this.showNextButton = root.stepNavigation.nextButton.isAvailable;
      this.showPrevButton = root.stepNavigation.prevButton.isAvailable;

      this.disableNextButton = !root.stepNavigation.nextButton.isReachable;
      this.disablePrevButton = !root.stepNavigation.prevButton.isReachable;

      this.currentStep = root.stepStates[root.currentStepName];

      this.stepButtons = root.stepNavigation.stepButtons;
    });


  }

  goTo(stepId) {
    this.store.dispatch({
      type: ACTIONS.STEPS_GO_STEPID,
      payload: { stepId }
    });
  }

  goNext() {
    this.store.dispatch({
      type: ACTIONS.STEPS_GO_NEXT
    });
  }

  goPrev() {
    this.store.dispatch({
      type: ACTIONS.STEPS_GO_PREV
    });
  }

  ngOnInit() {

    // register app steps in order ...
    const initSteps: StepState[] = [
      {
        id: STEP_NAME.STEP1,
        name: 'Seite1',
        isValid: false,
        dependencySteps: []
      },
      {
        id: STEP_NAME.STEP2,
        name: 'Seite2',
        isValid: false,
        dependencySteps: [STEP_NAME.STEP1]
      },
      {
        id: STEP_NAME.STEP3,
        name: 'Seite3',
        isValid: false,
        dependencySteps: [STEP_NAME.STEP1, STEP_NAME.STEP2]
      },
      {
        id: STEP_NAME.STEP4,
        name: 'Seite4',
        isValid: false,
        dependencySteps: [STEP_NAME.STEP1, STEP_NAME.STEP2, STEP_NAME.STEP3]
      },
      {
        id: STEP_NAME.STEP5,
        name: 'Seite5',
        isValid: false,
        dependencySteps: [STEP_NAME.STEP1]
      }
    ]

    this.store.dispatch({
      type: ACTIONS.STEPS_REGISTER,
      payload: initSteps
    });

  }



}