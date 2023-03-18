import {useState, useEffect} from 'react';
import shuffle from '../../functions/shuffle';

import {useSelector, useDispatch} from 'react-redux';
import {update, clearSelected} from '../../redux/board';

export default function DeckBtns ({boardSide}) {  
    
    let state = useSelector(state => state.board);
    const dispatch = useDispatch();
    const curr = state.mySelected.currentZone;

    const time = Date.now();

    const inputHighlight = e => {
        if (e.shiftKey && !(e.type === 'click' || curr)) return;

        e.target.select();
    };
    
    const changeSearchCount = (e) => {
        let value = e.target.value;
        if (+value > state[boardSide].deck.length) value = state[boardSide].deck.length;
        else if (+value < 0) value = 0;

        dispatch(update(['deckSearch', {...state[boardSide].deckSearch, count: value}, boardSide]))
        dispatch(update(['mySelected', {...state.mySelected, cards: {...state.mySelected.cards, deck: state[boardSide].deck.slice(0, +value)}}]))

        if (state[boardSide].deckSearch.view) {
            const newTopOrBottom = e ? state[boardSide].deckSearch.topOrBottom : state[boardSide].deckSearch.topOrBottom === 'Top' ? 'Bottom' : 'Top';
            const message = value === state[boardSide].deck.length ? 'viewed their deck.'
            : `viewed ${value} card${value > 1 ? 's' : ''} from ${newTopOrBottom.toLowerCase()} of deck.`

            const payload = (state.myGameLog[state.myGameLog.length - 1].viewCount
            && state.myGameLog[state.myGameLog.length - 1].viewCount <= value
            && time - state.myGameLog[state.myGameLog.length - 1].time < 10000)
            ? [...state.myGameLog.slice(0, -1), {time, message, messageType: 'game', viewCount: value, hostOrOpp: state.hostOrOpp}]
            : [...state.myGameLog, {time, message, messageType: 'game', viewCount: value, hostOrOpp: state.hostOrOpp}]
            
            dispatch(update(['myGameLog', payload]));
        };
    };


    const toggleTopOrBottom = e => {
        if (e.shiftKey) return;
        dispatch(update(['mySelected', {...state.mySelected, cards: {...state.mySelected.cards, deck: [...state[boardSide].deck].reverse()}}]))

        dispatch(update(['deck', [...state[boardSide].deck].reverse(), boardSide]));
        const newTopOrBottom = state[boardSide].deckSearch.topOrBottom === 'Top' ? 'Bottom' : 'Top';
        dispatch(update(['deckSearch', {...state[boardSide].deckSearch, topOrBottom: newTopOrBottom}, boardSide]));
    };

    const viewCards = e => {
        if (!state[boardSide].deckSearch.view) {
            const message = state[boardSide].deckSearch.count === state[boardSide].deck.length ? 'viewed their deck.'
            : `viewed ${state[boardSide].deckSearch.count} card${state[boardSide].deckSearch.count > 1 ? 's' : ''} from ${state[boardSide].deckSearch.topOrBottom.toLowerCase()} of deck.`
            dispatch(update(['myGameLog', [...state.myGameLog, {time, message, messageType: 'game', viewCount: state[boardSide].deckSearch.count, hostOrOpp: state.hostOrOpp}]]));
        }
        else dispatch(clearSelected());

        dispatch(update(['deckSearch', {...state[boardSide].deckSearch, view: !state[boardSide].deckSearch.view}, boardSide]));
    };

    const drawCard = e => {
        if (e.shiftKey || !state[boardSide].deck.length) return;

        dispatch(update(['hand', [...state[boardSide].hand, state[boardSide].deck[0]], boardSide]));
        dispatch(update(['deck', state[boardSide].deck.slice(1), boardSide]));
        if (state[boardSide].deckSearch.count > 0) {
            dispatch(update(['deckSearch', {...state[boardSide].deckSearch, count: state[boardSide].deckSearch.count - 1}, boardSide]));
        }
        if (state[boardSide].deck.length > 1) {
            dispatch(update(['mySelected', {cards: {...state.mySelected.cards, deck: [state[boardSide].deck[1]]}, currentZone: 'deck', boardSide}]))
        }
        else dispatch(clearSelected());


        const time = Date.now();
        let drawCount = 1;

        if (state.myGameLog.length && state.myGameLog[state.myGameLog.length - 1].drawCount
        && time - state.myGameLog[state.myGameLog.length - 1].time < 10000) {
            drawCount = state.myGameLog[state.myGameLog.length - 1].drawCount + 1;
        }

        let message = `drew ${drawCount} card${drawCount > 1 ? 's': ''} from ${state[boardSide].deckSearch.topOrBottom.toLowerCase()} of deck.`
        const payload = drawCount > 1 && time - state.myGameLog[state.myGameLog.length - 1].time < 10000
            ? [...state.myGameLog.slice(0, -1), {time, message, messageType: 'game', drawCount, hostOrOpp: state.hostOrOpp}]
            : [...state.myGameLog, {time, message, messageType: 'game', drawCount, hostOrOpp: state.hostOrOpp}]
            
        dispatch(update(['myGameLog', payload]));
    }

    const shuffleDeck = e => {
        if (e.shiftKey || !state[boardSide].deck.length) return;
        dispatch(update(['deck', shuffle(state[boardSide].deck, state, dispatch, e), boardSide]));

        const message = `shuffled their deck.`
        dispatch(update(['deckSearch', {...state[boardSide].deckSearch, view: false}, boardSide]));
        dispatch(update(['myGameLog', [...state.myGameLog, {time, message, messageType: 'game', hostOrOpp: state.hostOrOpp}]]));
    }

    if (state[boardSide].deckSearch.view && curr !== 'deck') {
            dispatch(update(['deckSearch', {...state[boardSide].deckSearch, view: false}, boardSide]))
        };

    const toggled = {
        borderWidth: '2px',
        borderStyle: 'inset',
        borderColor: 'rgb(118, 118, 118) rgb(133, 133, 133) rgb(133, 133, 133) rgb(118, 118, 118)',
        borderImage: 'initial',
        background: 'transparent'
    }

    if (curr === 'deck') return (
        <div
        className='deck-btns btns'
        // onContextMenu={changeSearchCount}
        >
            <div className='draw deck-btn btn' onClick={e => drawCard(e)}>Draw</div> 
            <div className='shuffle deck-btn btn' onClick={e => shuffleDeck(e)}>Shuffle</div>
            <div className='top deck-btn deck-btn-toggle btn' onClick={e => toggleTopOrBottom(e)} style={state[boardSide].deckSearch.topOrBottom === 'Top' ? toggled : {}}>Top</div>
            <div className='bottom deck-btn deck-btn-toggle btn' onClick={e => toggleTopOrBottom(e)} style={state[boardSide].deckSearch.topOrBottom === 'Bottom' ? toggled : {}}>Bottom</div>
            <input 
                className='count deck-btn btn'
                type='number'
                value={state[boardSide].deckSearch.count}
                onChange={e => changeSearchCount(e)}
                onMouseEnter={e => inputHighlight(e)}
                onClick={e => {inputHighlight(e); /*changeSearchCount(e)*/}}
            ></input>
            <div className='view deck-btn btn' onClick={e => viewCards(e)}>{state[boardSide].deckSearch.view ? 'Hide' : 'View'}</div>
        </div>
    )
}