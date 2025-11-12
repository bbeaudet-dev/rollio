import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SinglePlayerGame } from './ui/single-player';
import { MainMenu, SettingsPage } from './ui/menu';
import { CollectionPage } from './ui/collection';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main menu */}
        <Route path="/" element={<MainMenu />} />
        
        {/* Single player game */}
        <Route path="/game" element={<SinglePlayerGame />} />
        
        {/* Collection page */}
        <Route path="/collection" element={<CollectionPage />} />
        
        {/* Settings page */}
        <Route path="/settings" element={<SettingsPage />} />
        
        {/* Future routes */}
        {/* <Route path="/setup" element={<GameSetup />} /> */}
        
        {/* Redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App; 