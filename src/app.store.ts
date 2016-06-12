import { ActionReducer, Action, provideStore } from '@ngrx/store';
import * as Immutable from 'immutable';
import * as _ from 'underscore';

export const STEP_NAME = {
    INIT: "INIT",
    STEP1: "STEP1",
    STEP2: "STEP2",
    STEP3: "STEP3",
    STEP4: "STEP4",
    STEP5: "STEP5",
    CHECKOUT: "CHECKOUT",
}

export interface AppState {
    root: RootState;
}

export interface RootState {
    currentStepName: string;
    stepNavigation: IStepNavigation;
    stepOrder: string[];
    stepStates: { [key: string]: StepState };
}

export interface StepState {
    id: string;
    title: string;
    isValid: boolean;
    dependencySteps: string[];
}

export interface INavigationButtons {
    nextButton: IStepNavigationButton;
    prevButton: IStepNavigationButton;
};

export interface IStepNavigation extends INavigationButtons {
    nextStepNavigationStrategy: NAVIGATION_STRATEGY;
    stepButtons: IStepNavigationButton[];
};

export interface IStepNavigationButton {
    title: string;
    stepId: string;
    isCurrent: boolean;
    isReachable: boolean;
    isAvailable: boolean;
    isValid: boolean;
}

enum NAVIGATION_STRATEGY {
    DIRECT_ORDER_NEXT,
    REACHABLE_NEXT
}

function registerSteps(state: RootState, steps: StepState[]): RootState {

    const stepOrder: string[] = state.stepOrder && state.stepOrder.length ? [...state.stepOrder, ...steps.map(s => s.id), STEP_NAME.CHECKOUT] : [...steps.map(s => s.id), STEP_NAME.CHECKOUT];

    const stepStates: { [key: string]: StepState } = Object.assign({}, state.stepStates);

    stepStates[STEP_NAME.CHECKOUT].dependencySteps = stepOrder.filter(stepId => stepId != STEP_NAME.CHECKOUT);

    steps.forEach(step => {

        // prevent steps that need them selves to be vailid befor navigating to them
        if (step.dependencySteps.indexOf(step.id) > 0) {
            throw new Error(`impossible register on ${step.id}, can not need ${step.id} as a vailid step`);
        }

        stepStates[step.id] = step
    });

    const nextState: RootState = {
        stepStates,
        stepOrder,
        currentStepName: state.currentStepName ? state.currentStepName : steps[0].id,
        stepNavigation: state.stepNavigation
    };

    const stepNavigation: IStepNavigation = creatStepNavigation(nextState);
    return Object.assign({}, nextState, { stepNavigation });
}

/**
 * checks if all dependencySteps of the step for stepId are valid
 */
function isReachableStep(state: RootState, stepId: string): boolean {
    return state.stepStates[stepId].dependencySteps
        .map(depStepId => state.stepStates[depStepId].isValid)
        .reduce((lastIsValid, thisIsValid, idx) => (lastIsValid && thisIsValid), true);
}

function getReachableNeighbors(state: RootState = init): INavigationButtons {

    const currentIndex = state.stepOrder.indexOf(state.currentStepName)

    let reachableUpper = [];
    let reachableLower = state.stepOrder.filter((id, x) => x < currentIndex && isReachableStep(state, id));

    if (state.stepNavigation.nextStepNavigationStrategy === NAVIGATION_STRATEGY.REACHABLE_NEXT) {
        reachableUpper = state.stepOrder.filter((id, x) => x > currentIndex && isReachableStep(state, id));
    }

    const nextReachableId = reachableUpper.length > 0 ? reachableUpper[0] : null;
    const prevReachableId = reachableLower.length > 0 ? reachableLower[reachableLower.length - 1] : null;

    const directNextId = (state.stepOrder[state.stepOrder.indexOf(state.currentStepName) + 1] ? state.stepOrder[state.stepOrder.indexOf(state.currentStepName) + 1] : null);
    const directPrevId = (state.stepOrder[state.stepOrder.indexOf(state.currentStepName) - 1] ? state.stepOrder[state.stepOrder.indexOf(state.currentStepName) + 1] : null);

    const nextId = nextReachableId ? nextReachableId : directNextId;
    const prevId = prevReachableId ? prevReachableId : directPrevId;

    const nextIsAvailable = nextId ? true : false;
    const prevIsAvailable = prevId ? true : false;

    const nextIsReachable = nextIsAvailable && (nextId === nextReachableId || isReachableStep(state, nextId));
    const prevIsReachable = prevIsAvailable && (prevId === prevReachableId || isReachableStep(state, prevId));

    const nexIsValid = nextIsAvailable && state.stepStates[nextId].isValid;
    const prevIsValid = prevIsAvailable && state.stepStates[prevId].isValid;

    return {
        nextButton: {
            title: nextIsAvailable ? 'weiter zu ' + state.stepStates[nextId].title : '',
            stepId: nextId,
            isAvailable: nextIsAvailable,
            isReachable: nextIsReachable,
            isValid: nexIsValid,
            isCurrent: false
        },
        prevButton: {
            title: prevIsAvailable ? 'zurück zu ' + state.stepStates[prevId].title : '',
            stepId: prevId,
            isAvailable: prevIsAvailable,
            isReachable: prevIsReachable,
            isValid: prevIsValid,
            isCurrent: false
        }
    };
}


