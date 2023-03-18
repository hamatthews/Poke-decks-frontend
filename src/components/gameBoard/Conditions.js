import {useSelector, useDispatch} from 'react-redux';
import {update, clearSelected} from '../../redux/board';

import RenderArray from './RenderArray';

export default function Conditions({arr, socket, boardSide}) {
    
    const state = useSelector(state => state.board);
    const dispatch = useDispatch();
    
    const toggleCondition = (e) => {

        if (boardSide === 'top') return;
        const exclusiveConditions =
        e === 'asleep' ? {confused: false, paralyzed: false} :
        e === 'confused' ? {asleep: false, paralyzed: false} :
        e === 'paralyzed' ? {asleep: false, confused: false} :            
        {};

        dispatch(update(['conditions', {...state[boardSide].conditions, [e]: !state[boardSide].conditions[e], ...exclusiveConditions}, boardSide]))
    }

    const leftConditions = [];
    const rightConditions = [];

    Object.keys(state[boardSide].conditions).forEach((e, i) => {
        let className = `${e} condition btn`;
        if (state[boardSide].conditions[e]) className += ' toggled-on';

        const condition = <div key={'condition-btn-' + i} className={className} onClick={() => {toggleCondition(e)}}>{e}</div>
        
        if (i < 2) leftConditions.push(condition)
        else rightConditions.push(condition);
    })

    return (
        <div className='special-conditions'>
            {state[boardSide].active.length > 0 && <div className='left-conditions'>{leftConditions}</div>}
            <RenderArray zone={'active'} {...({arr, socket, boardSide})}/>
            {state[boardSide].active.length > 0 && <div className='right-conditions'>{rightConditions}</div>}
        </div>
    )
}