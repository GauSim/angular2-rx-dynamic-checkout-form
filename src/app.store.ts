import { ActionReducer, Action } from '@ngrx/store';
import * as Immutable from 'immutable';


export const STEP_NAME = {
    INIT: "INIT",
    STEP1: "STEP1",
    STEP2: "STEP2",
    STEP3: "STEP3",
    STEP4: "STEP4",
    STEP5: "STEP5"
}


export interface RootState {
    count: number;
    currentStepName: string;
    stepNavigation: IStepNavigation;
    stepOrder: string[],
    stepStates: Map<string, StepState>;
}


export interface StepState {
    id: string;
    name: string;
    isValid: boolean;
    dependencySteps: string[];
}


interface IStepNavigation {
    canNavNext: boolean;
    canNavPrev: boolean;
    hasNext: boolean;
    hasPrev: boolean;
    stepButtons: {
        stepId: string;
        name: string;
        depsAreValid: boolean,
        isCurrent: boolean,
    }[];
};
function registerSteps(state: RootState, steps: StepState[]): RootState {

    const stepOrder: string[] = state.stepOrder && state.stepOrder.length ? [...state.stepOrder, ...steps.map(s => s.id)] : [...steps.map(s => s.id)];

    //todo create a new map! avoid dirty cast
    const stepStates: Map<string, StepState> = Object.assign({}, state.stepStates);

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
        count: state.count,
        currentStepName: state.currentStepName ? state.currentStepName : steps[0].id,
        stepNavigation: null
    };

    const stepNavigation: IStepNavigation = creatStepNavigation(nextState);
    return Object.assign({}, nextState, { stepNavigation });
}


function depsAreValid(state: RootState, stepId: string): boolean {
    let valid = true;
    state.stepStates[stepId].dependencySteps.forEach(depStepId => {
        valid = valid && state.stepStates[depStepId].isValid;
    });
    return valid;
}

function creatStepNavigation(state: RootState = init): IStepNavigation {

    const currentStep = state.stepStates[state.currentStepName];

    const hasNext = (state.stepOrder.indexOf(state.currentStepName) + 1) <= state.stepOrder.length - 1;
    const hasPrev = (state.stepOrder.indexOf(state.currentStepName) - 1) >= 0;

    const nextStepId = state.stepOrder[state.stepOrder.indexOf(state.currentStepName) + 1];
    const prevStepId = state.stepOrder[state.stepOrder.indexOf(state.currentStepName) - 1];

    const canNavNext = currentStep.isValid && hasNext && depsAreValid(state, nextStepId);
    const canNavPrev = hasPrev && depsAreValid(state, prevStepId);

    return {
        hasNext,
        hasPrev,
        canNavNext,
        canNavPrev,
        stepButtons: state.stepOrder.map(stepId => {
            return {
                stepId: stepId,
                name: state.stepStates[stepId].name,
                depsAreValid: depsAreValid(state, stepId),
                isCurrent: state.currentStepName === stepId
            }
        })
    };
}


function navigateTo(state: RootState, { stepId }: { stepId: string }): RootState {

    if (state.stepOrder.indexOf(stepId) === -1) {
        return state;
    }

    if (!depsAreValid(state, stepId)) {
        console.log("depsAreValid is false");
        return state;
    }

    const nextState = Object.assign({}, state, { currentStepName: stepId });
    const stepNavigation: IStepNavigation = creatStepNavigation(nextState);
    return Object.assign({}, nextState, { stepNavigation });
}

function validateStep(state: RootState): RootState {

    //todo create a new map! avoid dirty cast
    const stepStates: Map<string, StepState> = Object.assign({}, state.stepStates);

    Object.keys(stepStates).forEach(key => {
        if (stepStates[key].id === state.currentStepName)
            stepStates[key].isValid = true;
    });


    const nextState = Object.assign({}, state, { stepStates });
    const stepNavigation: IStepNavigation = creatStepNavigation(nextState);
    return Object.assign({}, nextState, { stepNavigation });
}


export const ACTIONS = {
    STEPS_REGISTER: 'STEPS_REGISTER',
    STEPS_GO_NEXT: 'STEPS_GO_NEXT',
    STEPS_GO_PREV: 'STEPS_GO_PREV',
    STEPS_GO_STEPID: 'STEPS_GO_STEPID',
    STEP_VALIDATE: 'STEP_VALIDATE'
}

const init: RootState = {
    count: 0,
    currentStepName: null,
    stepOrder: [],
    stepStates: new Map<string, StepState>(),
    stepNavigation: {
        hasNext: false,
        hasPrev: false,
        canNavNext: false,
        canNavPrev: false,
        stepButtons: []
    }
}

export const rootReducer: ActionReducer<RootState> = (state: RootState = init, action: Action) => {
    switch (action.type) {

        case ACTIONS.STEPS_REGISTER:
            return registerSteps(state, action.payload as StepState[]);

        case ACTIONS.STEPS_GO_NEXT:
            if (!state.stepNavigation.hasNext) {
                return state;
            }
            const nextIndex = state.stepOrder.indexOf(state.currentStepName) + 1;
            return navigateTo(state, { stepId: state.stepOrder[nextIndex] });

        case ACTIONS.STEPS_GO_PREV:
            if (!state.stepNavigation.hasPrev) {
                return state;
            }
            const prevIndex = state.stepOrder.indexOf(state.currentStepName) - 1;
            return navigateTo(state, { stepId: state.stepOrder[prevIndex] });

        case ACTIONS.STEP_VALIDATE:
            return validateStep(state);

        case ACTIONS.STEPS_GO_STEPID:
            return navigateTo(state, action.payload as { stepId: string });

        default:
            return state;
    }
}