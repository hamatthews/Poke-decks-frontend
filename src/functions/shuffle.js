import {update, clearSelected} from '../redux/board';

export default function shuffle(arr, state, dispatch, e) {
    if (arr.length === 0) return;
    
    let shuffledArr = Array(arr.length - 1);
    arr.forEach(e => {
        let randomIndex = Math.floor(Math.random()*arr.length);
        shuffledArr.splice(randomIndex, 0, e);
    });

    shuffledArr = shuffledArr.filter(e => e !== undefined);

    if (e) {
        if (e.target.classList.contains('deck-btn')) {
            dispatch(update(['mySelected', {...state.mySelected, cards: {...state.mySelected.cards, deck: shuffledArr}, currentZone: 'deck'}]));
        }
        else if (e.target.classList.contains('prize-btn')) {
            dispatch(clearSelected());
        };
    };
    
    return shuffledArr;
};
