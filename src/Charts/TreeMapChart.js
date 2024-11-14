import React, { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { TreemapController, TreemapElement } from 'chartjs-chart-treemap';

// Register necessary components
Chart.register(...registerables, TreemapController, TreemapElement);

const TreeMapChart = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const chartRef = useRef(null);
    const canvasRef = useRef(null);

    // Function to generate a random color
    const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('https://visualisation-dashboard-server-final.vercel.app/api/data');
                const result = await response.json();

                // Filter and map data to remove undefined topics and intensities
                const filteredData = result
                    .filter(item => item.topic && item.intensity)
                    .map(item => ({
                        g: item.topic,
                        v: item.intensity,
                    }));

                setData(filteredData);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError(error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (loading || !canvasRef.current) return;

        const ctx = canvasRef.current.getContext('2d');

        // Destroy the previous chart instance if it exists
        if (chartRef.current) {
            chartRef.current.destroy();
        }

        // Generate a random color for each unique topic
        const topicColors = {};
        data.forEach(item => {
            if (!topicColors[item.g]) {
                topicColors[item.g] = getRandomColor();
            }
        });

        // Create a new chart instance
        chartRef.current = new Chart(ctx, {
            type: 'treemap',
            data: {
                datasets: [{
                    label: 'Topic Intensity',
                    tree: data,
                    key: 'v',
                    groups: ['g'],
                    backgroundColor: (ctx) => {
                        const topic = ctx.raw?.g;
                        return topicColors[topic] || '#ffffff'; // Default to white if color not found
                    },
                    borderColor: 'rgba(255, 255, 255, 1)',
                    borderWidth: 1,
                    labels: {
                        display: true,
                        formatter: (ctx) => `${ctx.raw.g}: ${ctx.raw.v}`,
                        color: '#fff',
                        font: {
                            size: 9, // Change this value to adjust the font size
                        }
                    }
                }]
            },
            options: {
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `${ctx.raw.g}: ${ctx.raw.v}`,
                        }
                    }
                },
                layout: {
                    padding: 5
                },
                responsive: true,
                maintainAspectRatio: false
            }
        });

        // Cleanup chart on component unmount
        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, [data, loading]);

    if (loading) return <div style={styles.loading}>Loading...</div>;
    if (error) return <div style={styles.error}>Error: {error.message}</div>;

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Intensity By Topic</h2>
            <div style={styles.chartContainer}>
                <canvas ref={canvasRef} id="treemapChart"></canvas>
            </div>
        </div>
    );
};

const styles = {
    container: {
        width: '100%',
        margin: '0 auto',
        padding: '20px'
    },
    title: {
        textAlign: 'center',
        marginBottom: '20px',
        color: '#333'
    },
    chartContainer: {
        position: 'relative',
        height: '400px',
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

export default TreeMapChart;
