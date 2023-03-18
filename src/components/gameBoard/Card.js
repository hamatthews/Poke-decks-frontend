import CardStats from './CardStats';
import DeckBtns from './DeckBtns';
import PrizeBtns from './PrizeBtns';
import CardZoomBtn from './CardZoomBtn';
import clickCard from '../../functions/clickCard';

import {useSelector, useDispatch} from 'react-redux';
import {update, clearSelected} from '../../redux/board';

export default function Card ({zone, arr, cardIndex, index, socket, cardDisplay, boardSide}) {
    const state = useSelector(state => state.board);
    const dispatch = useDispatch();

    let cardObj = state[boardSide].cardList[cardIndex];
    let className = 'card-sized-slot';
    let style = {};
    let tabIndex;
    const extended = zone === 'discard' || zone === 'lost' || zone === 'deck' || arr.length > 9 || state[boardSide].chatImages.length > 9;

    if (cardDisplay && !extended) className += ' large-card'

    if (zone === state.mySelected.currentZone) {
        let focusIndex = state.hoverIndex !== undefined
        ? state.hoverIndex
        : state.mySelected.cards[zone]
        ? state[boardSide][zone].indexOf(state.mySelected.cards[zone][state.mySelected.cards[zone].length - 1])
        : undefined;
    
        if (index === focusIndex) {
            style = (cardDisplay && !extended)
            ? {
                ...style,
                height: '273px',
                flexShrink: '0'
            }
            : {
                ...style,
                width: '62.5px'
            }
        }
        else if (((zone === 'hand' || zone === 'prize') && index > focusIndex)
        || ((zone !== 'hand' && zone !== 'prize') && index < focusIndex)) {
            style = (cardDisplay && !extended)
            ? {
                ...style,
                flexShrink: '1',
                backgroundPosition: 'bottom'
            }
            : {
                ...style,
                backgroundPosition: 'right'
            }    
        }
    }

    // set justify-self to start on the right row of prize cards
    if (zone === 'prize' && index % 2 !== 0) {
        style.justifySelf = 'start';
    }

    if (!cardDisplay && !state.mySelected.cards.hand && zone === 'hand' && index === state[boardSide].hand.length - 1) {
        style.width = '62.5px';
    }

    // sets the style for the empty space in the hand and prize zones where you're able to place a card
    if ((zone === 'hand' || zone === 'prize') && cardObj === undefined) {
        style.position = 'absolute';
        style.height = '100%';
        style.boxShadow = 'none';

        if (zone === 'hand' && document.querySelector('.hand')) {
            style.width = `${document.querySelector('.hand').clientWidth}px`;
            style.maxWidth = `${document.querySelector('.hand').clientWidth}px`;
        }
        else if (zone === 'prize' && document.querySelector('.prize')) {
            style.width = `${document.querySelector('.prize').clientWidth}px`;
            style.maxWidth = `${document.querySelector('.prize').clientWidth}px`;
        }

    }   

    // determines whether a card is displayed facedown or faceup
    if (cardObj) {
        className += ' card';
        tabIndex = '0';

        if (boardSide === 'bottom' && (zone === 'deck' && !state[boardSide].deckSearch.view) || (zone === 'prize' && !state[boardSide].showPrize[index])
        || (boardSide === 'top' && (zone === 'hand' || zone === 'deck' || zone === 'prize'
        || state.gamePhase.host === 'setup' || state.gamePhase.opp === 'setup'))) {
            className += ' card-back'
            style.backgroundImage = 'url(https://pokemoncards.com.au/wp-content/uploads/2019/12/pocket-monster-early-card.jpg)'; 
        }        
        else {
            style.backgroundImage = `url(${cardObj.url})`;    
        }

        // selection shadows
        const myHighlight = state.hostOrOpp === 'host' ? 'rgb(150,150,255)' : state.hostOrOpp === 'opp' ? 'rgb(255,150,150)' : undefined;
        const theirHighlight = state.hostOrOpp === 'host' ? 'rgb(255,150,150)' : state.hostOrOpp === 'opp' ? 'rgb(150,150,255)' : undefined;

        const allCards = selected => {
            return Object.values(selected.cards).reduce((a, b) => a.concat(b), [])
        }

        if (boardSide === state.mySelected.boardSide
            && boardSide === state.theirSelected.boardSide
            && allCards(state.mySelected).includes(cardIndex)
            && allCards(state.theirSelected).includes(cardIndex)) {
            style.boxShadow = ` inset 7.5px 0 0 -2.5px ${myHighlight}, inset 0 7.5px 0 -2.5px ${myHighlight},
            inset 0 -7.5px 0 -2.5px ${theirHighlight}, inset -7.5px 0 0 -2.5px ${theirHighlight}`;
        }
        else if (boardSide === state.mySelected.boardSide
        && allCards(state.mySelected).includes(cardIndex)) {
            style.boxShadow = `inset 0 0 0 5px ${myHighlight}`;
        }
        else if (boardSide === state.theirSelected.boardSide
        && allCards(state.theirSelected).includes(cardIndex)) {
            style.boxShadow = `inset 0 0 0 5px ${theirHighlight}`;
        }                            
    }

    const hover = e => {
        if (zone !== state.mySelected.currentZone || !cardObj) return;

        if (e.type === 'mouseenter') {
            dispatch(update(['hoverIndex', index]))
        }
        else dispatch(update(['hoverIndex', undefined]));
    }

    const dragSelect = e => {
        if (state.heldClick) {
            clickCard(e, cardObj, index, zone, socket, boardSide, state, dispatch);
        }
    }

    return (
        <div
        className={className}
        style={style} tabIndex={tabIndex}
        onMouseEnter={e => {hover(e); dragSelect(e)}}
        onMouseLeave={hover}
        onMouseDown={e => clickCard(e, cardObj, index, zone, socket, boardSide, state, dispatch)}
        >
            {((cardObj && state.gamePhase.host !== 'setup' && state.gamePhase.opp !== 'setup') || boardSide === 'bottom') && !cardDisplay
            && (zone === 'active' || zone.startsWith('bench')) && <CardStats {...({arr, cardIndex, zone, cardDisplay, boardSide})}/>}
            {zone === 'deck' && boardSide === 'bottom' && <DeckBtns {...({boardSide})}/>}
            {zone === 'prize' && boardSide === 'bottom' && <PrizeBtns {...({index, boardSide})}/>}
            {cardObj && !className.includes('card-back')
            && <CardZoomBtn image={style.backgroundImage}/>}
        </div>
    )
}