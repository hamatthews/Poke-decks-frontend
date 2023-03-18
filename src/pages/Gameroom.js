import {useState, useEffect} from 'react';
import io from 'socket.io-client';


import {useSelector, useDispatch} from 'react-redux';
import {update, clearSelected} from '../redux/board';
import {useNavigate} from 'react-router-dom';

import Background from '../components/Background/Background';
import PlayerBoard from '../components/gameBoard/PlayerBoard';
import PopupScreen from '../components/gameBoard/PopupScreen';

import shuffle from '../functions/shuffle';

export default function Gameroom () {

    const screenVisible = `
        .board-container {
            opacity: 1;
            pointer-events: auto;
        }
        .active, .bench, .prize, .buttons, .stat-display, .lost, .discard, .hand, .deck, .field, .popup-screen {
            opacity: 1;
        }
        .card-display, .chat {
            margin: 0;
            opacity: 1;
        }
    `
    const screenHidden =  `
        .board-container {
            opacity: 0;
            pointer-events: none;
        }
        .active, .bench, .prize, .buttons, .stat-display, .lost, .discard, .hand, .deck, .field, .popup-screen {
            opacity: 0;
        }
        .card-display, .chat {
            margin: 288px 0;
            opacity: 0;
        }
    `

    let state = useSelector(state => state.board);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [visibility, setVisibility] = useState(screenHidden);
    const [socket, setSocket] = useState();

    const ENDPOINT = 'http://localhost:8000';
    
    useEffect(() => {
        if (!state.deckChoices.length) {
            fetch('http://localhost:8000/api/decks', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => dispatch(update(['deckChoices', data])))
        }
        
        const url = window.location.href;
        const urlParts = url.split('/');
        const id = urlParts[urlParts.length - 1];
        dispatch(update(['roomId', id]));

        dispatch(update(['turnPlayer', Math.random() > .5 ? 'host' : 'opp']));

        const tempSock = io(ENDPOINT);

        tempSock.emit('connectPlayer', id);

        tempSock.on('routeToMatchMaker', () => {
            navigate('../');
        });

        tempSock.on('updateTurn', data => {
            dispatch(update(['turnPlayer', data]));            
        })

        tempSock.on('initializePlayer', payloadObj => {
            if (payloadObj) {
                let data = JSON.parse(payloadObj);
            
                dispatch(update(['top', data.bottom]));
                dispatch(update(['bottom', data.top]));
                dispatch(update(['hostOrOpp', data.hostOrOpp === 'host' ? 'opp' : data.hostOrOpp === 'opp' ? 'host' : undefined]));
                dispatch(update(['myGameLog', data.theirGameLog]));
                dispatch(update(['theirGameLog', data.myGameLog]));
                dispatch(update(['gamePhase', data.gamePhase]));
                dispatch(update(['turnPlayer', data.turnPlayer]));
                dispatch(update(['deckChoices', data.deckChoices]));

                const flipSide = (side) => {
                    return side === 'top' ? 'bottom' : side === 'bottom' ? 'top' : undefined;
                };
                
                dispatch(update(['mySelected', {...data.theirSelected, boardSide: flipSide(data.theirSelected.boardSide)}]));
                dispatch(update(['theirSelected', {...data.mySelected, boardSide: flipSide(data.mySelected.boardSide)}]));
            }
            else dispatch(update(['hostOrOpp', 'host']));
       
        });
        setSocket(tempSock);

        setTimeout(() => {
            setVisibility(screenVisible);
        }, 100)

        if (!state.dexOpened) {
            dispatch(update(['dexOpened', true]))
        }

        if (state.bottom.deck.length) {
            const shuffledDeck = shuffle(state.bottom.deck, state, dispatch);
            dispatch(update(['hand', shuffledDeck.slice(0,7), 'bottom']));
            dispatch(update(['prize', shuffledDeck.slice(7,13), 'bottom']));
            dispatch(update(['deck', shuffledDeck.slice(13), 'bottom']));
        }

        dispatch(update(['narrowScreen', window.innerWidth <= 1040 ? true : false]))
    }, [])


    const holdClick = e => {
        if (e.button === 0) {
            if (e.type === 'mousedown' && (e.target.classList.contains('card') || e.target.classList.contains('prize-btns'))) {
                dispatch(update(['heldClick', true]));       
            }
            else if (e.type === 'mouseup' && state.heldClick) {
                dispatch(update(['heldClick', false]));
            }
        }

        if (e.target.localName !== 'textarea') {
            e.preventDefault();
        }
    }

    useEffect(() => {
        if (state.mySelected.currentZone === 'deck') {
            dispatch(update(['deckSearch', {...state.bottom.deckSearch, count: state.bottom.deck.length}, 'bottom']));
        }
    }, [state.mySelected.currentZone])     


    useEffect(() => {
        const resizeListener = () => {
            if (window.innerWidth <= 1040 && !state.narrowScreen) {
                dispatch(update(['narrowScreen', true]))
            }
            else if ((window.innerWidth > 1040 && state.narrowScreen)) {
                dispatch(update(['narrowScreen', false]))
            }   
        };

        window.addEventListener('resize', resizeListener);
    
        return () => {
        window.removeEventListener('resize', resizeListener);
        }
    });


    if (state.hostOrOpp && socket) {
        console.log(state)

        return (
            <>
                <style>{visibility}</style>
                <Background page='gameroom'/>
                <div className='board-container'
                onMouseDown={e => holdClick(e)}
                onMouseUp={e => holdClick(e)}
                >
                    <PlayerBoard boardSide='top' {...({socket})}/>
                    <PlayerBoard boardSide='bottom' {...({socket})}/>
                    <PopupScreen socket={socket}/>
                </div>
            </>
        );
    }
};