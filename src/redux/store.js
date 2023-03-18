import {configureStore} from '@reduxjs/toolkit';
import boardReducer from './board';

export default configureStore({
    reducer: {
        board: boardReducer
    }
});