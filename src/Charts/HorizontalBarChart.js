import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import Chart from 'chart.js/auto';

const HorizontalBarChart = () => {
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: []
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('https://visualisation-dashboard-server-final.vercel.app/api/data'); // Update with your API endpoint
                const data = response.data;

                const countries = [...new Set(data.map(item => item.country))];
                const countryData = countries.map(country => {
                    return {
                        country,
                        count: data.filter(item => item.country === country).length
                    };
                }).filter(item => item.count >= 5);  // Filter out countries with less than 10 reports

                setChartData({
                    labels: countryData.map(item => item.country),
                    datasets: [
                        {
                            label: 'Number of Reports by Country',
                            data: countryData.map(item => item.count),
                            backgroundColor: 'rgba(75, 192, 192, 0.6)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1,
                        }
                    ]
                });
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <div style={{ width: '700px', height: '550px' }}> {/* Adjust the size here */}
            <h2>Reports Distribution by Country</h2>
            <Bar
                data={chartData}
                options={{
                    indexAxis: 'y', // This makes the bar chart horizontal
                    scales: {
                        x: {
                            beginAtZero: true,
                        }
                    },
                    responsive: true,
                    maintainAspectRatio: false,
                }}
                width={900} // Adjust the chart width
                height={700} // Adjust the chart height
            />
        </div>
    );
};

export default HorizontalBarChart;
