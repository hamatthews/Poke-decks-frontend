import {update, clearSelected} from '../redux/board';


export default function clickCard (event, cardObj, index, zone, socket, boardSide, state, dispatch) {

    const normClick = (event.button === 0 && !event.shiftKey);
    const shiftClick = (event.button === 0 && event.shiftKey);
    const rightClick = (event.button === 2 && !event.shiftKey);

    const allCards = Object.values(state.mySelected.cards).reduce((a, b) => a.concat(b), []);

    const curr = clickZone => {
        return Object.keys(state.mySelected.cards).includes(clickZone);
    }

    let target = event.target;

    const stat = event.target.classList.contains('evolutions') ? 'pokemon'
        : event.target.classList.contains('energies') ? 'energy'
        : event.target.classList.contains('tools') ? 'tool'
        : undefined
    const statArr = state[boardSide][zone].filter(e => state[boardSide].cardList[e].cardType === stat);
    index = stat ? state[boardSide][zone].indexOf(statArr[0]) : index;

    if (allCards.includes(state[boardSide][zone][index])
    && state.mySelected.cards[zone]
    && state.mySelected.boardSide === boardSide
    && !event.target.classList.contains('btn')
    && !event.target.classList.contains('hp-input')    
    && !state.heldClick) {

        if (normClick && allCards.length === 1) {
            dispatch(update(['mySelected', {
                cards: {
                    ...state.mySelected.cards,
                    [zone]: zone === 'deck' && state[boardSide].deckSearch.count ? [...state[boardSide][zone].slice(0, state[boardSide].deckSearch.count)].reverse() : stat ? statArr.reverse() : zone === 'hand' || zone === 'prize' ? state[boardSide][zone] : [...state[boardSide][zone]].reverse()
                },
                currentZone: zone,
                boardSide
            }]));
            return;
        }
    }

    while (!target.classList.contains('card-sized-slot')
    && !target.classList.contains('enlarged-card')
    && !target.classList.contains('stat')) {
        target = target.parentNode;
    }

    if (cardObj) {
        // mySelected
            let cards = {
                [zone]: [state[boardSide][zone][index]] 
            };
            let currentZone = zone;

            if (shiftClick || (normClick && state.heldClick)) {
                const prevCards = {...state.mySelected.cards};
                let zoneList = prevCards[zone];
                const sliceIndex = zoneList ? zoneList.findIndex(e => e === state[boardSide][zone][index]) : undefined;

                if (zoneList) {
                    // shift unselect
                    if (zoneList.includes(state[boardSide][zone][index]) && !state.heldClick && boardSide === state.mySelected.boardSide) {
                        zoneList = [...zoneList.slice(0, sliceIndex), ...zoneList.slice(sliceIndex + 1)];
                        if (zoneList.length === 0) {
                            delete prevCards[zone];
                            currentZone = Object.keys(prevCards)[Object.keys(prevCards).length - 1];
                        }
                        
                        if (!Object.keys(prevCards).length) {
                            dispatch(clearSelected());
                            return;
                        }
                    }
                    else if (!zoneList.includes(state[boardSide][zone][index])) {
                        zoneList = [...zoneList, state[boardSide][zone][index]];
                    }
                }
                else zoneList = [state[boardSide][zone][index]];

                cards = boardSide === state.mySelected.boardSide && zoneList.length
                ? {
                    ...prevCards,
                    [zone]: zoneList
                }
                : prevCards
            };

            dispatch(update(['mySelected', {cards, currentZone, boardSide}]))
    }

    if (rightClick && boardSide === 'bottom' && state.mySelected.boardSide === 'bottom') {           
        if ((zone === 'field' && state[boardSide].field.length) || (zone === 'field' && allCards.length > 1)
        || (zone === 'prize' && !(state.mySelected.currentZone === 'prize' && Object.keys(state.mySelected.cards).length === 1)
        && state[boardSide].prize.length + allCards.length > 6)) return;

        // removing card from old zone
            const slicedArrs = {};
            for (let zone in state.mySelected.cards) {
                if (!slicedArrs[zone]) slicedArrs[zone] = state[boardSide][zone];

                slicedArrs[zone] = slicedArrs[zone].map(e => {
                    return (state.mySelected.cards[zone].includes(e))
                    ? undefined
                    : e;
                });
            };

            for (let zone in slicedArrs) {
                slicedArrs[zone] = slicedArrs[zone].filter(e => e !== undefined);
            }

            // adding card to new zone
            let selection = Object.values(state.mySelected.cards).reduce((a, b) => a.concat(b), []);

            const amorph = curr(zone);

            let arr;
            if (amorph) {
                arr = [...slicedArrs[zone]];

                for (let card of selection) {
                    arr.splice(index, 0, card);
                }
            }
            else if (zone === 'hand') {
                arr = [...state[boardSide][zone]];
                arr.splice(index, 0, ...selection);                
            }
            else {
                arr = [...state[boardSide][zone]];
                for (let card of selection) {
                    arr.splice(index, 0, card);
                }
            }

            let sortedCard = arr[0];
            if (zone === 'active' || zone.startsWith('bench')) {
                arr = [
                    ...arr.filter(e => state[boardSide].cardList[e].cardType === 'pokemon'),
                    ...arr.filter(e => state[boardSide].cardList[e].cardType === 'trainer'),
                    ...arr.filter(e => state[boardSide].cardList[e].cardType === 'energy'),
                    ...arr.filter(e => state[boardSide].cardList[e].cardType === 'tool')     
                ];
                index = arr.findIndex(e => e === sortedCard);
            }
            
            dispatch(update(['bottom', {...state[boardSide], ...slicedArrs}]));
            dispatch(update([zone, arr, boardSide]));
            dispatch(update(['mySelected', {cards: {[zone]: selection}, currentZone: zone, boardSide}]));

            // sets a pokemon's damage value when it's placed on top of a damaged pokemon in active or bench
            if ((zone === 'active' || zone.startsWith('bench'))
            && state[boardSide][zone].some(e => state[boardSide].cardList[e].damage)) {
                let cardList = [...state[boardSide].cardList].map(e => ({...e}));
                const damage = state[boardSide].cardList[state[boardSide][zone].find(e => state[boardSide].cardList[e].damage)].damage;

                selection.forEach(e => {
                    cardList[e].damage = damage;
                });

                dispatch(update(['cardList', cardList, boardSide]));
            }

            // resets health when a card from active or bench is moved to any other zone
            if ((curr('active') || curr('bench1') || curr('bench2') || curr('bench3') || curr('bench4') || curr('bench5'))
            && zone !== 'active' && !zone.startsWith('bench')) {
                let cardList = [...state[boardSide].cardList].map(e => ({...e}));

                selection.forEach(e => {
                    cardList[e].damage = 0;
                });

                dispatch(update(['cardList', cardList, boardSide]));
            }

        // send message that card was moved
            const time = Date.now();            
                
                let zoneNamesArr = [];
                Object.keys(state.mySelected.cards).forEach((e) => {
                    if (e.startsWith('bench')) e = 'bench';
                    if (!zoneNamesArr.includes(e)) zoneNamesArr.push(e);
                })

                const zoneNames = zoneNamesArr.length === 1
                ? zoneNamesArr[0]
                : zoneNamesArr.slice(0, -1).join(', ') + ' and ' + zoneNamesArr.slice(-1)

                const message =
                `moved ${allCards.length} card${allCards.length > 1 ? 's' : ''} from ${curr('deck') && state[boardSide].deck.slice(0, state.mySelected.cards.deck.length).every(e => state.mySelected.cards.deck.includes(e)) ? state[boardSide].deckSearch.topOrBottom.toLowerCase() + ' of ' : ''}${zoneNames} to ${zone === 'deck' ? state[boardSide].deckSearch.topOrBottom.toLowerCase() + ' of ' : ''}${zone.startsWith('bench') ? 'bench' : zone}.`

                if (zoneNamesArr.length === 1 && (zoneNamesArr.includes(zone)
                || (zoneNamesArr.includes('active') || zoneNamesArr.includes('bench'))
                && (zone === 'active' || zone.startsWith('bench')))) {
                }
                else {
                    let urls = [];
                    if (state.gamePhase.host !== 'setup' && state.gamePhase.opp !== 'setup'
                    && curr('deck') && state[boardSide].deckSearch.view && zone !== 'deck') {
                        urls = state.mySelected.cards.deck.map(e => state[boardSide].cardList[e].url);
                    }
                    dispatch(update(['myGameLog', [...state.myGameLog, {time, message, messageType: 'game', urls, hostOrOpp: state.hostOrOpp}]]));
                }


            // if your opponent has selected one of your cards, and you move that card, the following code clears that selection
            if (allCards.some(e => Object.values(state.theirSelected.cards).reduce((a, b) => a.concat(b), []).includes(e))
            && state.theirSelected.boardSide === boardSide) {
                socket.emit('clearTheirSelected');
            }     
    };
};