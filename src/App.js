import {BrowserRouter, Routes, Route} from 'react-router-dom';

import Gameroom from './pages/Gameroom';
import MatchMaker from './pages/MatchMaker/MatchMaker';

function App() {

  return (
    <div className="App"
    onContextMenu={e => {e.preventDefault()}}
    >
      <BrowserRouter>
        <div className='pages'>
          <Routes>
            <Route
              path='/poké-decks'
              element={<MatchMaker />}
            />
            <Route 
              path='/poké-decks/:id'
              element={<Gameroom />}
            />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;
