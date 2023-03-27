import {useState, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {useNavigate} from 'react-router-dom';
import './matchMaker.css';

import CardZoomBtn from '../../components/gameBoard/CardZoomBtn';
import Background from '../../components/Background/Background';
import {update, restartGame} from '../../redux/board';

import decks from '../../decks.json';

export default function MatchMaker () {
    const state = useSelector(state => state.board);
    const dispatch = useDispatch();

    const navigate = useNavigate();

    const screenVisible = `
        .match-maker {
            opacity: 1;
            pointer-events: auto;
        }
    `
    const screenHidden = `
        .match-maker {
            opacity: 0;
            pointer-events: none;
        }
    `
    const [chosenDeck, setChosenDeck] = useState();
    const [visibility, setVisibility] = useState(screenHidden);
    const [inputId, setInputId] = useState();
    const randomId = 10000 + Math.floor(Math.random()*10000);

    useEffect(() => {
        // if (state.deckChoices.length) {
        //     dispatch(restartGame());
        // }

        // // gets deck choices from db
        // fetch('https://poke-decks-backend.onrender.com/api/decks', {
        //     method: 'GET',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     }
        // })
        // .then(response => response.json())
        // .then(data => dispatch(update(['deckChoices', data])));
        dispatch(update(['deckChoices', decks]));
    }, [])

    useEffect(() => {
            setVisibility(screenVisible);
    }, []);

    const startNewGame = () => {
        if (chosenDeck) {
            const deck = chosenDeck.cards.map((e, i) => i);

            dispatch(update(['cardList', chosenDeck.cards, 'bottom']));
            dispatch(update(['deck', deck, 'bottom']));
    
            document.querySelector('.match-maker').style.transition = 'opacity .2s .5s';
            setVisibility(screenHidden);
            navigate(`/${randomId}`)
        }
    }

    const startExistingGame = () => {
        if (inputId) {
            document.querySelector('.match-maker').style.transition = 'opacity .2s .5s';
            setVisibility(screenHidden);
        
            setTimeout(() => {
                navigate(`/${inputId}`)
            }, 1000);
        }
    }
    
    const ImagePopup = () => {
        return <div className='popup-screen' onClick={closePopup}>
            <div className='exit-btn'>x</div>
            <div className='popup-contents'>
                <div className='card-zoom' style={{backgroundImage: state.popupScreen}} />
            </div>
        </div>
    }

    const closePopup = e => {
        dispatch(update(['popupScreen', undefined]));
    };

    return (
        <>
            <Background />
            {state.popupScreen && <ImagePopup/>}
            <style>{visibility}</style>
            <div className='match-maker'>
                <div className='new-game'>
                    <h1>Start a New Game</h1>
                    <div className='prompt'>Pick a deck you'd like to play.</div>
                    <div className='deck-selector'>
                        {state.deckChoices.length > 0 && state.deckChoices.map((e, i) => {
                            
                            const style = chosenDeck && chosenDeck.name === e.name
                            ? {outline: '3px solid white'}
                            : {};
                            return <div 
                                className='deck-selection card-sized-slot'
                                style={{...style, backgroundImage: `url(${e.cards[0].url})`}}
                                onClick={() => setChosenDeck(e)}
                                key={'deck-choices-' + i}
                            ><CardZoomBtn image={`url(${e.cards[0].url})`}/></div>
                        })}
                    </div>
                    <button className='match-maker-btn' onClick={startNewGame}>Enter Game</button>
                </div>
                <div className='ongoing-game'>
                    <h1>Join an Existing Game</h1>
                    <div className='prompt'>Enter the code to your room.</div>
                    <input onChange={e => setInputId(e.target.value)} value={inputId} className='match-maker-input'/>
                    <br />
                    <button className='match-maker-btn' onClick={startExistingGame}>Enter Game</button>
                </div>
            </div>
        </>
    )
}