import { QueryClient, QueryClientProvider } from 'react-query';
import { HomProvider } from './context/HomContext';
import { Router } from './router';

const queryClient = new QueryClient();

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <HomProvider>
        <Router />
      </HomProvider>
    </QueryClientProvider>
  );
};

export default App;
