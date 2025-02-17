import React, { useEffect, useState, useRef } from 'react';
import Chart from 'chart.js/auto';

const RegionChart = () => {
    const [regionData, setRegionData] = useState([]);
    const [filters, setFilters] = useState({
        endYear: '',
        topics: '',
        sector: '',
        region: '',
        pest: '',
        source: '',
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
        countryOptions: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('https://visualisation-dashboard-server-final.vercel.app/api/data');
                const data = await response.json();
                setLoading(false);

                // Extract unique options for each filter
                const uniqueOptions = {
                    endYearOptions: [...new Set(data.map(item => item.end_year))],
                    topicsOptions: [...new Set(data.map(item => item.topic))],
                    sectorOptions: [...new Set(data.map(item => item.sector))],
                    regionOptions: [...new Set(data.map(item => item.region))],
                    pestOptions: [...new Set(data.map(item => item.pestle))],
                    sourceOptions: [...new Set(data.map(item => item.source))],
                    countryOptions: [...new Set(data.map(item => item.country))]
                };

                setOptions(uniqueOptions);

                // Apply filters to data
                let filteredData = data;

                if (filters.endYear) filteredData = filteredData.filter(item => item.end_year === filters.endYear);
                if (filters.topics) filteredData = filteredData.filter(item => item.topic === filters.topics);
                if (filters.sector) filteredData = filteredData.filter(item => item.sector === filters.sector);
                if (filters.region) filteredData = filteredData.filter(item => item.region === filters.region);
                if (filters.pest) filteredData = filteredData.filter(item => item.pestle === filters.pest);
                if (filters.source) filteredData = filteredData.filter(item => item.source === filters.source);
                if (filters.country) filteredData = filteredData.filter(item => item.country === filters.country);

                // Map the data to the format needed by the bubble chart
                const dataForChart = filteredData.map(item => ({
                    x: item.intensity,
                    y: item.likelihood,
                    r: item.relevance
                }));

                // Destroy the previous chart instance if it exists
                if (chartInstance.current) {
                    chartInstance.current.destroy();
                }

                // Initialize the bubble chart
                chartInstance.current = new Chart(chartRef.current, {
                    type: 'bubble',
                    data: {
                        datasets: [{
                            label: 'Region Data',
                            data: dataForChart,
                            backgroundColor: 'rgba(54, 162, 235, 0.2)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'top',
                                display: true
                            },
                            tooltip: {
                                callbacks: {
                                    label: function (context) {
                                        return `Intensity: ${context.raw.x}, Likelihood: ${context.raw.y}, Relevance: ${context.raw.r}`;
                                    }
                                }
                            }
                        },
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'Intensity'
                                }
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: 'Likelihood'
                                }
                            }
                        }
                    }
                });

            } catch (error) {
                setError(error);
                setLoading(false);
            }
        };

        fetchData();
    }, [filters]);

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
            <h2 style={styles.title}>Region Chart</h2>
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
                <canvas ref={chartRef} style={{ height: '300px', width: '100%' }}></canvas>
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

export default RegionChart;
