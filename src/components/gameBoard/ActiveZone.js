import {useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {update, clearSelected} from '../../redux/board';
import ZoneBanner from './ZoneBanner';
import Conditions from './Conditions';


export default function ActiveZone ({arr, socket, boardSide}) {
    const state = useSelector(state => state.board);
    const dispatch = useDispatch();

    return (
        <div className={'active zone ' + boardSide}>
                <Conditions {...({arr, socket, boardSide})}/>
            <ZoneBanner zone='active' {...({boardSide})}/>
        </div>
    )
}
