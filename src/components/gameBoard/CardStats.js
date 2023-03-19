import {useSelector, useDispatch} from 'react-redux';
import {update} from '../../redux/board';

import clickCard from '../../functions/clickCard';

export default function CardStats ({arr, cardIndex, cardDisplay, socket, boardSide}) {

    const state = useSelector(state => state.board);
    const dispatch = useDispatch();

    let cardObj = state[boardSide].cardList[cardIndex];
    let width = cardDisplay ? '20px' : '10px';

    let pokemon = arr.filter(e => {
        return state[boardSide].cardList[e].cardType === 'pokemon';
    });
    let energies = arr.filter(e => state[boardSide].cardList[e].cardType === 'energy');
    let tools = arr.filter(e => state[boardSide].cardList[e].cardType === 'tool');

    const pseudoClickCard = event => {
        if (cardDisplay) {
            clickCard(event, cardObj, 0, state.mySelected.currentZone, socket, boardSide, state, dispatch);
        }
    }

    const changeHp = e => {
        if (state.mySelected.boardSide === 'bottom') {
            let array = state[boardSide].cardList.map(e => ({...e}));
            const inputVal = +e.target.value;
            const damage = cardObj.hp - inputVal;

            state[boardSide][state.mySelected.currentZone].forEach(e => {
                if (array[e].hp) array[e].damage = damage
            })
            dispatch(update(['cardList', array, boardSide]));    
        }
    }

    const changeHpArrows = e => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            
            let increment = 0;       
            if (e.key === 'ArrowUp') {
                increment = -10;
            }
            else if (e.key === 'ArrowDown') {
                increment = 10;
            }
    
            let array = state[boardSide].cardList.map(e => ({...e}));
            const inputVal = +e.target.value;
            const damage = cardObj.hp - inputVal + increment;
    
            state[boardSide][state.mySelected.currentZone].forEach(e => {
                if (array[e].hp) array[e].damage = damage
            })
            dispatch(update(['cardList', array, boardSide]));    
        }        
    }

    return (
        <div className='card-stats'>
                <div className='evolutions stat'
                onMouseDown={e => pseudoClickCard(e)}
                style={pokemon.length > 1 ? {visibility: 'visible'} : cardDisplay ? {display: 'none'} : {}}>
                    <span>{pokemon.length - 1}</span>
                    <svg width={width} height={width} viewBox='0 0 100 100'>
                        <polyline points='50,10 80,50 60,50 60,90 40,90 40,50 20,50 50,10' fill='black'/>
                    </svg>
                </div>
                <div className='energies stat'
                onMouseDown={e => pseudoClickCard(e)}
                style={energies.length > 0 ? {visibility: 'visible'} : cardDisplay ? {display: 'none'} : {}}>
                    {energies.length > 0 && <>
                        <span>{energies.length}</span>
                        <svg width={width} height={width} viewBox='0 0 100 100'>
                            <path d='
                                M50,0
                                Q50,50 93.301,25
                                Q50,50 93.301,75
                                Q50,50 50,100
                                Q50,50 6.699,75
                                Q50,50 6.699,25
                                Q50,50 50,0
                            ' fill='black'  stroke='black'/>
                        </svg>
                    </>}
                </div>
                <div className='tools stat' 
                onMouseDown={e => pseudoClickCard(e)}
                style={tools.length > 0 ? {visibility: 'visible'} : cardDisplay ? {display: 'none'} : {}}>
                    {tools.length > 0 && <>
                        <span>{tools.length}</span>
                        <svg width={width} height={width}  viewBox='0 0 100 100'>
                            <path d='
                                M40,10
                                L42,10
                                L42,35
                                L58,35
                                L58,10
                                L60,10
                                Q95,35 60,60
                                L60,90
                                A15,15 0, 0,1 40,90                               
                                L40,60
                                Q5,35 40,10
                            ' fill='black'/>
                        </svg>
                    </>}
                </div>
                {cardObj && 
                <div className='hp stat' style={cardObj && cardObj.hp ? {visibility: 'visible'} : cardDisplay ? {display: 'none'} : {}}>
                    <input
                        className='hp-input'
                        value={cardObj.hp ? cardObj.hp - cardObj.damage : ''}
                        onChange={changeHp}
                        onKeyDown={changeHpArrows}
                    />
                    <div>HP</div>
                </div>}
                {cardDisplay && <div className='zone-count'><span>Count: {arr.length}</span></div>}
            </div>
    )
}