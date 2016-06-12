import './app.store.spec';
import { bootstrap }    from '@angular/platform-browser-dynamic';
import { HTTP_PROVIDERS } from '@angular/http';
import { provideStore } from '@ngrx/store';

import { AppComponent } from './app.component';
import { rootReducer, RootState } from './app.store';


const appState = provideStore({
    root: rootReducer
});


bootstrap(AppComponent, [
    HTTP_PROVIDERS,
    appState,
]);
