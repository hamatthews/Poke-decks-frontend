import {useSelector, useDispatch} from 'react-redux';
import {update} from '../../redux/board'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlassPlus } from '@fortawesome/free-solid-svg-icons'


export default function CardZoomBtn ({image}) {
    const dispatch = useDispatch();

    const hiRes = image.slice(0, -5) + '_hires.png';

    return (
        <div className='card-zoom-btn btn' onClick={() => dispatch(update(['popupScreen', hiRes]))}>
            <FontAwesomeIcon
                icon={faMagnifyingGlassPlus}
                style={{color: 'white', width: '15px', pointerEvents: 'none'}}
            />
        </div>
    )
}