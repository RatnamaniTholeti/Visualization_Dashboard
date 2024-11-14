import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Chart } from 'chart.js/auto';

const YearChart = () => {
    const [yearData, setYearData] = useState([]);
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
                setYearData(response.data);
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
        if (!loading && yearData.length > 0) {
            // Apply filters to the data
            let filtered = yearData;
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

            const yearCounts = filtered.reduce((acc, item) => {
                acc[item.start_year] = (acc[item.start_year] || 0) + 1;
                return acc;
            }, {});

            const labels = Object.keys(yearCounts);
            const data = Object.values(yearCounts);

            chartInstanceRef.current = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Number of Reports by Year',
                        data: data,
                        backgroundColor: 'rgba(153, 102, 255, 0.2)',
                        borderColor: 'rgba(153, 102, 255, 1)',
                        borderWidth: 1,
                        fill: false,
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Year'
                            },
                            ticks: {
                                font: {
                                    size: 12
                                }
                            }
                        },
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1,
                                font: {
                                    size: 12
                                }
                            },
                            title: {
                                display: true,
                                text: 'Number of Reports'
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'Reports By Year',
                            padding: {
                                top: 10,
                                bottom: 30
                            }
                        },
                        legend: {
                            position: 'top'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(tooltipItem) {
                                    return `Reports: ${tooltipItem.raw}`;
                                }
                            }
                        }
                    }
                }
            });

            return () => {
                chartInstanceRef.current.destroy();
            };
        }
    }, [loading, yearData, filters]);

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
            <h2 style={styles.title}>Reports By Year</h2>
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
                <canvas id="yearChart" ref={chartRef}></canvas>
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

export default YearChart;
