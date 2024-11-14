import React, { useEffect, useRef, useState, useMemo } from 'react';
import Chart from 'chart.js/auto';
import debounce from 'lodash.debounce';

const LikelihoodAndRelevanceChart = () => {
    const [data, setData] = useState([]);
    const [filters, setFilters] = useState({
        country: '',
        sector: '',
        region: ''
    });
    const [options, setOptions] = useState({
        countryOptions: [],
        sectorOptions: [],
        regionOptions: []
    });
    const chartRef = useRef(null);

    useEffect(() => {
        fetch('https://visualisation-dashboard-server-final.vercel.app/api/data')
            .then(response => response.json())
            .then(data => {
                setData(data);

                const uniqueCountries = [...new Set(data.map(item => item.country))];
                const uniqueSectors = [...new Set(data.map(item => item.sector))];
                const uniqueRegions = [...new Set(data.map(item => item.region))];

                setOptions({
                    countryOptions: uniqueCountries,
                    sectorOptions: uniqueSectors,
                    regionOptions: uniqueRegions
                });
            })
            .catch(error => console.error('Error fetching likelihood and relevance data:', error));
    }, []);

    // Debounced filter change handler
    const handleFilterChange = debounce((name, value) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value
        }));
    }, 300); // Adjust delay as needed

    const filteredData = useMemo(() => {
        let filtered = data;
        if (filters.country) {
            filtered = filtered.filter(item => item.country === filters.country);
        }
        if (filters.sector) {
            filtered = filtered.filter(item => item.sector === filters.sector);
        }
        if (filters.region) {
            filtered = filtered.filter(item => item.region === filters.region);
        }
        return filtered;
    }, [data, filters]);

    useEffect(() => {
        if (filteredData.length > 0) {
            const labels = [...new Set(filteredData.map(item => item.country))];
            const likelihoodData = labels.map(country => {
                const item = filteredData.find(d => d.country === country);
                return item ? item.likelihood : 0;
            });
            const relevanceData = labels.map(country => {
                const item = filteredData.find(d => d.country === country);
                return item ? item.relevance : 0;
            });

            if (chartRef.current) {
                const ctx = chartRef.current.getContext('2d');

                // Destroy previous chart instance if it exists
                if (chartRef.current.chartInstance) {
                    chartRef.current.chartInstance.destroy();
                }

                // Create a new chart instance
                chartRef.current.chartInstance = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                label: 'Likelihood',
                                data: likelihoodData,
                                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                                borderColor: 'rgba(54, 162, 235, 1)',
                                borderWidth: 1,
                            },
                            {
                                label: 'Relevance',
                                data: relevanceData,
                                type: 'line',
                                fill: false,
                                borderColor: 'rgba(255, 99, 132, 1)',
                                borderWidth: 2,
                            },
                        ],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'top',
                            },
                        },
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'Country',
                                },
                                ticks: {
                                    autoSkip: false,
                                },
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: 'Value',
                                },
                                beginAtZero: true,
                            },
                        },
                    },
                });
            }
        }
    }, [filteredData]);

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Likelihood and Relevance by Country</h2>
            <form style={styles.filters}>
                <label style={styles.label}>
                    Country:
                    <select name="country" onChange={(e) => handleFilterChange('country', e.target.value)} style={styles.select}>
                        <option value="">All</option>
                        {options.countryOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </label>
                <label style={styles.label}>
                    Sector:
                    <select name="sector" onChange={(e) => handleFilterChange('sector', e.target.value)} style={styles.select}>
                        <option value="">All</option>
                        {options.sectorOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </label>
                <label style={styles.label}>
                    Region:
                    <select name="region" onChange={(e) => handleFilterChange('region', e.target.value)} style={styles.select}>
                        <option value="">All</option>
                        {options.regionOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </label>
            </form>
            <div style={styles.chartContainer}>
                <canvas ref={chartRef}></canvas>
            </div>
        </div>
    );
};

const styles = {
    container: {
        width: '100%',
        margin: '0 auto',
        padding: '2px',
    },
    title: {
        textAlign: 'center',
        marginBottom: '20px',
    },
    filters: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '20px',
    },
    label: {
        flex: '1',
        padding: '0 10px',
    },
    select: {
        width: '100%',
        padding: '4px',
        borderRadius: '4px',
        border: '1px solid #ccc',
    },
    chartContainer: {
        height: '400px',
    },
};

export default LikelihoodAndRelevanceChart;
