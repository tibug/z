import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/common/Layout';
import { OrganizationsPage } from './components/pages/OrganizationsPage';
import { OrganizationDetailPage } from './components/pages/OrganizationDetailPage';
import { PeoplePage } from './components/pages/PeoplePage';
import { PersonDetailPage } from './components/pages/PersonDetailPage';
import { HomePage } from './components/pages/HomePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="organizations" element={<OrganizationsPage />} />
            <Route path="organizations/:permalink" element={<OrganizationDetailPage />} />
            <Route path="people" element={<PeoplePage />} />
            <Route path="people/:permalink" element={<PersonDetailPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
