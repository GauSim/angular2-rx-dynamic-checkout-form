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
    currentStepName: string;
    stepNavigationStrategy: NAVIGATION_STRATEGY;
    stepNavigation: IStepNavigation;
    stepOrder: string[];
    stepStates: { [key: string]: StepState };
}


export interface StepState {
    id: string;
    name: string;
    isValid: boolean;
    dependencySteps: string[];
}


interface IStepNavigation {
    nextButton: {
        stepId: string;
        isAvailable: boolean;
        isReachable: boolean;
    },
    prevButton: {
        stepId: string;
        isAvailable: boolean;
        isReachable: boolean;
    }
    stepButtons: {
        stepId: string;
        name: string;
        hasValidDependencies: boolean,
        isCurrent: boolean,
        isValid: boolean,
    }[];
};
function registerSteps(state: RootState, steps: StepState[]): RootState {

    const stepOrder: string[] = state.stepOrder && state.stepOrder.length ? [...state.stepOrder, ...steps.map(s => s.id)] : [...steps.map(s => s.id)];

    //todo create a new map! avoid dirty cast
    const stepStates: { [key: string]: StepState } = Object.assign({}, state.stepStates);

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
        stepNavigationStrategy: state.stepNavigationStrategy,
        stepNavigation: null
    };

    const stepNavigation: IStepNavigation = creatStepNavigation(nextState);
    return Object.assign({}, nextState, { stepNavigation });
}


function hasValidDependencies(state: RootState, stepId: string): boolean {
    let valid = true;
    state.stepStates[stepId].dependencySteps.forEach(depStepId => {
        valid = valid && state.stepStates[depStepId].isValid;
    });
    return valid;
}

interface INeighbors {
    hasNext: boolean,
    nextId: string,
    hasPrev: boolean,
    prevId: string
};

/**
 * get the next and prev depending on Reachability of the neighbor
 * so if the dependencySteps are valid to jump in
 */
function getReachableNeighbors(state: RootState = init): INeighbors {



    const currentIndex = state.stepOrder.indexOf(state.currentStepName)

    const upper = state.stepOrder.filter((id, x) => x > currentIndex && hasValidDependencies(state, id));
    const lower = state.stepOrder.filter((id, x) => x < currentIndex && hasValidDependencies(state, id));


    const hasNext = upper.length > 0;
    const hasPrev = lower.length > 0;

    const nextId = hasNext ? upper[0] : null;
    const prevId = hasPrev ? lower[lower.length - 1] : null;

    return {
        hasNext,
        hasPrev,
        nextId,
        prevId
    }
}

/**
 * gets the direct Neighbors of the current step
 */
function getDirectNeighbors(state: RootState = init): INeighbors {

    const hasNext = (state.stepOrder.indexOf(state.currentStepName) + 1) <= state.stepOrder.length - 1;
    const hasPrev = (state.stepOrder.indexOf(state.currentStepName) - 1) >= 0;

    const nextId = hasNext ? state.stepOrder[state.stepOrder.indexOf(state.currentStepName) + 1] : null;
    const prevId = hasPrev ? state.stepOrder[state.stepOrder.indexOf(state.currentStepName) - 1] : null;

    return {
        hasNext,
        hasPrev,
        nextId,
        prevId
    }
}

enum NAVIGATION_STRATEGY {
    DIRECT,
    REACHABLE
}

function creatStepNavigation(state: RootState = init): IStepNavigation {

    const canOnInvalidState = state.stepNavigationStrategy === NAVIGATION_STRATEGY.REACHABLE ? true : false;

    const { hasNext, hasPrev, nextId, prevId } = state.stepNavigationStrategy === NAVIGATION_STRATEGY.DIRECT ? getDirectNeighbors(state) : getReachableNeighbors(state);

    const canNavNext = (state.stepStates[state.currentStepName].isValid || canOnInvalidState) && hasNext && hasValidDependencies(state, nextId);
    const canNavPrev = (state.stepStates[state.currentStepName].isValid || canOnInvalidState) && hasPrev && hasValidDependencies(state, prevId);

    return {
        nextButton: {
            stepId: nextId,
            isAvailable: hasNext,
            isReachable: canNavNext,
        },
        prevButton: {
            stepId: prevId,
            isAvailable: hasPrev,
            isReachable: canNavPrev,
        },
        stepButtons: state.stepOrder.map(stepId => {
            return {
                stepId: stepId,
                name: state.stepStates[stepId].name,
                hasValidDependencies: hasValidDependencies(state, stepId),
                isCurrent: state.currentStepName === stepId,
                isValid: state.stepStates[stepId].isValid
            }
        }),
    };
}


function navigateTo(state: RootState, { stepId }: { stepId: string }): RootState {

    if (state.stepOrder.indexOf(stepId) === -1) {
        return state;
    }

    if (!hasValidDependencies(state, stepId)) {
        console.log("depsAreValid is false");
        return state;
    }

    const nextState = Object.assign({}, state, { currentStepName: stepId });
    const stepNavigation: IStepNavigation = creatStepNavigation(nextState);
    return Object.assign({}, nextState, { stepNavigation });
}

function validateStep(state: RootState): RootState {

    //todo create a new map! avoid dirty cast
    const stepStates: { [key: string]: StepState } = Object.assign({}, state.stepStates);

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
    currentStepName: null,
    stepOrder: [],
    stepStates: {},
    stepNavigationStrategy: NAVIGATION_STRATEGY.REACHABLE, // NAVIGATION_STRATEGY.DIRECT 
    stepNavigation: {
        nextButton: {
            stepId: null,
            isAvailable: false,
            isReachable: false,
        },
        prevButton: {
            stepId: null,
            isAvailable: false,
            isReachable: false,
        },
        stepButtons: []
    }
}

export const rootReducer: ActionReducer<RootState> = (state: RootState = init, action: Action) => {
    switch (action.type) {

        case ACTIONS.STEPS_REGISTER:
            return registerSteps(state, action.payload as StepState[]);

        case ACTIONS.STEPS_GO_NEXT:
            if (!state.stepNavigation.nextButton.isAvailable || !state.stepNavigation.nextButton.isReachable) {
                return state;
            }
            return navigateTo(state, { stepId: state.stepNavigation.nextButton.stepId });

        case ACTIONS.STEPS_GO_PREV:
            if (!state.stepNavigation.prevButton.isAvailable || !state.stepNavigation.prevButton.isReachable) {
                return state;
            }
            return navigateTo(state, { stepId: state.stepNavigation.prevButton.stepId });

        case ACTIONS.STEP_VALIDATE:
            return validateStep(state);

        case ACTIONS.STEPS_GO_STEPID:
            return navigateTo(state, action.payload as { stepId: string });

        default:
            return state;
    }
}