import React, { useEffect, useState, useRef } from 'react';
import { Radar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import axios from 'axios';

const RadarChart = () => {
    const chartRef = useRef(null);

    const [chartData, setChartData] = useState({
        labels: [],
        datasets: []
    });

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
                

                const topics = [...new Set(filteredData.map(item => item.topic))];
                const relevanceData = topics.map(topic => {
                    const topicData = filteredData.filter(item => item.topic === topic);
                    return topicData.reduce((sum, item) => sum + item.relevance, 0) / topicData.length;
                });

                setChartData({
                    labels: topics,
                    datasets: [
                        {
                            label: 'Relevance by Topic',
                            data: relevanceData,
                            backgroundColor: 'rgba(54, 162, 235, 0.2)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1,
                        }
                    ]
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
            <h2 style={styles.title}>Relevance By Topic</h2>
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
                <Radar
                    ref={chartRef}
                    data={chartData}
                    options={{
                        scales: {
                            r: {
                                pointLabels: {
                                    font: {
                                        size: 6,  // Adjust label size here
                                    }
                                },
                                ticks: {
                                    beginAtZero: true,
                                }
                            }
                        }
                    }}
                />
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

export default RadarChart;
