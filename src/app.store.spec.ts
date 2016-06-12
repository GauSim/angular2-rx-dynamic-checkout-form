import { rootReducer, init } from './app.store';
import { provideStore } from '@ngrx/store';

// mocha here!

function tests() {

    //it
    const state = rootReducer(init, { type: null });
    console.log(JSON.stringify(state) === JSON.stringify(init));

}

tests(); 