function creatStepNavigation(state: RootState = init): IStepNavigation {

    const { nextButton, prevButton } = getReachableNeighbors(state);

    return {
        nextButton,
        prevButton,
        nextStepNavigationStrategy: state.stepNavigation.nextStepNavigationStrategy,
        stepButtons: state.stepOrder.map(stepId => {
            return {
                stepId: stepId,
                title: state.stepStates[stepId].title,
                isReachable: isReachableStep(state, stepId),
                isCurrent: state.currentStepName === stepId,
                isValid: state.stepStates[stepId].isValid,
                isAvailable: true
            }
        }),
    };
}

function navigateTo(state: RootState, { stepId }: { stepId: string }): RootState {

    if (state.stepOrder.indexOf(stepId) === -1) {
        return state;
    }

    if (!isReachableStep(state, stepId)) {
        console.log("depsAreValid is false");
        return state;
    }

    const nextState = Object.assign({}, state, { currentStepName: stepId });
    const stepNavigation: IStepNavigation = creatStepNavigation(nextState);
    return Object.assign({}, nextState, { stepNavigation });
}

function setValidityRecursively(_stepStates: { [key: string]: StepState }, changes: { stepId: string, validity: boolean }[]): { [key: string]: StepState } {

    const stepStates: { [key: string]: StepState } = Object.assign({}, _stepStates);

    const dependencyStepsChanges: { stepId: string, validity: boolean }[] = [];

    // todo avoid forEach
    changes.forEach(change => {

        stepStates[change.stepId].isValid = change.validity;

        if (change.validity === false) {
            _.filter(stepStates, e => e.dependencySteps.indexOf(change.stepId) >= 0)
                .forEach(step => {
                    if (!dependencyStepsChanges.some(e => e.stepId === step.id && e.validity === change.validity))
                        dependencyStepsChanges.push({ stepId: step.id, validity: change.validity });
                });
        }

    });

    if (dependencyStepsChanges.length > 0) {
        return setValidityRecursively(stepStates, dependencyStepsChanges);
    } else {
        return stepStates;
    }
}

function setValidity(state: RootState, changes: { stepId: string, validity: boolean }[]): RootState {

    const stepStates: { [key: string]: StepState } = setValidityRecursively(state.stepStates, changes);

    const nextState = Object.assign({}, state, { stepStates });

    const stepNavigation: IStepNavigation = creatStepNavigation(nextState);
    return Object.assign({}, nextState, { stepNavigation });
}

export const ACTIONS = {
    STEPS_REGISTER: 'STEPS_REGISTER',

    STEPS_GO_STEPID: 'STEPS_GO_STEPID',

    STEP_SET_VALIDITY: 'STEP_SET_VALIDITY'
}

export const init: RootState = {
    currentStepName: null,
    stepOrder: [],
    stepStates: {
        [STEP_NAME.CHECKOUT]: {
            id: STEP_NAME.CHECKOUT,
            title: STEP_NAME.CHECKOUT,
            isValid: false,
            dependencySteps: []
        }
    },
    stepNavigation: {
        nextStepNavigationStrategy: NAVIGATION_STRATEGY.REACHABLE_NEXT, //NAVIGATION_STRATEGY.DIRECT_ORDER_NEXT, 
        nextButton: {
            title: '',
            stepId: null,
            isAvailable: false,
            isReachable: false,
            isCurrent: false,
            isValid: false
        },
        prevButton: {
            title: '',
            stepId: null,
            isAvailable: false,
            isReachable: false,
            isCurrent: false,
            isValid: false
        },
        stepButtons: []
    }
}

export const rootReducer: ActionReducer<RootState> = (state: RootState = init, action: Action = { type: null }) => {
    switch (action.type) {

        case ACTIONS.STEPS_REGISTER:
            return registerSteps(state, action.payload as StepState[]);

        case ACTIONS.STEPS_GO_STEPID:
            return navigateTo(state, action.payload as { stepId: string });

        case ACTIONS.STEP_SET_VALIDITY:
            return setValidity(state, action.payload as [{ stepId: string, validity: boolean }]);


        default:
            return state;
    }
}

