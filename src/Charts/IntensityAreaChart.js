import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import axios from 'axios';

const IntensityAreaChart = () => {
    const [intensityData, setIntensityData] = useState({ countries: [], intensities: [] });
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
        countryOptions: [],
        cityOptions: []
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const chartRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('https://visualisation-dashboard-server-final.vercel.app/api/data');
                const data = response.data;
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
                    cityOptions: [...new Set(data.map(item => item.city))]
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
                if (filters.city) filteredData = filteredData.filter(item => item.city === filters.city);

                // Process data to remove duplicates and keep maximum intensity
                const processedData = filteredData.reduce((acc, item) => {
                    if (!acc[item.country] || item.intensity > acc[item.country].intensity) {
                        acc[item.country] = { intensity: item.intensity };
                    }
                    return acc;
                }, {});

                // Convert processed data to arrays
                const countries = Object.keys(processedData);
                const intensities = countries.map(country => processedData[country].intensity);

                setIntensityData({ countries, intensities });
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        };

        fetchData();
    }, [filters]);

    useEffect(() => {
        if (intensityData.countries.length > 0) {
            const { countries, intensities } = intensityData;

            // Destroy the previous chart instance if it exists
            if (chartRef.current) {
                chartRef.current.destroy();
            }

            // Create a new chart instance
            const ctx = document.getElementById('intensityByCountryChart').getContext('2d');
            chartRef.current = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: countries,
                    datasets: [{
                        label: 'Intensity by Country',
                        data: intensities,
                        backgroundColor: 'rgba(54, 162, 235, 0.2)', // Light blue fill
                        borderColor: 'rgba(54, 162, 235, 1)', // Dark blue border
                        borderWidth: 2,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                font: {
                                    size: 14
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function (tooltipItem) {
                                    return `${tooltipItem.label}: ${tooltipItem.raw}`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Country'
                            },
                            ticks: {
                                font: {
                                    size: 8
                                },
                                autoSkip: false
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Intensity'
                            },
                            ticks: {
                                font: {
                                    size: 12
                                },
                                beginAtZero: true
                            }
                        }
                    },
                    layout: {
                        padding: {
                            left: 5,
                            right: 5,
                            top: 2,
                            bottom: 35
                        }
                    }
                }
            });

            // Cleanup function to destroy the chart instance on component unmount
            return () => {
                if (chartRef.current) {
                    chartRef.current.destroy();
                    chartRef.current = null;
                }
            };
        }
    }, [intensityData]);

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
            <h2 style={styles.title}>Intensity by Country</h2>
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
                <canvas id="intensityByCountryChart" style={{ height: '100%', width: '100%' }}></canvas>
            </div>
        </div>
    );
};

const styles = {
    container: {
        width: '100%',
        margin: '0 auto',
        padding: '2px',
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
        height: '500px',
        width: '100%'
    },
    message: {
        textAlign: 'center',
        color: '#333',
        fontSize: '18px',
        padding: '20px'
    }
};

export default IntensityAreaChart;
