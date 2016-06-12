import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { MD_TABS_DIRECTIVES } from '@angular2-material/tabs';
import { Observable } from 'rxjs';

import { ACTIONS, STEP_NAME, AppState, RootState, StepState, IStepNavigationButton } from './app.store';
import { propPipe } from './pipes/propPipe';

import { StepBase } from './step.componet';
import { NavigationButton } from './NavigationButton.componet';

import template from './app.template';
@Component({
  selector: 'app-root',
  template: template,
  directives: [NavigationButton, MD_TABS_DIRECTIVES, StepBase],
  pipes: [propPipe]
})

export class AppComponent implements OnInit {

  stepButtons: Observable<IStepNavigationButton[]>;
  nextButton: Observable<IStepNavigationButton>;
  prevButton: Observable<IStepNavigationButton>;


  currentStep: StepState = null;

  constructor(public store: Store<AppState>) {
    store.select(s => s.root).subscribe(root => {
      this.currentStep = root.stepStates[root.currentStepName];
    });

    this.nextButton = store.select(store => store.root.stepNavigation.nextButton);
    this.prevButton = store.select(store => store.root.stepNavigation.prevButton);
    this.stepButtons = store.select(store => store.root.stepNavigation.stepButtons);

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