import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { MD_BUTTON_DIRECTIVES } from '@angular2-material/button';
import { MD_TABS_DIRECTIVES } from '@angular2-material/tabs';
import { Observable } from 'rxjs';

import { ACTIONS, STEP_NAME, RootState, StepState, IStepNavigationButton } from './app.store';
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

  nextButton: IStepNavigationButton;
  prevButton: IStepNavigationButton;

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

      this.nextButton = root.stepNavigation.nextButton;
      this.prevButton = root.stepNavigation.prevButton;


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

  debugsetValidity() {
    this.store.dispatch({
      type: ACTIONS.STEP_SET_VALIDITY,
      payload: [
        { stepId: STEP_NAME.STEP1, validity: false },
        { stepId: STEP_NAME.STEP2, validity: false }
      ]
    });
  }

  ngOnInit() {

    // register app steps in order ...
    const initSteps: StepState[] = [
      {
        id: STEP_NAME.STEP1,
        title: 'Seite 1',
        isValid: false,
        dependencySteps: []
      },
      {
        id: STEP_NAME.STEP2,
        title: 'Seite 2',
        isValid: false,
        dependencySteps: [STEP_NAME.STEP1]
      },
      {
        id: STEP_NAME.STEP3,
        title: 'Seite 3',
        isValid: false,
        dependencySteps: [STEP_NAME.STEP2]
      },
      {
        id: STEP_NAME.STEP4,
        title: 'Seite 4',
        isValid: false,
        dependencySteps: [STEP_NAME.STEP3]
      },
      {
        id: STEP_NAME.STEP5,
        title: 'Seite 5',
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