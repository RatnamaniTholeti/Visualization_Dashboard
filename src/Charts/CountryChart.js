import React, { useEffect, useState } from 'react';
import Chart from 'chart.js/auto';

// Function to generate a random color
const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

const CountryChart = () => {
    const [countryData, setCountryData] = useState([]);
    const [filters, setFilters] = useState({
        endYear: '',
        topics: '',
        sector: '',
        region: '',
        pest: '',
        source: '',
        swot: '',
        country: '',
        city: ''
    });

    const [options, setOptions] = useState({
        endYearOptions: [],
        topicsOptions: [],
        sectorOptions: [],
        regionOptions: [],
        pestOptions: [],
        sourceOptions: [],
        swotOptions: [],
        countryOptions: []
        
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('https://visualisation-dashboard-server-final.vercel.app/api/data')
            .then(response => response.json())
            .then(data => {
                setCountryData(data);
                setLoading(false);

                // Extract unique options for each filter
                const uniqueOptions = {
                    endYearOptions: [...new Set(data.map(item => item.end_year))],
                    topicsOptions: [...new Set(data.map(item => item.topic))],
                    sectorOptions: [...new Set(data.map(item => item.sector))],
                    regionOptions: [...new Set(data.map(item => item.region))],
                    pestOptions: [...new Set(data.map(item => item.pestle))],
                    sourceOptions: [...new Set(data.map(item => item.source))],
                    countryOptions: [...new Set(data.map(item => item.country))],
                    
                };

                setOptions(uniqueOptions);
            })
            .catch(error => {
                setError(error);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (countryData.length > 0) {
            // Apply filters to data
            let filteredData = countryData;

            if (filters.endYear) filteredData = filteredData.filter(item => item.end_year === filters.endYear);
            if (filters.topics) filteredData = filteredData.filter(item => item.topic === filters.topics);
            if (filters.sector) filteredData = filteredData.filter(item => item.sector === filters.sector);
            if (filters.region) filteredData = filteredData.filter(item => item.region === filters.region);
            if (filters.pest) filteredData = filteredData.filter(item => item.pestle === filters.pest);
            if (filters.source) filteredData = filteredData.filter(item => item.source === filters.source);
            if (filters.swot) filteredData = filteredData.filter(item => item.swot === filters.swot);
            if (filters.country) filteredData = filteredData.filter(item => item.country === filters.country);
            

            // Get unique countries and count their occurrences
            const countryOccurrences = filteredData.reduce((acc, item) => {
                acc[item.country] = (acc[item.country] || 0) + 1;
                return acc;
            }, {});

            const labels = Object.keys(countryOccurrences);
            const data = Object.values(countryOccurrences);

            // Generate a color for each country
            const backgroundColors = labels.map(() => getRandomColor());
            const borderColors = backgroundColors.map(color => color);

            const countryChart = new Chart(document.getElementById('countryChart'), {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Country',
                        data: data,
                        backgroundColor: backgroundColors,
                        borderColor: borderColors,
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false, // Hide the legend
                        },
                        tooltip: {
                            callbacks: {
                                label: () => '' // Hide the tooltips
                            }
                        }
                    }
                }
            });

            // Cleanup on unmount
            return () => {
                countryChart.destroy();
            };
        }
    }, [countryData, filters]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value
        }));
    };

    if (loading) {
        return <div style={styles.message}>Loading...</div>;
    }

    if (error) {
        return <div style={styles.message}>Error: {error.message}</div>;
    }

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Country Chart</h2>
            <form style={styles.filters}>
                {Object.keys(options).map((key) => (
                    <label key={key} style={styles.label}>
                        {key.replace('Options', '')}:
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
                <canvas id="countryChart"></canvas>
            </div>
        </div>
    );
};

const styles = {
    container: {
        width: '100%',
        margin: '0 auto',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#f9f9f9'
    },
    title: {
        textAlign: 'center',
        marginBottom: '20px',
        color: '#333',
        fontSize: '24px',
        fontWeight: 'bold'
    },
    filters: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        marginBottom: '20px'
    },
    label: {
        flex: '1',
        minWidth: '50px',
        display: 'flex',
        flexDirection: 'column'
    },
    select: {
        width: '100%',
        padding: '8px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        height: '40px'
    },
    chartContainer: {
        position: 'relative',
        height: '300px',
        width: '100%'
    },
    message: {
        textAlign: 'center',
        color: '#333',
        fontSize: '18px',
        padding: '20px'
    }
};

export default CountryChart;
