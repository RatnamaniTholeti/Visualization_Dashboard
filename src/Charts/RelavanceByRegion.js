import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Chart } from 'chart.js/auto';

const RelevanceByRegion = () => {
  // State to store the fetched data
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    endYear: '',
    topics: '',
    sector: '',
    region: '',
    pest: '',
    source: '',
    country: ''
  });

  const [options, setOptions] = useState({
    endYearOptions: [],
    topicsOptions: [],
    sectorOptions: [],
    regionOptions: [],
    pestOptions: [],
    sourceOptions: [],
    countryOptions: []
  });

  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    axios.get('https://visualisation-dashboard-server-final.vercel.app/api/data')
      .then(response => {
        setData(response.data);
        setFilteredData(response.data); // Initialize filteredData with the fetched data

        // Extract unique options for each filter
        const uniqueOptions = {
          endYearOptions: [...new Set(response.data.map(item => item.end_year))],
          topicsOptions: [...new Set(response.data.map(item => item.topic))],
          sectorOptions: [...new Set(response.data.map(item => item.sector))],
          regionOptions: [...new Set(response.data.map(item => item.region))],
          pestOptions: [...new Set(response.data.map(item => item.pestle))],
          sourceOptions: [...new Set(response.data.map(item => item.source))],
          countryOptions: [...new Set(response.data.map(item => item.country))]
        };

        setOptions(uniqueOptions);
        setLoading(false);
      })
      .catch(error => {
        setError(error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!loading && data.length > 0) {
      // Apply filters to the data
      let filtered = data;
      if (filters.endYear) filtered = filtered.filter(item => item.end_year === filters.endYear);
      if (filters.topics) filtered = filtered.filter(item => item.topic === filters.topics);
      if (filters.sector) filtered = filtered.filter(item => item.sector === filters.sector);
      if (filters.region) filtered = filtered.filter(item => item.region === filters.region);
      if (filters.pest) filtered = filtered.filter(item => item.pestle === filters.pest);
      if (filters.source) filtered = filtered.filter(item => item.source === filters.source);
      if (filters.country) filtered = filtered.filter(item => item.country === filters.country);

      setFilteredData(filtered);

      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');

      const aggregatedData = filtered.reduce((acc, item) => {
        const existing = acc.find(i => i.region === item.region);
        if (existing) {
          existing.relevance += item.relevance;
        } else {
          acc.push({ region: item.region, relevance: item.relevance });
        }
        return acc;
      }, []);

      const labels = aggregatedData.map(item => item.region);
      const values = aggregatedData.map(item => item.relevance);

      chartInstanceRef.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            data: values,
            backgroundColor: '#36A2EB',
            borderColor: '#FF6384',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Relevance by Region',
              padding: {
                top: 10,
                bottom: 30
              }
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Region'
              },
              ticks: {
                font: {
                  size: 12
                }
              }
            },
            y: {
              title: {
                display: true,
                text: 'Relevance'
              },
              ticks: {
                font: {
                  size: 12
                }
              }
            }
          }
        }
      });
    }
  }, [loading, data, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;
  if (error) return <div style={styles.error}>Error: {error.message}</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Relevance by Region</h2>
      <form style={styles.filters}>
        {Object.keys(options).map((key) => (
          <label key={key} style={styles.label}>
            {key.replace(/Options$/, '')}:
            <select name={key.replace('Options', '')} value={filters[key.replace('Options', '')]} onChange={handleFilterChange} style={styles.select}>
              <option value="">All</option>
              {options[key].map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
        ))}
      </form>
      <div style={styles.chartContainer}>
        <canvas id="barChart" ref={chartRef}></canvas>
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    margin: '0 auto',
    padding: '2px'
  },
  title: {
    textAlign: 'center',
    marginBottom: '20px',
    color: '#333'
  },
  filters: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '5px',
    marginBottom: '2px'
  },
  label: {
    flex: '1',
    minWidth: '100px'
  },
  select: {
    width: '100%',
    padding: '2px', // Decreased padding to reduce height
    marginTop: '5px',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  chartContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center'
  },
  loading: {
    textAlign: 'center',
    fontSize: '18px',
    color: '#333'
  },
  error: {
    textAlign: 'center',
    fontSize: '18px',
    color: 'red'
  }
};

export default RelevanceByRegion;
