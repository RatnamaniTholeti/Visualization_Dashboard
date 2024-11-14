import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import axios from 'axios';

const GaugeChart = () => {
    const intensityRef = useRef(null);
    const relevanceRef = useRef(null);
    const likelihoodRef = useRef(null);

    const [intensity, setIntensity] = useState(0);
    const [relevance, setRelevance] = useState(0);
    const [likelihood, setLikelihood] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('https://visualisation-dashboard-server-final.vercel.app/api/data'); // Update with your API endpoint
                const data = response.data;

                const totalIntensity = data.reduce((sum, item) => sum + item.intensity, 0) / data.length;
                const totalRelevance = data.reduce((sum, item) => sum + item.relevance, 0) / data.length;
                const totalLikelihood = data.reduce((sum, item) => sum + item.likelihood, 0) / data.length;

                setIntensity(totalIntensity);
                setRelevance(totalRelevance);
                setLikelihood(totalLikelihood);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const createGaugeChart = (ref, value, label, color) => {
        if (ref.current) {
            const ctx = ref.current.getContext('2d');

            const gaugeChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    datasets: [{
                        data: [value, 10 - value],
                        backgroundColor: [color, '#E0E0E0'],
                        borderWidth: 0
                    }]
                },
                options: {
                    circumference: 180,
                    rotation: 270,
                    cutout: '80%',
                    plugins: {
                        tooltip: { enabled: false },
                        legend: { display: false },
                        title: {
                            display: true,
                            text: `${label}: ${value.toFixed(2)}%`,
                            position: 'bottom',
                            font: { size: 16 }
                        }
                    }
                }
            });

            return gaugeChart;
        }
    };

    useEffect(() => {
        const intensityChart = createGaugeChart(intensityRef, intensity, 'Intensity', '#36A2EB');
        const relevanceChart = createGaugeChart(relevanceRef, relevance, 'Relevance', '#FF6384');
        const likelihoodChart = createGaugeChart(likelihoodRef, likelihood, 'Likelihood', '#FFCE56');

        return () => {
            if (intensityChart) intensityChart.destroy();
            if (relevanceChart) relevanceChart.destroy();
            if (likelihoodChart) likelihoodChart.destroy();
        };
    }, [intensity, relevance, likelihood]);

    return (
        <div>
            <div style={{ width: '300px', height: '150px' }}>
                <canvas ref={intensityRef}></canvas>
            </div>
            <div style={{ width: '300px', height: '150px', paddingLeft: '70px' }}>
                <canvas ref={relevanceRef}></canvas>
            </div>
            <div style={{ width: '300px', height: '150px', paddingLeft: '150px' }}>
                <canvas ref={likelihoodRef}></canvas>
            </div>
        </div>
    );
};

export default GaugeChart;
