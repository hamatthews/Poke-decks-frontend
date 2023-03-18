/* gives you the option to either pick a deck and start
a new match, or to enter in the id for an ongoing match */
import {useState, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {useNavigate} from 'react-router-dom';
import './matchMaker.css';

import Background from '../../components/Background/Background';
import {update, restartGame} from '../../redux/board';

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
    // const [deckChoices, setDeckChoices] = useState([]);
    const [chosenDeck, setChosenDeck] = useState();
    const [visibility, setVisibility] = useState(screenHidden);
    const [inputId, setInputId] = useState();
    const randomId = 10000 + Math.floor(Math.random()*10000);

    useEffect(() => {
        if (state.deckChoices.length) {
            dispatch(restartGame());
        }

        // gets deck choices from db
        fetch('http://localhost:8000/api/decks', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => dispatch(update(['deckChoices', data])));
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
            navigate(`/poké-decks/${randomId}`)
        }
    }

    const startExistingGame = () => {
        if (inputId) {
            document.querySelector('.match-maker').style.transition = 'opacity .2s .5s';
            setVisibility(screenHidden);
        
            setTimeout(() => {
                navigate(`/poké-decks/${inputId}`)
            }, 1000);
        }
    }
    
    return (
        <>
            <Background />
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
                            ></div>
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