import {createSlice} from '@reduxjs/toolkit';

const template = {
    cardList: [],
    deck: [],
    hand: [],
    discard: [],
    lost: [],
    prize: [],
    active: [],
    bench1: [],
    bench2: [],
    bench3: [],
    bench4: [],
    bench5: [],
    field: [],
    conditions: {poisoned: false, burned: false, asleep: false, confused: false, paralyzed: false},
    chatImages: [],
    deckSearch: {topOrBottom: 'Top', count: 0, view: false},
    showPrize: []
}

export const boardSlice = createSlice({
    name: 'board',
    initialState: {
        roomId: undefined,
        hostOrOpp: undefined,
        popupScreen: undefined,
        gamePhase: {host:'setup', opp: 'setup'},
        turnPlayer: 0,
        mySelected: {cards: {}, currentZone: '', boardSide: ''},
        theirSelected: {cards: {}, currentZone: '', boardSide: ''},
        myGameLog: [],
        theirGameLog: [],
        top: {...template},
        bottom: {...template},
        deckChoices: [],
        hoverIndex: undefined,
        heldClick: false,
        coinFlip: undefined,
        narrowScreen: false
    },
    reducers: {
        update: (state, action) => {
            const [name, data, boardSide] = action.payload;
            
            if (boardSide) {
                state[boardSide][name] = data;
            }
            else state[name] = data;
            
        },
        clearSelected: state => {
            state.mySelected = {cards: {}, currentZone: '', boardSide: ''};
        },
        restartGame: state => {
            state.popupScreen = undefined;
            state.gamePhase = {host:'setup', opp: 'setup'};
            state.turnPlayer = undefined;
            state.mySelected = {cards: {}, currentZone: '', boardSide: ''};
            state.theirSelected = {cards: {}, currentZone: '', boardSide: ''};
            state.myGameLog = [];
            state.theirGameLog = [];
            state.top = {...template};
            state.bottom = {...template};
            state.hoverIndex = undefined;
            state.heldClick = false;
            state.coinFlip = undefined;
        }
    }
});

export const {update, clearSelected, restartGame} = boardSlice.actions;

export default boardSlice.reducer;