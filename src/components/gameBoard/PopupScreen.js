import {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';

import {useSelector, useDispatch} from 'react-redux';
import {update, restartGame} from '../../redux/board';

import shuffle from '../../functions/shuffle';

export default function PopupScreen ({socket}) {
    const state = useSelector(state => state.board);
    const dispatch = useDispatch();
    const flipPlayer = state.hostOrOpp === 'host' ? 'opp' : state.hostOrOpp === 'opp' ? 'host' : undefined;

    const [chosenDeck, setChosenDeck] = useState();
    const [playerCount, setPlayerCount] = useState(0);

    const CardZoom = () => {
        console.log(state.popupScreen);
        return <div className='card-zoom' style={{backgroundImage: state.popupScreen}} />
    }

    const Help = () => {
        return <div className='help'>
            <h1>Controls</h1>
            <p><strong>Left Click -</strong> when you left click a card, that card will be selected and all other currently selected cards will be deselected. If you only have one card selected and you left click that card, the entire zone will be selected.</p>
            <p><strong>Held Left Click -</strong> when you hold left click and drag your cursor over several cards, they will all be added to your current selection.</p>
            <p><strong>Shift + Left Click -</strong> when you shift click a card, it will be added to your current selection.</p>
            <p><strong>Right Click -</strong> when you right click a zone, all cards in your current selection will move to that zone.</p>
            <p>For basic rules on how to play the pokemon trading card game, click <a style={{color: 'rgb(200,255,255)'}} href='https://assets.pokemon.com//assets/cms2/pdf/trading-card-game/rulebook/swsh12_rulebook_en.pdf' target='_blank'>here.</a></p>
        </div>
    };

    const ConcedePrompt = () => {
        const concede = () => {
            dispatch(update(['gamePhase', {...state.gamePhase, [state.hostOrOpp]: 'conceded'}]));
            dispatch(update(['popupScreen', 'post-game']));
        }

        const draw = () => {
            const phase = state.gamePhase[state.hostOrOpp] === 'draw' ? 'ready' : 'draw';

            dispatch(update(['gamePhase', {...state.gamePhase, [state.hostOrOpp]: phase}]));
        }

        const drawBtnText =
        state.gamePhase[state.hostOrOpp] === 'draw' ? 'cancel draw' :
        state.gamePhase[flipPlayer] === 'draw' ? 'accept draw' :
        'offer draw'

        return <>
            <div className='popup-btn btn' onClick={concede}>admit defeat</div>
            <div className='popup-btn btn' onClick={draw}>{drawBtnText}</div>
        </>
    };

    const PostGame = () => {
        const playerDisconnected = state.myGameLog[state.myGameLog.length - 1].message === 'disconnected'
        const headingMessage =
        playerDisconnected ? 'Your opponent has left the match' :
        state.gamePhase[state.hostOrOpp] === 'conceded' ? 'You have admitted defeat' :
        state.gamePhase[flipPlayer] === 'conceded' ? 'Your opponent has admitted defeat' :
        state.gamePhase[state.hostOrOpp] === 'draw' && state.gamePhase[flipPlayer] === 'draw' ? 'the game has ended in a draw' :
        '';

        let rematchMessage = 
        state.gamePhase[state.hostOrOpp] === 'rematch' ? 'rematch requested...' :
        state.gamePhase[flipPlayer] === 'rematch' ? 'accept rematch' :
        'offer rematch';

        const offerRematch = () => {
            dispatch(update(['gamePhase', {...state.gamePhase, [state.hostOrOpp]: 'rematch'}]));
        }


        return <>
            <h1>{headingMessage}</h1>
            {!playerDisconnected && <div className='popup-btn btn' onClick={offerRematch}>{rematchMessage}</div>}
            <Link to='/' className='popup-btn btn' onClick={socket.removeAllListeners}>exit match</Link>
        </>
    }

    const DrawPrompt = () => {

        const draw = () => {
            dispatch(update(['gamePhase', {...state.gamePhase, [state.hostOrOpp]: 'draw'}]));
        };
        return <>
            <h1>Your opponent has offered a draw</h1>
            <div className='popup-btn btn' onClick={draw}>accept draw</div>
        </>
    }

    const closePopup = e => {
        if (state.popupScreen && !e.target.classList.contains('btn')
        && state.popupScreen !== 'post-game') {
            dispatch(update(['popupScreen', undefined]));
        }
    };

    const Disconnected = () => {
        return <>
        <h1>Your opponent has disconnected</h1>
        <Link to='/' className='popup-btn btn' onClick={socket.removeAllListeners}>exit match</Link>
    </>
    }

    useEffect(() => {
        if (state.gamePhase[state.hostOrOpp] === 'conceded'
        || state.gamePhase[flipPlayer] === 'conceded'
        || state.gamePhase[state.hostOrOpp] === 'rematch'
        || state.gamePhase[flipPlayer] === 'rematch'
        || (state.gamePhase.host === 'draw' && state.gamePhase.opp === 'draw')) {
            dispatch(update(['popupScreen', 'post-game']));
        }
        else if (state.gamePhase[flipPlayer] === 'draw') {
            dispatch(update(['popupScreen', 'draw-prompt']));
        }
    }, [state.gamePhase])


    useEffect (() => {
        if (state.gamePhase.host === 'rematch'
        && state.gamePhase.opp === 'rematch') {
            dispatch(restartGame());
            if (state.hostOrOpp === 'host') {
                const turnPlayer = Math.random() > .5 ? 'host' : 'opp'
                dispatch(update(['turnPlayer', turnPlayer]));
                socket.emit('updateTurn', turnPlayer)
            }
        }
    }, [state.gamePhase])


    const ChooseDeck = () => {
        const confirmDeck = () => {
            const deck = chosenDeck.cards.map((e, i) => i);

            const shuffledDeck = shuffle(deck, state, dispatch);
            dispatch(update(['hand', shuffledDeck.slice(0,7), 'bottom']));
            dispatch(update(['prize', shuffledDeck.slice(7,13), 'bottom']));
            dispatch(update(['deck', shuffledDeck.slice(13), 'bottom']));

            dispatch(update(['cardList', chosenDeck.cards, 'bottom']));
        }

        return <>
            <div className='prompt' style={{fontSize: '32px', fontWeight: 'bold', width: 'fit-content'}}>Pick a deck you'd like to play</div>
            <div className='deck-selector'>
                {state.deckChoices.length !== 0 && state.deckChoices.map((e, i) => {
                    const style = chosenDeck && chosenDeck.name === e.name
                    ? {outline: '3px solid white'}
                    : {};
                
                    return <div 
                        className='deck-selection card-sized-slot'
                        style={{...style, backgroundImage: `url(${e.cards[0].url})`}}
                        onClick={() => setChosenDeck(e)}
                        key={'deck-choices-' + i}
                    ></div>
                })}
            </div>
            <button className='match-maker-btn' onClick={confirmDeck}>Enter Game</button>
        </>
    }

    return (
        (state.popupScreen || state.bottom.cardList.length === 0) && <div className='popup-screen' onClick={e => closePopup(e)}>
            {state.popupScreen !== 'post-game' && state.bottom.cardList.length !== 0 && <div className='exit-btn'>x</div>}
            <div className='popup-contents' style={state.bottom.cardList.length === 0 ? {justifyContent: 'start', gap: '20px'} : {}}>
            {
                !state.bottom.cardList.length ? <ChooseDeck /> :
                state.popupScreen === 'disconnected' && state.gamePhase.host === 'post-game' ? <Disconnected /> :
                state.popupScreen.startsWith('url') ? <CardZoom /> :
                state.popupScreen === 'help' ? <Help /> :
                state.popupScreen === 'concede-prompt' ? <ConcedePrompt /> :
                state.popupScreen === 'post-game' ? <PostGame /> :
                state.popupScreen === 'draw-prompt' ? <DrawPrompt /> :
                null                
            }
            </div>       
        </div>
    )
}
