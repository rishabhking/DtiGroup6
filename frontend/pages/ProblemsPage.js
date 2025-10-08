import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProblemsPage = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    tags: '',
    minRating: '',
    maxRating: '',
    search: ''
  });

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://codeforces.com/api/problemset.problems');
      let filteredProblems = response.data.result.problems;

      // Apply filters
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredProblems = filteredProblems.filter(p => 
          p.name.toLowerCase().includes(searchTerm)
        );
      }
      
      if (filters.tags) {
        const tagList = filters.tags.toLowerCase().split(',').map(t => t.trim());
        filteredProblems = filteredProblems.filter(p => 
          tagList.every(tag => p.tags.includes(tag))
        );
      }

      if (filters.minRating) {
        filteredProblems = filteredProblems.filter(p => 
          p.rating && p.rating >= parseInt(filters.minRating)
        );
      }

      if (filters.maxRating) {
        filteredProblems = filteredProblems.filter(p => 
          p.rating && p.rating <= parseInt(filters.maxRating)
        );
      }

      setProblems(filteredProblems);
    } catch (error) {
      console.error('Error fetching problems:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Codeforces Problems</h1>
      
      {/* Filters Section */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '10px',
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <input
          type="text"
          name="search"
          placeholder="Search problems..."
          value={filters.search}
          onChange={handleFilterChange}
          style={{ padding: '8px' }}
        />
        <input
          type="text"
          name="tags"
          placeholder="Tags (comma-separated)"
          value={filters.tags}
          onChange={handleFilterChange}
          style={{ padding: '8px' }}
        />
        <input
          type="number"
          name="minRating"
          placeholder="Min Rating"
          value={filters.minRating}
          onChange={handleFilterChange}
          style={{ padding: '8px' }}
        />
        <input
          type="number"
          name="maxRating"
          placeholder="Max Rating"
          value={filters.maxRating}
          onChange={handleFilterChange}
          style={{ padding: '8px' }}
        />
        <button 
          onClick={fetchProblems}
          style={{
            padding: '8px',
            backgroundColor: '#1a73e8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Apply Filters
        </button>
      </div>

      {/* Problems List */}
      {loading ? (
        <div>Loading problems...</div>
      ) : (
        <div style={{
          display: 'grid',
          gap: '10px'
        }}>
          {problems.map((problem) => (
            <div
              key={`${problem.contestId}-${problem.index}`}
              style={{
                padding: '15px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: '10px',
                alignItems: 'center'
              }}
            >
              <div>
                <a
                  href={`https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ 
                    color: '#1a73e8',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    fontSize: '1.1em'
                  }}
                >
                  {problem.name}
                </a>
                <div style={{ color: '#666', marginTop: '5px' }}>
                  <span>Rating: {problem.rating || 'Unrated'}</span>
                  <span style={{ margin: '0 10px' }}>•</span>
                  <span>Tags: {problem.tags.join(', ')}</span>
                </div>
              </div>
              <button
                onClick={() => window.open(`https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`, '_blank')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#34a853',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Solve
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProblemsPage;
