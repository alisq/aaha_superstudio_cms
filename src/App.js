
import FiltersList from './components/filtersList';
import SubmissionList from './components/submissionList';
import './css/main.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <FiltersList />
      
      </header>
      <SubmissionList />
    </div>
  );
}

export default App;
