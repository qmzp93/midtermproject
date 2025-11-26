import { HomProvider } from './context/HomContext';
import { Router } from './router';

export const App = () => {
  return (
    <HomProvider>
      <Router />
    </HomProvider>
  );
};

export default App;
