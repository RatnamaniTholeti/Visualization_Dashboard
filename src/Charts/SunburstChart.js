import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Chart, registerables } from 'chart.js';

// Register the necessary components
Chart.register(...registerables);

// Utility function to generate a random color
const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

// Function to split array into chunks
const chunkArray = (array, size) => {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
};

const SunburstChart = () => {
    const chartRef = useRef(null);
    const [chartData, setChartData] = useState({ sectors: [], topics: [], sectorColors: [], topicColors: [] });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('https://visualisation-dashboard-server-final.vercel.app/api/data'); // Update with your API endpoint
                const data = response.data;

                // Process your data to extract hierarchical information
                const sectors = [];
                const topics = [];

                data.forEach(item => {
                    // Aggregate sectors
                    if (!sectors.find(sector => sector.label === item.sector)) {
                        sectors.push({ label: item.sector, value: 0 });
                    }
                    const sector = sectors.find(sector => sector.label === item.sector);
                    sector.value += 1;

                    // Aggregate topics
                    if (!topics.find(topic => topic.label === item.topic)) {
                        topics.push({ label: item.topic, value: 0 });
                    }
                    const topic = topics.find(topic => topic.label === item.topic);
                    topic.value += 1;
                });

                // Assign random colors to each sector and topic
                const sectorColors = sectors.map(() => getRandomColor());
                const topicColors = topics.map(() => getRandomColor());

                setChartData({ 
                    sectors, 
                    topics, 
                    sectorColors,
                    topicColors 
                });
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (chartRef.current) {
            const ctx = chartRef.current.getContext('2d');

            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    datasets: [
                        {
                            label: 'Sectors',
                            data: chartData.sectors.map(item => item.value),
                            backgroundColor: chartData.sectorColors,
                            borderWidth: 0,
                            cutout: '50%',
                        },
                        {
                            label: 'Topics',
                            data: chartData.topics.map(item => item.value),
                            backgroundColor: chartData.topicColors,
                            borderWidth: 0,
                            cutout: '35%',
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false, // Allow custom size
                    plugins: {
                        legend: {
                            display: false // Hide default legend to use custom legend
                        },
                        tooltip: {
                            callbacks: {
                                label: (context) => {
                                    const dataset = context.dataset;
                                    const index = context.dataIndex;
                                    const label = dataset.label || '';
                                    const value = context.raw;
                                    if (label === 'Sectors') {
                                        return `${label}: ${chartData.sectors[index].label} - ${value}`;
                                    } else if (label === 'Topics') {
                                        return `${label}: ${chartData.topics[index].label} - ${value}`;
                                    }
                                    return `${label}: ${value}`;
                                }
                            },
                            titleFont: { size: 16 }, // Font size for tooltip title
                            bodyFont: { size: 14 }   // Font size for tooltip body
                        }
                    },
                    layout: {
                        padding: 20 // Add padding around the chart
                    },
                    elements: {
                        arc: {
                            borderWidth: 0, // Remove border width for arcs
                        }
                    }
                }
            });

            return () => {
                if (chartRef.current) {
                    const chart = Chart.getChart(chartRef.current);
                    if (chart) {
                        chart.destroy();
                    }
                }
            };
        }
    }, [chartData]);

    // Split topics into chunks of 20
    const topicRows = chunkArray(chartData.topics, 20);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '80%', height: '600px' }}>
            <h2>Sunburst Chart</h2>
            <div style={{ width: '300px', height: '300px' }}>
                <canvas ref={chartRef}></canvas>
            </div>
            <div style={{ display: 'flex', marginTop: '2px', width: '100%' }}>
                <div style={{ flex: 1, padding: '0 10px' }}>
                    <h3>Sectors</h3>
                    {chartData.sectors.map((sector, index) => (
                        <div key={sector.label} style={{ display: 'flex', alignItems: 'center', marginBottom: '1px', fontSize: '5px' }}>
                            <div style={{ width: '5px', height: '5px', backgroundColor: chartData.sectorColors[index], marginRight: '1px' }}></div>
                            <span>{sector.label}</span>
                        </div>
                    ))}
                </div>
                <h3>Topics</h3>

                <div style={{ flex: 1, padding: '0 1px', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1px',position:'relative',right:'100px',top:'50px'}}>
                    {topicRows.map((row, rowIndex) => (
                        <div key={rowIndex} style={{ display: 'flex', flexDirection: 'column' }}>
                            {row.map((topic, index) => (
                                <div key={topic.label} style={{ display: 'flex',  marginBottom: '1px', fontSize: '5px' }}>
                                    <div style={{ width: '5px', height: '5px', backgroundColor: chartData.topicColors[index], marginRight: '5px' }}></div>
                                    <span>{topic.label}</span>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SunburstChart;
