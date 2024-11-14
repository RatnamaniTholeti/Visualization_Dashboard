import React from 'react';
import RelavanceByRegion from './Charts/RelavanceByRegion';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import PolarAreaChartIntensity from './Charts/PolarAreaChartIntensity';
import LikelihoodChart from './Charts/LikelihoodChart';
import YearChart from './Charts/YearChart';
import CountryChart from './Charts/CountryChart';
import TopicsChart from './Charts/TopicsChart';
import RegionChart from './Charts/RegionChart';
import IntensityAreaChart from './Charts/IntensityAreaChart';
import LikelihoodAndRelevanceChart from './Charts/LikelihoodAndRelevanceChart';
import TreeMapChart from './Charts/TreeMapChart';
import RadarChart from './Charts/RadarChart';
import HorizontalBarChart from './Charts/HorizontalBarChart';
import GaugeChart from './Charts/GaugeChart';
import SunburstChart  from './Charts/SunburstChart';
const App = () => {
  return (
    <div class='app'>
   <nav class="navbar  bg-secondary-subtle fixed-top">
  <div class="container-fluid">
    <a class="navbar-brand" href="#">LLLLLLLLLLLLLLLLLLLL    Visualization Dashboard</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasDarkNavbar" aria-controls="offcanvasDarkNavbar" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
  </div>
  <div className="sidebar">
            <div className="profile-section">
                <img
                    src="https://via.placeholder.com/100" // Replace with your profile photo URL
                    alt="Profile"
                    className="profile-photo"
                />
                <h2>Dashboard</h2> {/* Replace with dynamic name if needed */}
            </div>
            <nav className="nav-menu">
                <ul>
                    <li><a href="#home">Home</a></li>
                    <li><a href="#about">About</a></li>
                    <li><a href="#services">Services</a></li>
                    <li><a href="#contact">Contact</a></li>
                </ul>
            </nav>
        </div>
</nav>
      <header>
        <h1>Energy Data Dashboard</h1>
      </header>
      <div className="sidebar">
            <div className="profile-section">
                <img
                    src="https://via.placeholder.com/100" // Replace with your profile photo URL
                    alt="Profile"
                    className="profile-photo"
                />
                <h2>Dashboard</h2> {/* Replace with dynamic name if needed */}
            </div>
            <nav className="nav-menu">
                <ul>
                    <li><a href="#home">Home</a></li>
                    <li><a href="#about">About</a></li>
                    <li><a href="#services">Services</a></li>
                    <li><a href="#contact">Contact</a></li>
                </ul>
            </nav>
        </div>
     
<main className="grid-container">
     

    <div className="grid-item medium"><RelavanceByRegion /></div>
    <div className="grid-item small "><GaugeChart /></div> 
    <div className="grid-item extralarge"><IntensityAreaChart /></div> 
    <div className="grid-item small"><CountryChart /></div>
    <div className="grid-item small"><RadarChart/></div>
    <div className="grid-item small"><PolarAreaChartIntensity /></div>  
    <div className="grid-item small"><RegionChart /></div> 
    <div className="grid-item small"><TopicsChart/></div>    
    <div className="grid-item small"><YearChart/></div>   
    <div className="grid-item extralarge"><LikelihoodAndRelevanceChart/></div>
    <div className="grid-item medium "><LikelihoodChart /></div> 
    <div className="grid-item small "><TreeMapChart /></div> 
    <div className="grid-item medium"><HorizontalBarChart/></div>
    <div className="grid-item small"><SunburstChart/></div>
    
     



  </main>

    </div>
  );
};

export default App;
