/* ============================================
   GLW RESEARCH DASHBOARD — JAVASCRIPT
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // === NAV SCROLL BEHAVIOR ===
  const nav = document.getElementById('navbar');
  const sections = document.querySelectorAll('.section, .hero');
  const navLinks = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
    // Active nav link
    let current = '';
    sections.forEach(s => {
      const top = s.offsetTop - 100;
      if (window.scrollY >= top) current = s.getAttribute('id');
    });
    navLinks.forEach(l => {
      l.classList.remove('active');
      if (l.getAttribute('href') === '#' + current) l.classList.add('active');
    });
  });

  // === REVEAL ON SCROLL ===
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealElements.forEach(el => revealObserver.observe(el));

  // === ANIMATED NUMBER COUNTERS ===
  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    if (!target && target !== 0) return;
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const duration = 1200;
    const start = performance.now();
    const decimals = target % 1 !== 0 ? 2 : 0;

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      el.textContent = prefix + current.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  // Observe KPI values
  const kpiValues = document.querySelectorAll('.kpi-value[data-target], .metric-value[data-target]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  kpiValues.forEach(el => counterObserver.observe(el));

  // === TIMELINE STAGES ===
  const stages = document.querySelectorAll('.timeline-stage');
  const stageDetails = document.querySelectorAll('.stage-detail');
  stages.forEach(stage => {
    stage.addEventListener('click', () => {
      const num = stage.dataset.stage;
      stages.forEach(s => s.classList.remove('active'));
      stage.classList.add('active');
      stageDetails.forEach(d => d.classList.remove('visible'));
      document.getElementById('stage-detail-' + num).classList.add('visible');
    });
  });

  // === SOTP CHART + TOGGLE ===
  const sotpData = {
    segments: ['Optical\nComms', 'Display\nTech', 'Specialty\n(Gorilla)', 'Semi\nGlass', 'Environ.', 'Life Sci.', 'Hemlock\n/Emerging'],
    bear:  [46.2, 11.2, 5.5, 3.0, 3.5, 1.8, 0.9],
    base:  [73.5, 14.4, 7.2, 4.5, 4.5, 2.4, 1.5],
    bull:  [105.0, 17.6, 9.9, 7.5, 5.5, 3.0, 2.3],
    prices: { bear: '$74', base: '$116', bull: '$166' },
    totalEV: { bear: '$72.1B', base: '$108.0B', bull: '$150.8B' },
    upside: { bear: '-46%', base: '-15%', bull: '+22%' }
  };

  const chartColors = ['#1B3A5C', '#4A7FB5', '#D4A574', '#A84B2F', '#8B6F47', '#C17D54', '#2E5A88'];
  const semiGlassColor = '#A84B2F';

  const sotpCtx = document.getElementById('sotpChart').getContext('2d');
  const sotpChart = new Chart(sotpCtx, {
    type: 'bar',
    data: {
      labels: sotpData.segments,
      datasets: [{
        label: 'Enterprise Value ($B)',
        data: sotpData.base,
        backgroundColor: chartColors.map((c, i) => i === 3 ? semiGlassColor : c),
        borderColor: chartColors.map((c, i) => i === 3 ? '#7A3420' : c),
        borderWidth: 1,
        borderRadius: 4,
        barPercentage: 0.7,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0F2440',
          titleFont: { family: "'Source Sans 3', sans-serif", weight: '700' },
          bodyFont: { family: "'Inter', sans-serif" },
          padding: 12,
          callbacks: {
            label: ctx => '$' + ctx.parsed.y.toFixed(1) + 'B'
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(27,58,92,0.06)' },
          ticks: {
            callback: v => '$' + v + 'B',
            font: { family: "'Inter', sans-serif", size: 11 },
            color: '#6B7280'
          }
        },
        x: {
          grid: { display: false },
          ticks: {
            font: { family: "'Inter', sans-serif", size: 10 },
            color: '#6B7280',
            maxRotation: 0,
          }
        }
      },
      animation: { duration: 800, easing: 'easeOutQuart' }
    }
  });

  // SOTP controls
  document.querySelectorAll('.sotp-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sotp-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const scenario = btn.dataset.scenario;
      sotpChart.data.datasets[0].data = sotpData[scenario];
      sotpChart.update('active');
      document.getElementById('sotp-total-ev').textContent = sotpData.totalEV[scenario];
      document.getElementById('sotp-price').textContent = sotpData.prices[scenario];
      document.getElementById('sotp-upside').textContent = sotpData.upside[scenario];
    });
  });

  // === SEGMENT DOUGHNUT ===
  const segCtx = document.getElementById('segmentDoughnut').getContext('2d');
  new Chart(segCtx, {
    type: 'doughnut',
    data: {
      labels: ['Optical Comms', 'Display Tech', 'Specialty Materials', 'Environmental', 'Life Sciences', 'Hemlock/Emerging'],
      datasets: [{
        data: [6.27, 3.59, 2.21, 1.73, 0.97, 0.86],
        backgroundColor: ['#1B3A5C', '#4A7FB5', '#A84B2F', '#D4A574', '#8B6F47', '#C17D54'],
        borderWidth: 2,
        borderColor: '#FFFFFF',
        hoverOffset: 8,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '62%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 14,
            usePointStyle: true,
            pointStyleWidth: 10,
            font: { family: "'Inter', sans-serif", size: 11 },
            color: '#6B7280'
          }
        },
        tooltip: {
          backgroundColor: '#0F2440',
          padding: 12,
          callbacks: {
            label: ctx => {
              const val = ctx.parsed;
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
              const pct = ((val / total) * 100).toFixed(0);
              return ctx.label + ': $' + val.toFixed(2) + 'B (' + pct + '%)';
            }
          }
        }
      },
      animation: { animateRotate: true, duration: 1000 }
    }
  });

  // === REVENUE TREND LINE ===
  const trendCtx = document.getElementById('revenueTrend').getContext('2d');
  new Chart(trendCtx, {
    type: 'line',
    data: {
      labels: ['2021', '2022', '2023', '2024', '2025'],
      datasets: [
        {
          label: 'Total Revenue',
          data: [14.08, 14.19, 12.59, 13.12, 15.63],
          borderColor: '#1B3A5C',
          backgroundColor: 'rgba(27,58,92,0.08)',
          fill: true,
          tension: 0.3,
          pointRadius: 5,
          pointBackgroundColor: '#1B3A5C',
          borderWidth: 2.5,
        },
        {
          label: 'Optical Comms',
          data: [4.35, 5.01, 4.41, 4.65, 6.27],
          borderColor: '#A84B2F',
          backgroundColor: 'rgba(168,75,47,0.08)',
          fill: true,
          tension: 0.3,
          pointRadius: 5,
          pointBackgroundColor: '#A84B2F',
          borderWidth: 2.5,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            usePointStyle: true,
            pointStyleWidth: 10,
            font: { family: "'Inter', sans-serif", size: 11 },
            color: '#6B7280'
          }
        },
        tooltip: {
          backgroundColor: '#0F2440',
          padding: 12,
          callbacks: { label: ctx => ctx.dataset.label + ': $' + ctx.parsed.y.toFixed(2) + 'B' }
        }
      },
      scales: {
        y: {
          grid: { color: 'rgba(27,58,92,0.06)' },
          ticks: {
            callback: v => '$' + v + 'B',
            font: { size: 11 },
            color: '#6B7280'
          }
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: 11 }, color: '#6B7280' }
        }
      },
      animation: { duration: 1000 }
    }
  });

  // === REVENUE GROWTH CHART ===
  const revGrowthCtx = document.getElementById('revenueGrowthChart').getContext('2d');
  new Chart(revGrowthCtx, {
    type: 'bar',
    data: {
      labels: ['2021', '2022', '2023', '2024', '2025', '2026E', '2027E', '2028E'],
      datasets: [{
        label: 'Revenue ($B)',
        data: [14.08, 14.19, 12.59, 13.12, 15.63, 18.8, 21.4, 23.9],
        backgroundColor: [
          '#1B3A5C', '#1B3A5C', '#1B3A5C', '#1B3A5C', '#1B3A5C',
          'rgba(27,58,92,0.4)', 'rgba(27,58,92,0.3)', 'rgba(27,58,92,0.2)'
        ],
        borderColor: [
          '#1B3A5C', '#1B3A5C', '#1B3A5C', '#1B3A5C', '#1B3A5C',
          '#1B3A5C', '#1B3A5C', '#1B3A5C'
        ],
        borderWidth: [0, 0, 0, 0, 0, 2, 2, 2],
        borderDash: [0, 0, 0, 0, 0, [5,3], [5,3], [5,3]],
        borderRadius: 4,
        barPercentage: 0.65,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0F2440',
          padding: 12,
          callbacks: {
            label: ctx => {
              const suffix = ctx.dataIndex >= 5 ? ' (Estimate)' : '';
              return '$' + ctx.parsed.y.toFixed(1) + 'B' + suffix;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(27,58,92,0.06)' },
          ticks: { callback: v => '$' + v + 'B', font: { size: 11 }, color: '#6B7280' }
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: 11 }, color: '#6B7280' }
        }
      },
      animation: { duration: 800 }
    }
  });

  // === EPS GROWTH CHART ===
  const epsGrowthCtx = document.getElementById('epsGrowthChart').getContext('2d');
  new Chart(epsGrowthCtx, {
    type: 'bar',
    data: {
      labels: ['2021', '2022', '2023', '2024', '2025', '2026E', '2027E', '2028E'],
      datasets: [{
        label: 'EPS ($)',
        data: [1.30, 1.56, 0.69, 0.59, 1.86, 5.09, 6.44, 7.50],
        backgroundColor: [
          '#A84B2F', '#A84B2F', '#A84B2F', '#A84B2F', '#A84B2F',
          'rgba(168,75,47,0.4)', 'rgba(168,75,47,0.3)', 'rgba(168,75,47,0.2)'
        ],
        borderColor: '#A84B2F',
        borderWidth: [0, 0, 0, 0, 0, 2, 2, 2],
        borderRadius: 4,
        barPercentage: 0.65,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0F2440',
          padding: 12,
          callbacks: {
            label: ctx => {
              const suffix = ctx.dataIndex >= 5 ? ' (Estimate)' : '';
              return '$' + ctx.parsed.y.toFixed(2) + suffix;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(27,58,92,0.06)' },
          ticks: { callback: v => '$' + v.toFixed(2), font: { size: 11 }, color: '#6B7280' }
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: 11 }, color: '#6B7280' }
        }
      },
      animation: { duration: 800 }
    }
  });

  // === P/E COMPRESSION CHART ===
  const peCtx = document.getElementById('peCompressionChart').getContext('2d');
  new Chart(peCtx, {
    type: 'line',
    data: {
      labels: ['FY2025A (TTM)', 'FY2026E', 'FY2027E', 'FY2028E'],
      datasets: [
        {
          label: 'P/E Multiple',
          data: [74.29, 26.7, 21.1, 18.1],
          borderColor: '#1B3A5C',
          backgroundColor: 'rgba(27,58,92,0.05)',
          fill: true,
          tension: 0.35,
          pointRadius: 8,
          pointBackgroundColor: '#1B3A5C',
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 3,
          pointHoverRadius: 10,
          borderWidth: 3,
        },
        {
          label: 'EPS ($)',
          data: [1.86, 5.09, 6.44, 7.50],
          borderColor: '#A84B2F',
          backgroundColor: 'rgba(168,75,47,0.05)',
          fill: true,
          tension: 0.35,
          pointRadius: 8,
          pointBackgroundColor: '#A84B2F',
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 3,
          pointHoverRadius: 10,
          borderWidth: 3,
          yAxisID: 'y1',
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          labels: {
            usePointStyle: true,
            font: { family: "'Inter', sans-serif", size: 12 },
            color: '#6B7280'
          }
        },
        tooltip: {
          backgroundColor: '#0F2440',
          padding: 14,
          titleFont: { size: 13, weight: '700' },
          bodyFont: { size: 12 },
        }
      },
      scales: {
        y: {
          position: 'left',
          grid: { color: 'rgba(27,58,92,0.06)' },
          ticks: {
            callback: v => v + 'x',
            font: { size: 11 },
            color: '#1B3A5C'
          },
          title: {
            display: true,
            text: 'P/E Multiple',
            font: { size: 11, weight: '600' },
            color: '#1B3A5C'
          }
        },
        y1: {
          position: 'right',
          grid: { display: false },
          ticks: {
            callback: v => '$' + v.toFixed(2),
            font: { size: 11 },
            color: '#A84B2F'
          },
          title: {
            display: true,
            text: 'EPS ($)',
            font: { size: 11, weight: '600' },
            color: '#A84B2F'
          }
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: 12, weight: '600' }, color: '#6B7280' }
        }
      },
      animation: { duration: 1200 }
    }
  });

  // === RADAR CHART (MOAT) ===
  const radarCtx = document.getElementById('radarChart').getContext('2d');
  new Chart(radarCtx, {
    type: 'radar',
    data: {
      labels: ['Process IP', 'Material\nFormulations', 'Customer\nLock-in', 'Scale &\nManufacturing', 'Patent\nPosition'],
      datasets: [
        {
          label: 'Corning',
          data: [95, 90, 65, 92, 55],
          borderColor: '#1B3A5C',
          backgroundColor: 'rgba(27,58,92,0.15)',
          borderWidth: 2.5,
          pointRadius: 5,
          pointBackgroundColor: '#1B3A5C',
        },
        {
          label: 'AGC',
          data: [60, 80, 40, 55, 40],
          borderColor: '#A84B2F',
          backgroundColor: 'rgba(168,75,47,0.1)',
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: '#A84B2F',
        },
        {
          label: 'SCHOTT',
          data: [55, 60, 35, 40, 35],
          borderColor: '#D4A574',
          backgroundColor: 'rgba(212,165,116,0.1)',
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: '#D4A574',
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            font: { family: "'Inter', sans-serif", size: 12 },
            color: '#6B7280',
            padding: 16,
          }
        },
        tooltip: {
          backgroundColor: '#0F2440',
          padding: 12,
        }
      },
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: {
            stepSize: 25,
            display: false,
          },
          grid: { color: 'rgba(27,58,92,0.08)' },
          angleLines: { color: 'rgba(27,58,92,0.08)' },
          pointLabels: {
            font: { family: "'Inter', sans-serif", size: 11, weight: '500' },
            color: '#6B7280'
          }
        }
      },
      animation: { duration: 1000 }
    }
  });

  // === CATALYST EVENTS ===
  const catEvents = document.querySelectorAll('.cat-event');
  const catDetailBox = document.getElementById('catDetailBox');
  const catDetailText = document.getElementById('catDetailText');
  const catClose = document.getElementById('catClose');

  catEvents.forEach(ev => {
    ev.addEventListener('click', () => {
      catDetailText.textContent = ev.dataset.info;
      catDetailBox.classList.add('active');
    });
  });

  catClose.addEventListener('click', () => {
    catDetailBox.classList.remove('active');
  });

  // === RISK MATRIX EXPAND ===
  document.querySelectorAll('.risk-item').forEach(item => {
    // Create mitigation div if it doesn't exist
    if (!item.querySelector('.risk-mitigation')) {
      const mitDiv = document.createElement('div');
      mitDiv.className = 'risk-mitigation';
      mitDiv.innerHTML = '<strong>Mitigation:</strong> ' + item.dataset.mitigation;
      item.appendChild(mitDiv);
    }
    item.addEventListener('click', () => {
      const isExpanded = item.classList.contains('expanded');
      document.querySelectorAll('.risk-item').forEach(r => r.classList.remove('expanded'));
      if (!isExpanded) item.classList.add('expanded');
    });
  });

  // === SUPPLY CHAIN TOOLTIPS ===
  const tooltip = document.getElementById('tooltip');
  document.querySelectorAll('.sc-company[data-tooltip]').forEach(comp => {
    comp.addEventListener('mouseenter', (e) => {
      tooltip.textContent = comp.dataset.tooltip;
      tooltip.classList.add('active');
    });
    comp.addEventListener('mousemove', (e) => {
      tooltip.style.left = e.clientX + 12 + 'px';
      tooltip.style.top = e.clientY - 12 + 'px';
    });
    comp.addEventListener('mouseleave', () => {
      tooltip.classList.remove('active');
    });
  });

  // === OPTION BAR ANIMATION ===
  const optionBars = document.querySelectorAll('.option-bar--potential .option-bar-fill');
  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.width = '65%';
        barObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  optionBars.forEach(bar => {
    bar.style.width = '0%';
    barObserver.observe(bar);
  });

});
