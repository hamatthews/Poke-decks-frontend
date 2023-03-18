import {useState, useEffect} from 'react';

import Zone from './Zone';
import ActiveZone from './ActiveZone';
import BenchZone from './BenchZone';
import Card from './Card';
import CardDisplay from './CardDisplay';
import Chat from './Chat';
import Buttons from './Buttons'
import StatDisplay from './StatDisplay';
import './game-board.css';

import {useSelector, useDispatch} from 'react-redux';
import {update, clearSelected} from '../../redux/board';

export default function PlayerBoard ({boardSide, socket}) {    

    let state = useSelector(state => state.board);
    const dispatch = useDispatch();

    // highlights hp-input when active or bench pokemon is selected
    useEffect(() => {
        if (state.mySelected.currentZone) {
            if (state.mySelected.currentZone === 'active') {
                const hpInput = document.querySelector('.bottom.active .hp-input');
                hpInput.select();
                hpInput.focus();
            }
            else if (state.mySelected.currentZone.startsWith('bench')) {
                const benchNumber = +state.mySelected.currentZone.slice(-1) - 1;
                const cardSlot = document.querySelectorAll('.bottom.bench .card-sized-slot')[benchNumber];
                const hpInput = cardSlot.querySelector('.hp-input');
                hpInput.select();
                hpInput.focus();
            }
            else document.querySelectorAll('.bottom .hp-input').forEach(e => e.blur());  
        }
    }, [state.mySelected])

    // reverts cardList[i].currentHp to starting hp value when pokemon is removed from active/bench
    useEffect (() => {
        state[boardSide].cardList.forEach((e, i) => {
            if (!state[boardSide].active.concat(state[boardSide].bench1, state[boardSide].bench2, state[boardSide].bench3, state[boardSide].bench4, state[boardSide].bench5).includes(i)) {
                let array = state[boardSide].cardList.map(e => ({...e}));
                array[i].currentHp = array[i].hp;
                dispatch(update(['cardList', array, boardSide]))
            }
        })
    }, [state[boardSide].active.length, state[boardSide].bench1.length, state[boardSide].bench2.length, state[boardSide].bench3.length, state[boardSide].bench4.length, state[boardSide].bench5.length])

    // updates conditions when active pokemon changes
    useEffect (() => {
        dispatch(update(['conditions', {poisoned: false, burned: false, asleep: false, confused: false, paralyzed: false}, boardSide]))

    }, [state[boardSide].active.filter(e => state[boardSide].cardList[e].cardType === 'pokemon').length])
    useEffect(() => {
        if (!state[boardSide].active.length) {
            dispatch(update(['conditions', {poisoned: false, burned: false, asleep: false, confused: false, paralyzed: false}, boardSide]))
        }
    }, [state[boardSide].active]);

    // sends initData to other player when they join
    useEffect(() => {
        const returnData = () => {
            if (boardSide === 'bottom') {
                const time = Date.now();
                const flipPlayer = state.hostOrOpp === 'host' ? 'opp' : state.hostOrOpp === 'opp' ? 'host' : undefined; 

                dispatch(update(['myGameLog', [...state.myGameLog, {time, message: 'connected', messageType: 'game', hostOrOpp: flipPlayer}]]));
                socket.emit('returnData', JSON.stringify({...state}));    
            }
        };
        socket.on('requestData', returnData);

        const disconnected = () => {
            if (boardSide === 'bottom') {
                const time = Date.now();
                const flipPlayer = state.hostOrOpp === 'host' ? 'opp' : state.hostOrOpp === 'opp' ? 'host' : undefined; 

                dispatch(update(['myGameLog', [...state.myGameLog, {time, message: 'disconnected', messageType: 'game', hostOrOpp: flipPlayer}]]));    
            }
        }
        socket.on('disconnected', disconnected)
        
        return () => {
            socket.off('requestData', returnData);
            socket.off('disconnected', disconnected);
        }
    })

    // updates myBoard when theirBoard changes
    useEffect(() => {
        socket.on('theirBoardChange', payload => {
            console.log('theirBoardChange')

            if (boardSide === 'top') return;
            const data = JSON.parse(payload);

            const flipSide = data.mySelected.boardSide === 'bottom' ? 'top' : data.mySelected.boardSide === 'top' ? 'bottom' : undefined;
            dispatch(update(['top', {...state[boardSide], ...data.bottom}]));
            dispatch(update(['theirSelected', {...data.mySelected, boardSide: flipSide}]));
            dispatch(update(['theirGameLog', data.myGameLog]));
            dispatch(update(['gamePhase', data.gamePhase]));
        });

        dispatch(update(['deckSearch', {...state[boardSide].deckSearch, count: state[boardSide].deck.length}, boardSide]));
    }, []);

    // updates theirBoard when myBoard changes
    useEffect(() => {
        if (boardSide === 'top') return;
        console.log('myBoardChange')
        socket.emit('myBoardChange', JSON.stringify(state));
    }, [state[boardSide].cardList, state[boardSide].deck, state[boardSide].hand, state[boardSide].discard, state[boardSide].lost, state[boardSide].prize, state[boardSide].active, state[boardSide].bench1, state[boardSide].bench2, state[boardSide].bench3, state[boardSide].bench4, state[boardSide].bench5, state[boardSide].field, state.myGameLog, state.mySelected, state[boardSide].conditions, state.gamePhase[state.hostOrOpp]]);

    useEffect(() => {
        socket.on('clearMySelected', () => {
            dispatch(clearSelected());
        })

        return () => socket.off('clearMySelected');
    }, [])

    return state.roomId && <>
        {boardSide === 'bottom' && <Chat {...({socket, boardSide})}/>}
        {boardSide === 'bottom' && !state.narrowScreen && <CardDisplay zone={state.mySelected.currentZone} {...({socket, boardSide})} arr={state.mySelected.boardSide ? state[state.mySelected.boardSide][state.mySelected.currentZone] : []}/>} 
        <ActiveZone {...({socket, boardSide})} arr={state[boardSide].active}/>
        <BenchZone {...({socket, boardSide})} benchArr={[state[boardSide].bench1, state[boardSide].bench2, state[boardSide].bench3, state[boardSide].bench4, state[boardSide].bench5]}/>
        <Zone zone={'prize'} {...({socket, boardSide})} arr={state[boardSide].prize}/>
        <Zone zone={'lost'} {...({socket, boardSide})} arr={state[boardSide].lost}/>
        <Zone zone={'discard'} {...({socket, boardSide})} arr={state[boardSide].discard}/>
        <Zone zone={'hand'} {...({socket, boardSide})} arr={state[boardSide].hand}/>
        <Zone zone={'deck'} {...({socket, boardSide})} arr={state[boardSide].deck}/>
        <Zone zone={'field'} {...({socket, boardSide})} arr={state[boardSide].field}/>
        {boardSide === 'bottom' && <Buttons {...({socket, boardSide})}/>}
        {boardSide === 'top' && <StatDisplay {...({socket})}/>}
    </>
}